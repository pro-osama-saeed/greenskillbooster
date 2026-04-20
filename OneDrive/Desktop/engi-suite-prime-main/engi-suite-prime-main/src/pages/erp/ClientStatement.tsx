import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/erp/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Printer } from "lucide-react";
import { formatPKR } from "@/lib/tax";

interface Client { id: string; name: string; ntn: string | null; address: string | null; city: string | null }

interface DocRow {
  id: string; doc_no: string; doc_type: string; issue_date: string; grand_total: number; status: string;
}
interface PaymentRow {
  id: string; document_id: string; amount: number; payment_date: string; method: string; reference: string | null;
  documents: { doc_no: string; doc_type: string } | null;
}

interface Entry {
  date: string;
  ref: string;
  description: string;
  debit: number;   // billed
  credit: number;  // paid
  balance: number;
}

const today = () => new Date().toISOString().slice(0, 10);
const monthAgo = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); };

const ClientStatement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [from, setFrom] = useState(monthAgo());
  const [to, setTo] = useState(today());
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("clients").select("id, name, ntn, address, city").order("name");
      setClients((data ?? []) as Client[]);
    })();
  }, []);

  const load = async () => {
    if (!clientId) return toast.error("Select a client");
    setLoading(true);
    const [{ data: docsData, error: e1 }, { data: paysData, error: e2 }] = await Promise.all([
      supabase.from("documents")
        .select("id, doc_no, doc_type, issue_date, grand_total, status")
        .eq("client_id", clientId)
        .in("doc_type", ["invoice", "bill"])
        .gte("issue_date", from)
        .lte("issue_date", to)
        .order("issue_date"),
      supabase.from("payments")
        .select("id, document_id, amount, payment_date, method, reference, documents!inner(doc_no, doc_type, client_id)")
        .eq("documents.client_id", clientId)
        .gte("payment_date", from)
        .lte("payment_date", to)
        .order("payment_date"),
    ]);
    setLoading(false);
    if (e1) return toast.error(e1.message);
    if (e2) return toast.error(e2.message);
    setDocs((docsData ?? []) as DocRow[]);
    setPayments((paysData ?? []) as unknown as PaymentRow[]);
  };

  useEffect(() => { if (clientId) load(); }, [clientId]); // eslint-disable-line

  const client = useMemo(() => clients.find((c) => c.id === clientId) ?? null, [clients, clientId]);

  const entries = useMemo<Entry[]>(() => {
    const all: Omit<Entry, "balance">[] = [
      ...docs.map((d) => ({
        date: d.issue_date,
        ref: d.doc_no,
        description: `${d.doc_type === "invoice" ? "Invoice" : "Bill"} ${d.doc_no}`,
        debit: Number(d.grand_total) || 0,
        credit: 0,
      })),
      ...payments.map((p) => ({
        date: p.payment_date,
        ref: p.reference ?? p.documents?.doc_no ?? "",
        description: `Payment received (${p.method})${p.documents ? ` for ${p.documents.doc_no}` : ""}`,
        debit: 0,
        credit: Number(p.amount) || 0,
      })),
    ].sort((a, b) => a.date.localeCompare(b.date));

    let bal = 0;
    return all.map((e) => {
      bal += e.debit - e.credit;
      return { ...e, balance: bal };
    });
  }, [docs, payments]);

  const totals = useMemo(() => ({
    debit: entries.reduce((s, e) => s + e.debit, 0),
    credit: entries.reduce((s, e) => s + e.credit, 0),
    balance: entries.length ? entries[entries.length - 1].balance : 0,
  }), [entries]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client statement"
        description="Pick a client and date range to see all invoices, bills and payments with running balance."
      >
        {clientId && entries.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> Print / PDF
          </Button>
        )}
      </PageHeader>

      <div className="rounded-xl border bg-card p-5 shadow-card grid md:grid-cols-4 gap-4 print:hidden">
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
          <Label>From</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="space-y-1.5 flex items-end">
          <Button onClick={load} variant="hero" size="sm" className="w-full" disabled={!clientId || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>

      {client && (
        <div className="rounded-xl border bg-card shadow-card print:shadow-none print:border-0">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <div className="font-display text-xl font-bold text-primary">Apex Arc Engineering</div>
                <div className="text-xs text-muted-foreground">+92 305 8906453 · arcengineering86@gmail.com</div>
              </div>
              <div className="text-right">
                <h2 className="font-display text-lg font-bold">Statement of Account</h2>
                <div className="text-xs text-muted-foreground">{format(new Date(from), "dd MMM yyyy")} — {format(new Date(to), "dd MMM yyyy")}</div>
              </div>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs uppercase text-muted-foreground tracking-wide mb-1">Bill to</div>
                <div className="font-semibold">{client.name}</div>
                {client.ntn && <div className="text-muted-foreground">NTN: {client.ntn}</div>}
                {client.address && <div className="text-muted-foreground">{client.address}</div>}
                {client.city && <div className="text-muted-foreground">{client.city}</div>}
              </div>
              <div className="sm:text-right">
                <div className="text-xs uppercase text-muted-foreground tracking-wide mb-1">Closing balance</div>
                <div className={`text-2xl font-bold tabular-nums ${totals.balance > 0 ? "text-destructive" : "text-primary"}`}>
                  {formatPKR(totals.balance)}
                </div>
                <div className="text-xs text-muted-foreground">{totals.balance > 0 ? "Outstanding" : totals.balance < 0 ? "Credit balance" : "Settled"}</div>
              </div>
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No transactions in this period.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">{format(new Date(e.date), "dd MMM yyyy")}</TableCell>
                    <TableCell className="font-mono text-xs">{e.ref}</TableCell>
                    <TableCell className="text-sm">{e.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{e.debit ? formatPKR(e.debit) : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{e.credit ? formatPKR(e.credit) : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatPKR(e.balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {entries.length > 0 && (
            <div className="p-6 border-t grid sm:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between sm:block">
                <span className="text-muted-foreground">Total billed</span>
                <div className="font-semibold tabular-nums">{formatPKR(totals.debit)}</div>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-muted-foreground">Total received</span>
                <div className="font-semibold tabular-nums">{formatPKR(totals.credit)}</div>
              </div>
              <div className="flex justify-between sm:block sm:text-right">
                <span className="text-muted-foreground">Closing balance</span>
                <div className="font-bold tabular-nums">{formatPKR(totals.balance)}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientStatement;
