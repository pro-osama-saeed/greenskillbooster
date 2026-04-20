import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { usePanelBase } from "@/lib/usePanelBase";
import PageHeader from "@/components/erp/PageHeader";
import EmptyState from "@/components/erp/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileText, Loader2, Pencil, Trash2 } from "lucide-react";
import { formatPKR } from "@/lib/tax";

type DocType = "quotation" | "bill" | "invoice" | "challan";

interface DocRow {
  id: string;
  doc_no: string;
  doc_type: DocType;
  status: string;
  issue_date: string;
  grand_total: number;
  clients: { name: string } | null;
}

const TYPE_LABELS: Record<DocType, { title: string; description: string }> = {
  quotation: { title: "Quotations", description: "Draft quotations and convert them to bills, invoices or delivery challans." },
  invoice:   { title: "Invoices",   description: "Issued invoices and payment status." },
  bill:      { title: "Bills",      description: "Bills issued to clients." },
  challan:   { title: "Delivery challans", description: "Goods dispatched to clients." },
};

const statusVariant = (s: string) =>
  s === "paid" ? "default" : s === "sent" ? "secondary" : s === "cancelled" ? "destructive" : "outline";

interface Props { docType: DocType }

const Documents = ({ docType }: Props) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const base = usePanelBase();
  const [rows, setRows] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("id, doc_no, doc_type, status, issue_date, grand_total, clients(name)")
      .eq("doc_type", docType)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows((data ?? []) as unknown as DocRow[]);
  };

  useEffect(() => { load(); }, [docType]);

  const onDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("documents").delete().eq("id", deleteId);
    if (error) return toast.error(error.message);
    toast.success("Document deleted");
    setDeleteId(null);
    load();
  };

  const meta = TYPE_LABELS[docType];

  return (
    <div className="space-y-6">
      <PageHeader
        title={meta.title}
        description={meta.description}
        actionLabel={`New ${docType}`}
        onAction={() => navigate(`${base}/documents/${docType}/new`)}
      />

      <div className="rounded-xl border bg-card shadow-card">
        {loading ? (
          <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title={`No ${docType}s yet`}
            description="Create your first one to get started."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doc #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link to={`${base}/documents/${d.doc_type}/${d.id}`} className="font-mono text-xs text-primary hover:underline">
                      {d.doc_no}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(d.issue_date), "dd MMM yyyy")}</TableCell>
                  <TableCell>{d.clients?.name ?? "—"}</TableCell>
                  <TableCell><Badge variant={statusVariant(d.status) as never} className="capitalize">{d.status}</Badge></TableCell>
                  <TableCell className="text-right tabular-nums">{formatPKR(Number(d.grand_total))}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`${base}/documents/${d.doc_type}/${d.id}`)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(d.id)} className="text-destructive hover:text-destructive" aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>This action removes the document and all its line items.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Documents;
