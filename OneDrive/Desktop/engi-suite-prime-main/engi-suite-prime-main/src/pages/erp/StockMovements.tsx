import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePanelBase } from "@/lib/usePanelBase";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/erp/PageHeader";
import EmptyState from "@/components/erp/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowDownCircle, ArrowUpCircle, History, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Movement {
  id: string;
  item_id: string;
  movement_type: "issue" | "receipt" | "adjustment" | "reversal";
  quantity: number;
  document_id: string | null;
  document_type: string | null;
  document_no: string | null;
  notes: string | null;
  created_at: string;
}
interface Item { id: string; item_code: string; name: string; unit: string }

const TYPE_META: Record<Movement["movement_type"], { label: string; cls: string; sign: string }> = {
  issue:      { label: "Issue",      cls: "text-destructive",     sign: "−" },
  reversal:   { label: "Reversal",   cls: "text-success",         sign: "+" },
  receipt:    { label: "Receipt",    cls: "text-success",         sign: "+" },
  adjustment: { label: "Adjustment", cls: "text-muted-foreground", sign: "±" },
};

const StockMovements = () => {
  const base = usePanelBase();
  const [items, setItems] = useState<Item[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemId, setItemId] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const load = async () => {
    setLoading(true);
    const [{ data: it }, { data: mv, error }] = await Promise.all([
      supabase.from("inventory_items").select("id, item_code, name, unit").order("name"),
      supabase.from("stock_movements").select("*").order("created_at", { ascending: false }).limit(1000),
    ]);
    setLoading(false);
    if (error) return toast.error(error.message);
    setItems((it ?? []) as Item[]);
    setMovements((mv ?? []) as Movement[]);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      if (itemId !== "all" && m.item_id !== itemId) return false;
      if (type !== "all" && m.movement_type !== type) return false;
      const d = new Date(m.created_at);
      if (from && d < new Date(from)) return false;
      if (to) {
        const toDate = new Date(to); toDate.setHours(23, 59, 59, 999);
        if (d > toDate) return false;
      }
      return true;
    });
  }, [movements, itemId, type, from, to]);

  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const reset = () => { setItemId("all"); setType("all"); setFrom(""); setTo(""); };

  return (
    <div className="space-y-6">
      <PageHeader title="Stock movements" description="Audit log of every inventory change driven by documents and manual adjustments." />

      <div className="grid gap-3 md:grid-cols-5 rounded-xl border bg-card p-4 shadow-card">
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs">Item</Label>
          <Select value={itemId} onValueChange={setItemId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All items</SelectItem>
              {items.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  <span className="font-mono text-xs mr-2">{i.item_code}</span>{i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="issue">Issue</SelectItem>
              <SelectItem value="reversal">Reversal</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">From</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="md:col-span-5 flex justify-end">
          <Button variant="ghost" size="sm" onClick={reset}>Reset filters</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        {loading ? (
          <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<History className="h-5 w-5" />} title="No stock movements" description="Movements are logged automatically when documents are sent or marked paid." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                const meta = TYPE_META[m.movement_type];
                const it = itemMap.get(m.item_id);
                return (
                  <TableRow key={m.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {new Date(m.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
                    </TableCell>
                    <TableCell>
                      {it ? (
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-muted-foreground">{it.item_code}</span>
                          <span className="text-sm">{it.name}</span>
                        </div>
                      ) : <span className="text-muted-foreground text-sm">— deleted item —</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${meta.cls}`}>
                        {m.movement_type === "issue" ? <ArrowDownCircle className="h-3 w-3 mr-1" /> : <ArrowUpCircle className="h-3 w-3 mr-1" />}
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right tabular-nums font-semibold ${meta.cls}`}>
                      {meta.sign}{Number(m.quantity).toLocaleString("en-PK")} {it?.unit ?? ""}
                    </TableCell>
                    <TableCell>
                      {m.document_id && m.document_type ? (
                        <Link to={`${base}/documents/${m.document_type}/${m.document_id}`} className="font-mono text-xs hover:underline">
                          {m.document_no ?? "—"}
                        </Link>
                      ) : <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.notes ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default StockMovements;
