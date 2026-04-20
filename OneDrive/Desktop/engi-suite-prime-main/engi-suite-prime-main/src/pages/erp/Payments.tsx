import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePanelBase } from "@/lib/usePanelBase";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import PageHeader from "@/components/erp/PageHeader";
import EmptyState from "@/components/erp/EmptyState";
import PaymentDialog from "@/components/erp/PaymentDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Receipt, Plus, Trash2, Wallet } from "lucide-react";
import { formatPKR } from "@/lib/tax";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Doc {
  id: string;
  doc_no: string;
  doc_type: string;
  status: string;
  grand_total: number;
  issue_date: string;
  client_id: string | null;
  clients: { name: string } | null;
}
interface Payment {
  id: string;
  document_id: string;
  amount: number;
  payment_date: string;
  method: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

const Payments = () => {
  const { isAdmin } = useAuth();
  const base = usePanelBase();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [payDoc, setPayDoc] = useState<Doc | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: d, error: dErr }, { data: p, error: pErr }] = await Promise.all([
      supabase
        .from("documents")
        .select("id, doc_no, doc_type, status, grand_total, issue_date, client_id, clients(name)")
        .in("doc_type", ["invoice", "bill"])
        .order("issue_date", { ascending: false })
        .limit(500),
      supabase.from("payments").select("*").order("payment_date", { ascending: false }).limit(500),
    ]);
    setLoading(false);
    if (dErr || pErr) return toast.error((dErr ?? pErr)!.message);
    setDocs((d ?? []) as unknown as Doc[]);
    setPayments((p ?? []) as Payment[]);
  };

  useEffect(() => { load(); }, []);

  const paidByDoc = useMemo(() => {
    const m = new Map<string, number>();
    payments.forEach((p) => m.set(p.document_id, (m.get(p.document_id) ?? 0) + Number(p.amount)));
    return m;
  }, [payments]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return docs;
    return docs.filter((d) =>
      d.doc_no.toLowerCase().includes(t) ||
      (d.clients?.name ?? "").toLowerCase().includes(t),
    );
  }, [docs, q]);

  const totalOutstanding = useMemo(
    () => docs.reduce((s, d) => s + Math.max(Number(d.grand_total) - (paidByDoc.get(d.id) ?? 0), 0), 0),
    [docs, paidByDoc],
  );
  const totalCollected = useMemo(
    () => payments.reduce((s, p) => s + Number(p.amount), 0),
    [payments],
  );

  const removePayment = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("payments").delete().eq("id", deleteId);
    if (error) return toast.error(error.message);
    toast.success("Payment removed");
    setDeleteId(null);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Record payments against invoices and bills, and track outstanding balances per client." />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="text-sm text-muted-foreground flex items-center gap-2"><Wallet className="h-4 w-4" /> Total collected</div>
          <div className="font-display text-2xl font-bold mt-2 tabular-nums">{formatPKR(totalCollected)}</div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="text-sm text-muted-foreground flex items-center gap-2"><Receipt className="h-4 w-4" /> Total outstanding</div>
          <div className="font-display text-2xl font-bold mt-2 tabular-nums text-warning">{formatPKR(totalOutstanding)}</div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="text-sm text-muted-foreground">Documents</div>
          <div className="font-display text-2xl font-bold mt-2 tabular-nums">{docs.length}</div>
        </div>
      </section>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Input placeholder="Search by doc # or client…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        {loading ? (
          <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Receipt className="h-5 w-5" />} title="No invoices or bills yet" description="Create an invoice or bill to start recording payments." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doc #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => {
                const paid = paidByDoc.get(d.id) ?? 0;
                const due = Math.max(Number(d.grand_total) - paid, 0);
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Link to={`${base}/documents/${d.doc_type}/${d.id}`} className="font-mono text-sm hover:underline">{d.doc_no}</Link>
                    </TableCell>
                    <TableCell className="capitalize text-sm">{d.doc_type}</TableCell>
                    <TableCell>{d.clients?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(d.issue_date).toLocaleDateString("en-PK")}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === "paid" ? "default" : d.status === "sent" ? "secondary" : "outline"} className="capitalize">{d.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatPKR(Number(d.grand_total))}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPKR(paid)}</TableCell>
                    <TableCell className={`text-right tabular-nums font-medium ${due > 0 ? "text-warning" : "text-success"}`}>{formatPKR(due)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" disabled={due <= 0} onClick={() => setPayDoc(d)}>
                        <Plus className="h-3 w-3 mr-1" /> Pay
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <section className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <div className="px-5 py-3 border-b font-semibold text-sm">Recent payments</div>
        {payments.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">No payments recorded yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.slice(0, 50).map((p) => {
                const doc = docs.find((d) => d.id === p.document_id);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{new Date(p.payment_date).toLocaleDateString("en-PK")}</TableCell>
                    <TableCell>
                      {doc ? (
                        <Link to={`${base}/documents/${doc.doc_type}/${doc.id}`} className="font-mono text-sm hover:underline">{doc.doc_no}</Link>
                      ) : <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                    <TableCell className="capitalize text-sm">{p.method}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.reference ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatPKR(Number(p.amount))}</TableCell>
                    <TableCell className="text-right">
                      {isAdmin && (
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>

      {payDoc && (
        <PaymentDialog
          open={!!payDoc}
          onOpenChange={(v) => !v && setPayDoc(null)}
          documentId={payDoc.id}
          documentNo={payDoc.doc_no}
          grandTotal={Number(payDoc.grand_total)}
          onSaved={load}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this payment?</AlertDialogTitle>
            <AlertDialogDescription>The document status will be re-evaluated automatically. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={removePayment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Payments;
