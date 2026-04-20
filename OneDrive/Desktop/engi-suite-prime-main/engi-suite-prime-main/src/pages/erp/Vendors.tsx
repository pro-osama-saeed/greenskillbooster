import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import PageHeader from "@/components/erp/PageHeader";
import EmptyState from "@/components/erp/EmptyState";
import VendorFormDialog, { VendorRecord } from "@/components/erp/VendorFormDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Search, Truck, Loader2 } from "lucide-react";

const Vendors = () => {
  const { isAdmin } = useAuth();
  const [list, setList] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VendorRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendors")
      .select("id, name, contact_person, phone, email, address, city, items_supplied, notes")
      .order("name", { ascending: true });
    setLoading(false);
    if (error) return toast.error(error.message);
    setList((data ?? []) as VendorRecord[]);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return list;
    return list.filter((v) =>
      [v.name, v.contact_person, v.email, v.city, v.items_supplied].filter(Boolean).some((x) => x!.toLowerCase().includes(t))
    );
  }, [list, q]);

  const onDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("vendors").delete().eq("id", deleteId);
    if (error) return toast.error(error.message);
    toast.success("Vendor deleted");
    setDeleteId(null);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Suppliers and the items they supply."
        actionLabel="New vendor"
        onAction={() => { setEditing(null); setOpen(true); }}
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendor or item…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8 w-64"
          />
        </div>
      </PageHeader>

      <div className="rounded-xl border bg-card shadow-card">
        {loading ? (
          <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Truck className="h-5 w-5" />}
            title={q ? "No matches" : "No vendors yet"}
            description={q ? "Try a different search." : "Track suppliers and the items they provide."}
            action={!q && <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}>New vendor</Button>}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Items supplied</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{v.items_supplied ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    <div>{v.contact_person ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{v.phone ?? v.email ?? ""}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{v.city ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(v); setOpen(true); }} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(v.id)} aria-label="Delete" className="text-destructive hover:text-destructive">
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

      <VendorFormDialog open={open} onOpenChange={setOpen} vendor={editing} onSaved={load} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete vendor?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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

export default Vendors;
