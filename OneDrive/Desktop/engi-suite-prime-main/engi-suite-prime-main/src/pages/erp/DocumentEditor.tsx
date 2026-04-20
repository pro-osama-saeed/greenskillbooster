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
import { ArrowLeft, Loader2, Plus, Save, Trash2, Send, FileSymlink, Printer } from "lucide-react";
import { calcLine, calcTotals, formatPKR, TaxMode } from "@/lib/tax";

type DocType = "quotation" | "bill" | "invoice" | "challan";

interface Client { id: string; name: string }
interface Item { id: string; item_code: string; name: string; unit: string; last_rate: number }
interface TaxRule { id: string; code: string; name: string; rate: number; is_active: boolean }

interface LineRow {
  id?: string;
  item_id: string | null;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  tax_rule_id: string | null;
  tax_rate: number;
}

const TITLES: Record<DocType, string> = {
  quotation: "Quotation",
  invoice: "Invoice",
  bill: "Bill",
  challan: "Delivery challan",
};

const DocumentEditor = () => {
  const { type, id } = useParams<{ type: DocType; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = usePanelBase();
  const docType = (type ?? "quotation") as DocType;
  const isNew = !id || id === "new";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [taxes, setTaxes] = useState<TaxRule[]>([]);

  const [docNo, setDocNo] = useState<string>("");
  const [clientId, setClientId] = useState<string | null>(null);
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<string>("draft");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState<TaxMode>("exclusive");
  const [lines, setLines] = useState<LineRow[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: c }, { data: i }, { data: t }] = await Promise.all([
        supabase.from("clients").select("id, name").order("name"),
        supabase.from("inventory_items").select("id, item_code, name, unit, last_rate").order("name"),
        supabase.from("tax_rules").select("id, code, name, rate, is_active").eq("is_active", true).order("code"),
      ]);
      setClients(c ?? []);
      setItems(i ?? []);
      setTaxes((t ?? []) as TaxRule[]);

      if (!isNew) {
        const [{ data: doc }, { data: rows }] = await Promise.all([
          supabase.from("documents").select("*").eq("id", id!).maybeSingle(),
          supabase.from("document_items").select("*").eq("document_id", id!).order("position"),
        ]);
        if (doc) {
          setDocNo(doc.doc_no);
          setClientId(doc.client_id);
          setIssueDate(doc.issue_date);
          setStatus(doc.status);
          setNotes(doc.notes ?? "");
        }
        setLines(
          (rows ?? []).map((r) => ({
            id: r.id, item_id: r.item_id, description: r.description,
            quantity: Number(r.quantity), unit: r.unit ?? "pcs",
            rate: Number(r.rate), tax_rule_id: r.tax_rule_id, tax_rate: Number(r.tax_rate),
          }))
        );
      } else {
        const { data: nextNo } = await supabase.rpc("generate_doc_no", { _doc_type: docType });
        if (nextNo) setDocNo(nextNo as unknown as string);
      }
      setLoading(false);
    })();
  }, [id, isNew, docType]);

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
    updateLine(idx, {
      item_id: it.id,
      description: it.name,
      unit: it.unit,
      rate: Number(it.last_rate) || 0,
    });
  };

  const pickTax = (idx: number, taxId: string) => {
    if (taxId === "none") {
      updateLine(idx, { tax_rule_id: null, tax_rate: 0 });
      return;
    }
    const tx = taxes.find((x) => x.id === taxId);
    if (!tx) return;
    updateLine(idx, { tax_rule_id: tx.id, tax_rate: Number(tx.rate) });
  };

  const save = async (newStatus?: string) => {
    if (!user) return toast.error("Not authenticated");
    if (!clientId) return toast.error("Select a client");
    if (lines.length === 0) return toast.error("Add at least one line item");

    setSaving(true);
    const finalStatus = newStatus ?? status;

    const docPayload = {
      doc_type: docType,
      doc_no: docNo,
      client_id: clientId,
      issue_date: issueDate,
      status: finalStatus,
      notes,
      subtotal: totals.subtotal,
      tax_total: totals.tax_total,
      grand_total: totals.grand_total,
    };

    let documentId = id!;
    if (isNew) {
      const { data, error } = await supabase
        .from("documents")
        .insert({ ...docPayload, created_by: user.id })
        .select("id")
        .maybeSingle();
      if (error || !data) { setSaving(false); return toast.error(error?.message ?? "Save failed"); }
      documentId = data.id;
    } else {
      const { error } = await supabase.from("documents").update(docPayload).eq("id", documentId);
      if (error) { setSaving(false); return toast.error(error.message); }
      await supabase.from("document_items").delete().eq("document_id", documentId);
    }

    const itemsPayload = lines.map((l, position) => {
      const c = calcLine({ quantity: l.quantity, rate: l.rate, taxRate: l.tax_rate }, mode);
      return {
        document_id: documentId,
        item_id: l.item_id,
        description: l.description || "—",
        quantity: l.quantity,
        unit: l.unit,
        rate: l.rate,
        tax_rule_id: l.tax_rule_id,
        tax_rate: l.tax_rate,
        tax_amount: c.tax,
        line_total: c.gross,
        position,
      };
    });
    const { error: liErr } = await supabase.from("document_items").insert(itemsPayload);
    if (liErr) { setSaving(false); return toast.error(liErr.message); }

    // Capture rate snapshots for inventory items
    const snapshots = lines
      .filter((l) => l.item_id)
      .map((l) => ({
        item_id: l.item_id!,
        client_id: clientId,
        document_type: docType,
        document_id: documentId,
        rate: l.rate,
        quantity: l.quantity,
        recorded_by: user.id,
      }));
    if (snapshots.length) await supabase.from("item_rate_history").insert(snapshots);

    setSaving(false);
    toast.success(`${TITLES[docType]} ${isNew ? "created" : "updated"}`);
    if (isNew) navigate(`${base}/documents/${docType}/${documentId}`);
    else setStatus(finalStatus);
  };

  const convertTo = async (targetType: DocType) => {
    if (isNew) return toast.error("Save first");
    const { data: nextNo } = await supabase.rpc("generate_doc_no", { _doc_type: targetType });
    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        doc_type: targetType,
        doc_no: nextNo as unknown as string,
        client_id: clientId,
        issue_date: new Date().toISOString().slice(0, 10),
        status: "draft",
        notes,
        subtotal: totals.subtotal,
        tax_total: totals.tax_total,
        grand_total: totals.grand_total,
        converted_from: id!,
        created_by: user!.id,
      })
      .select("id")
      .maybeSingle();
    if (error || !newDoc) return toast.error(error?.message ?? "Convert failed");

    const itemsPayload = lines.map((l, position) => {
      const c = calcLine({ quantity: l.quantity, rate: l.rate, taxRate: l.tax_rate }, mode);
      return {
        document_id: newDoc.id,
        item_id: l.item_id,
        description: l.description,
        quantity: l.quantity,
        unit: l.unit,
        rate: l.rate,
        tax_rule_id: l.tax_rule_id,
        tax_rate: l.tax_rate,
        tax_amount: c.tax,
        line_total: c.gross,
        position,
      };
    });
    await supabase.from("document_items").insert(itemsPayload);
    toast.success(`Converted to ${targetType}`);
    navigate(`${base}/documents/${targetType}/${newDoc.id}`);
  };

  if (loading) {
    return <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(`${base}/${docType === "quotation" ? "quotations" : docType === "invoice" ? "invoices" : docType === "bill" ? "bills" : "challans"}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="font-display text-3xl font-bold mt-1">
            {TITLES[docType]} <span className="text-muted-foreground font-mono text-lg">{docNo}</span>
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!isNew && docType === "quotation" && (
            <>
              <Button variant="outline" size="sm" onClick={() => convertTo("invoice")}>
                <FileSymlink className="h-4 w-4 mr-1" /> Convert to invoice
              </Button>
              <Button variant="outline" size="sm" onClick={() => convertTo("bill")}>
                <FileSymlink className="h-4 w-4 mr-1" /> Convert to bill
              </Button>
              <Button variant="outline" size="sm" onClick={() => convertTo("challan")}>
                <FileSymlink className="h-4 w-4 mr-1" /> Convert to challan
              </Button>
            </>
          )}
          {!isNew && (
            <Button variant="outline" size="sm" onClick={() => navigate(`${base}/documents/${docType}/${id}/print`)}>
              <Printer className="h-4 w-4 mr-1" /> Print / PDF
            </Button>
          )}
          {status === "draft" && !isNew && (
            <Button variant="secondary" size="sm" onClick={() => save("sent")} disabled={saving}>
              <Send className="h-4 w-4 mr-1" /> Mark as sent
            </Button>
          )}
          <Button variant="hero" size="sm" onClick={() => save()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Save</>}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 rounded-xl border bg-card p-5 shadow-card">
        <div className="space-y-1.5">
          <Label>Client *</Label>
          <Select value={clientId ?? ""} onValueChange={setClientId}>
            <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
            <SelectContent>
              {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
              <SelectItem value="paid">Paid</SelectItem>
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
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Terms, validity, payment instructions…" />
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

export default DocumentEditor;
