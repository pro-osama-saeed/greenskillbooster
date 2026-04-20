import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { usePanelBase } from "@/lib/usePanelBase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, Plus, Save, Trash2, PackageCheck } from "lucide-react";
import { calcLine, calcTotals, formatPKR, TaxMode } from "@/lib/tax";

interface Vendor { id: string; name: string }
interface Item { id: string; item_code: string; name: string; unit: string; last_rate: number }
interface TaxRule { id: string; code: string; name: string; rate: number; is_active: boolean }

interface LineRow {
  item_id: string | null;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  tax_rule_id: string | null;
  tax_rate: number;
}

const PurchaseOrderEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = usePanelBase();
  const isNew = !id || id === "new";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [taxes, setTaxes] = useState<TaxRule[]>([]);

  const [docNo, setDocNo] = useState("");
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("draft");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState<TaxMode>("exclusive");
  const [lines, setLines] = useState<LineRow[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: v }, { data: i }, { data: t }] = await Promise.all([
        supabase.from("vendors").select("id, name").order("name"),
        supabase.from("inventory_items").select("id, item_code, name, unit, last_rate").order("name"),
        supabase.from("tax_rules").select("id, code, name, rate, is_active").eq("is_active", true).order("code"),
      ]);
      setVendors(v ?? []);
      setItems(i ?? []);
      setTaxes((t ?? []) as TaxRule[]);

      if (!isNew) {
        const [{ data: doc }, { data: rows }] = await Promise.all([
          supabase.from("purchase_orders").select("*").eq("id", id!).maybeSingle(),
          supabase.from("purchase_order_items").select("*").eq("po_id", id!).order("position"),
        ]);
        if (doc) {
          setDocNo(doc.doc_no);
          setVendorId(doc.vendor_id);
          setIssueDate(doc.issue_date);
          setStatus(doc.status);
          setNotes(doc.notes ?? "");
        }
        setLines(
          (rows ?? []).map((r) => ({
            item_id: r.item_id, description: r.description,
            quantity: Number(r.quantity), unit: r.unit ?? "pcs",
            rate: Number(r.rate), tax_rule_id: r.tax_rule_id, tax_rate: Number(r.tax_rate),
          }))
        );
      } else {
        const { data: nextNo } = await supabase.rpc("generate_doc_no", { _doc_type: "po" });
        if (nextNo) setDocNo(nextNo as unknown as string);
      }
      setLoading(false);
    })();
  }, [id, isNew]);

  const totals = useMemo(
    () => calcTotals(lines.map((l) => ({ quantity: l.quantity, rate: l.rate, taxRate: l.tax_rate })), mode),
    [lines, mode]
  );

  const addBlankLine = () =>
    setLines((ls) => [...ls, { item_id: null, description: "", quantity: 1, unit: "pcs", rate: 0, tax_rule_id: null, tax_rate: 0 }]);

  const updateLine = (idx: number, patch: Partial<LineRow>) =>
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const removeLine = (idx: number) => setLines((ls) => ls.filter((_, i) => i !== idx));

  const pickItem = (idx: number, itemId: string) => {
    const it = items.find((x) => x.id === itemId);
    if (!it) return;
    updateLine(idx, { item_id: it.id, description: it.name, unit: it.unit, rate: Number(it.last_rate) || 0 });
  };

  const pickTax = (idx: number, taxId: string) => {
    if (taxId === "none") return updateLine(idx, { tax_rule_id: null, tax_rate: 0 });
    const tx = taxes.find((x) => x.id === taxId);
    if (!tx) return;
    updateLine(idx, { tax_rule_id: tx.id, tax_rate: Number(tx.rate) });
  };

  const save = async (newStatus?: string) => {
    if (!user) return toast.error("Not authenticated");
    if (!vendorId) return toast.error("Select a vendor");
    if (lines.length === 0) return toast.error("Add at least one line item");

    setSaving(true);
    const finalStatus = newStatus ?? status;

    const payload = {
      doc_type: "po",
      doc_no: docNo,
      vendor_id: vendorId,
      issue_date: issueDate,
      status: finalStatus,
      notes,
      subtotal: totals.subtotal,
      tax_total: totals.tax_total,
      grand_total: totals.grand_total,
    };

    let poId = id!;
    if (isNew) {
      const { data, error } = await supabase
        .from("purchase_orders")
        .insert({ ...payload, created_by: user.id })
        .select("id")
        .maybeSingle();
      if (error || !data) { setSaving(false); return toast.error(error?.message ?? "Save failed"); }
      poId = data.id;
    } else {
      const { error } = await supabase.from("purchase_orders").update(payload).eq("id", poId);
      if (error) { setSaving(false); return toast.error(error.message); }
      await supabase.from("purchase_order_items").delete().eq("po_id", poId);
    }

    const itemsPayload = lines.map((l, position) => {
      const c = calcLine({ quantity: l.quantity, rate: l.rate, taxRate: l.tax_rate }, mode);
      return {
        po_id: poId, item_id: l.item_id, description: l.description || "—",
        quantity: l.quantity, unit: l.unit, rate: l.rate,
        tax_rule_id: l.tax_rule_id, tax_rate: l.tax_rate,
        tax_amount: c.tax, line_total: c.gross, position,
      };
    });
    const { error: liErr } = await supabase.from("purchase_order_items").insert(itemsPayload);
    if (liErr) { setSaving(false); return toast.error(liErr.message); }

    setSaving(false);
    toast.success(`Purchase order ${isNew ? "created" : "updated"}`);
    if (isNew) navigate(`${base}/purchase-orders/${poId}`);
    else setStatus(finalStatus);
  };

  if (loading) {
    return <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(`${base}/purchase-orders`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="font-display text-3xl font-bold mt-1">
            Purchase order <span className="text-muted-foreground font-mono text-lg">{docNo}</span>
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!isNew && status !== "received" && (
            <Button variant="secondary" size="sm" onClick={() => save("received")} disabled={saving}>
              <PackageCheck className="h-4 w-4 mr-1" /> Mark as received
            </Button>
          )}
          <Button variant="hero" size="sm" onClick={() => save()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Save</>}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 rounded-xl border bg-card p-5 shadow-card">
        <div className="space-y-1.5">
          <Label>Vendor *</Label>
          <Select value={vendorId ?? ""} onValueChange={setVendorId}>
            <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
            <SelectContent>
              {vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Issue date</Label>
          <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Tax mode</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as TaxMode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="exclusive">Exclusive (added)</SelectItem>
              <SelectItem value="inclusive">Inclusive (in price)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Item</TableHead>
              <TableHead className="min-w-[180px]">Description</TableHead>
              <TableHead className="w-24 text-right">Qty</TableHead>
              <TableHead className="w-32 text-right">Rate</TableHead>
              <TableHead className="w-40">Tax</TableHead>
              <TableHead className="w-32 text-right">Line total</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((l, idx) => {
              const c = calcLine({ quantity: l.quantity, rate: l.rate, taxRate: l.tax_rate }, mode);
              return (
                <TableRow key={idx}>
                  <TableCell>
                    <Select value={l.item_id ?? ""} onValueChange={(v) => pickItem(idx, v)}>
                      <SelectTrigger><SelectValue placeholder="Pick item" /></SelectTrigger>
                      <SelectContent>
                        {items.map((it) => (
                          <SelectItem key={it.id} value={it.id}>
                            <span className="font-mono text-xs mr-2">{it.item_code}</span>{it.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input value={l.description} onChange={(e) => updateLine(idx, { description: e.target.value })} placeholder="Description" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" step="0.001" value={l.quantity} onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })} className="text-right tabular-nums" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" step="0.01" value={l.rate} onChange={(e) => updateLine(idx, { rate: Number(e.target.value) })} className="text-right tabular-nums" />
                  </TableCell>
                  <TableCell>
                    <Select value={l.tax_rule_id ?? "none"} onValueChange={(v) => pickTax(idx, v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— No tax —</SelectItem>
                        {taxes.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.code} ({t.rate}%)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatPKR(c.gross)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeLine(idx)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell colSpan={7}>
                <Button variant="outline" size="sm" onClick={addBlankLine}>
                  <Plus className="h-4 w-4 mr-1" /> Add line
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Delivery terms, expected date…" />
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{formatPKR(totals.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="tabular-nums">{formatPKR(totals.tax_total)}</span></div>
          <div className="flex justify-between border-t pt-2 font-semibold text-base"><span>Grand total</span><span className="tabular-nums">{formatPKR(totals.grand_total)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderEditor;
