import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import PageHeader from "@/components/erp/PageHeader";
import EmptyState from "@/components/erp/EmptyState";
import ItemFormDialog, { ItemRecord, CategoryRecord } from "@/components/erp/ItemFormDialog";
import RecordRateDialog from "@/components/erp/RecordRateDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Search, Package, Loader2, Receipt } from "lucide-react";

interface InventoryRow extends ItemRecord {
  inventory_categories: { name: string } | null;
}

const Inventory = () => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<ItemRecord | null>(null);
  const [rateFor, setRateFor] = useState<ItemRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");

  const loadAll = async () => {
    setLoading(true);
    const [{ data: cats }, { data: rows, error }] = await Promise.all([
      supabase.from("inventory_categories").select("id, name").order("name"),
      supabase
        .from("inventory_items")
        .select("id, item_code, name, category_id, unit, current_stock, last_rate, reorder_level, notes, inventory_categories(name)")
        .order("name", { ascending: true }),
    ]);
    setLoading(false);
    if (error) return toast.error(error.message);
    setCategories((cats ?? []) as CategoryRecord[]);
    setItems((rows ?? []) as unknown as InventoryRow[]);
  };

  useEffect(() => { loadAll(); }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter((i) => {
      const matchesCat = activeCat === "all" || i.category_id === activeCat;
      const matchesQ = !t || [i.name, i.item_code, i.notes].filter(Boolean).some((v) => v!.toLowerCase().includes(t));
      return matchesCat && matchesQ;
    });
  }, [items, q, activeCat]);

  const onDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("inventory_items").delete().eq("id", deleteId);
    if (error) return toast.error(error.message);
    toast.success("Item deleted");
    setDeleteId(null);
    loadAll();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Items, stock levels and rate history per client."
        actionLabel="New item"
        onAction={() => { setEditing(null); setEditOpen(true); }}
      >
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search code or name…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 w-64" />
        </div>
      </PageHeader>

      <Tabs value={activeCat} onValueChange={setActiveCat}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((c) => <TabsTrigger key={c.id} value={c.id}>{c.name}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="rounded-xl border bg-card shadow-card">
        {loading ? (
          <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Package className="h-5 w-5" />}
            title={q || activeCat !== "all" ? "No matches" : "No inventory yet"}
            description={q || activeCat !== "all" ? "Try a different filter." : "Add your first item to start quoting."}
            action={!q && activeCat === "all" && <Button variant="hero" onClick={() => { setEditing(null); setEditOpen(true); }}>New item</Button>}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Last rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((it) => {
                const low = it.current_stock <= it.reorder_level && it.reorder_level > 0;
                return (
                  <TableRow key={it.id}>
                    <TableCell className="font-mono text-xs">{it.item_code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{it.name}</div>
                      {it.notes && <div className="text-xs text-muted-foreground truncate max-w-xs">{it.notes}</div>}
                    </TableCell>
                    <TableCell>
                      {it.inventory_categories?.name && (
                        <Badge variant="secondary" className="font-normal">{it.inventory_categories.name}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div>{Number(it.current_stock).toLocaleString()} <span className="text-xs text-muted-foreground">{it.unit}</span></div>
                      {low && <Badge variant="destructive" className="mt-1 text-[10px]">Low</Badge>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      ₨ {Number(it.last_rate).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setRateFor(it)} aria-label="Record rate" title="Record rate">
                          <Receipt className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(it); setEditOpen(true); }} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(it.id)} aria-label="Delete" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <ItemFormDialog open={editOpen} onOpenChange={setEditOpen} item={editing} categories={categories} onSaved={loadAll} />

      {rateFor && (
        <RecordRateDialog
          open={!!rateFor}
          onOpenChange={(o) => !o && setRateFor(null)}
          itemId={rateFor.id}
          itemName={rateFor.name}
          itemCurrentLastRate={Number(rateFor.last_rate)}
          onRecorded={loadAll}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>The item will be removed. Its rate history snapshots will also be deleted.</AlertDialogDescription>
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

export default Inventory;
