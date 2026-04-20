import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import PageHeader from "@/components/erp/PageHeader";
import EmptyState from "@/components/erp/EmptyState";
import ClientFormDialog, { ClientRecord } from "@/components/erp/ClientFormDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Search, Users, Loader2 } from "lucide-react";

const Clients = () => {
  const { isAdmin } = useAuth();
  const [list, setList] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("id, name, ntn, contact_person, phone, email, address, city, notes")
      .order("name", { ascending: true });
    setLoading(false);
    if (error) return toast.error(error.message);
    setList((data ?? []) as ClientRecord[]);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return list;
    return list.filter((c) =>
      [c.name, c.ntn, c.contact_person, c.email, c.city].filter(Boolean).some((v) => v!.toLowerCase().includes(t))
    );
  }, [list, q]);

  const onDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("clients").delete().eq("id", deleteId);
    if (error) return toast.error(error.message);
    toast.success("Client deleted");
    setDeleteId(null);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Customers used across quotations and invoices."
        actionLabel="New client"
        onAction={() => { setEditing(null); setOpen(true); }}
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, NTN, city…"
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
            icon={<Users className="h-5 w-5" />}
            title={q ? "No matches" : "No clients yet"}
            description={q ? "Try a different search." : "Add your first client to start creating quotations."}
            action={!q && <Button variant="hero" onClick={() => { setEditing(null); setOpen(true); }}>New client</Button>}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>NTN</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{c.ntn ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    <div>{c.contact_person ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{c.phone ?? c.email ?? ""}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.city ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setOpen(true); }} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)} aria-label="Delete" className="text-destructive hover:text-destructive">
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

      <ClientFormDialog open={open} onOpenChange={setOpen} client={editing} onSaved={load} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the client. Any historical rate snapshots tied to them will keep the record but lose the client reference.
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

export default Clients;
