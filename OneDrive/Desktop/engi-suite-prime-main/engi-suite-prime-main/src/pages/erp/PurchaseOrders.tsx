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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Truck, Loader2, Pencil, Trash2 } from "lucide-react";
import { formatPKR } from "@/lib/tax";

interface PORow {
  id: string;
  doc_no: string;
  status: string;
  issue_date: string;
  grand_total: number;
  vendors: { name: string } | null;
}

const statusVariant = (s: string) =>
  s === "received" ? "default" : s === "sent" ? "secondary" : s === "cancelled" ? "destructive" : "outline";

const PurchaseOrders = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const base = usePanelBase();
  const [rows, setRows] = useState<PORow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("purchase_orders")
      .select("id, doc_no, status, issue_date, grand_total, vendors(name)")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows((data ?? []) as unknown as PORow[]);
  };

  useEffect(() => { load(); }, []);

  const onDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("purchase_orders").delete().eq("id", deleteId);
    if (error) return toast.error(error.message);
    toast.success("Purchase order deleted");
    setDeleteId(null);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase orders"
        description="Issue POs to vendors and receive stock into inventory."
        actionLabel="New PO"
        onAction={() => navigate(`${base}/purchase-orders/new`)}
      />

      <div className="rounded-xl border bg-card shadow-card">
        {loading ? (
          <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Truck className="h-5 w-5" />}
            title="No purchase orders yet"
            description="Create your first PO to procure stock from a vendor."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link to={`${base}/purchase-orders/${d.id}`} className="font-mono text-xs text-primary hover:underline">
                      {d.doc_no}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(d.issue_date), "dd MMM yyyy")}</TableCell>
                  <TableCell>{d.vendors?.name ?? "—"}</TableCell>
                  <TableCell><Badge variant={statusVariant(d.status) as never} className="capitalize">{d.status}</Badge></TableCell>
                  <TableCell className="text-right tabular-nums">{formatPKR(Number(d.grand_total))}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`${base}/purchase-orders/${d.id}`)} aria-label="Edit">
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
            <AlertDialogTitle>Delete purchase order?</AlertDialogTitle>
            <AlertDialogDescription>
              If this PO was already received, deleting it will not automatically reverse the stock. Cancel it first to restore stock.
            </AlertDialogDescription>
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

export default PurchaseOrders;
