import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export interface ItemRecord {
  id: string;
  item_code: string;
  name: string;
  category_id: string | null;
  unit: string;
  current_stock: number;
  last_rate: number;
  reorder_level: number;
  notes: string | null;
}

export interface CategoryRecord { id: string; name: string }

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ItemRecord | null;
  categories: CategoryRecord[];
  onSaved: () => void;
}

const schema = z.object({
  item_code: z.string().trim().min(1, "Code required").max(40),
  name: z.string().trim().min(1, "Name required").max(150),
  category_id: z.string().uuid().nullable(),
  unit: z.string().trim().min(1).max(20),
  current_stock: z.coerce.number().min(0),
  last_rate: z.coerce.number().min(0),
  reorder_level: z.coerce.number().min(0),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

const empty = {
  item_code: "", name: "", category_id: null as string | null,
  unit: "pcs", current_stock: "0", last_rate: "0", reorder_level: "0", notes: "",
};

const ItemFormDialog = ({ open, onOpenChange, item, categories, onSaved }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<typeof empty>(empty);

  useEffect(() => {
    if (item) {
      setForm({
        item_code: item.item_code,
        name: item.name,
        category_id: item.category_id,
        unit: item.unit,
        current_stock: String(item.current_stock),
        last_rate: String(item.last_rate),
        reorder_level: String(item.reorder_level),
        notes: item.notes ?? "",
      });
    } else setForm(empty);
  }, [item, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (!user) return toast.error("Not authenticated");

    setLoading(true);
    const payload = {
      item_code: parsed.data.item_code,
      name: parsed.data.name,
      category_id: parsed.data.category_id,
      unit: parsed.data.unit,
      current_stock: parsed.data.current_stock,
      last_rate: parsed.data.last_rate,
      reorder_level: parsed.data.reorder_level,
      notes: parsed.data.notes || null,
    };

    const { error } = item
      ? await supabase.from("inventory_items").update(payload).eq("id", item.id)
      : await supabase.from("inventory_items").insert({ ...payload, created_by: user.id });

    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(item ? "Item updated" : "Item created");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit item" : "New inventory item"}</DialogTitle>
          <DialogDescription>Items appear in quotations, invoices, and stock reports.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="i-code">Item code *</Label>
              <Input id="i-code" value={form.item_code} onChange={(e) => setForm({ ...form, item_code: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="i-cat">Category</Label>
              <Select
                value={form.category_id ?? "none"}
                onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? null : v })}
              >
                <SelectTrigger id="i-cat"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— No category —</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="i-name">Name *</Label>
              <Input id="i-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="i-unit">Unit</Label>
              <Input id="i-unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="pcs / m / kg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="i-stock">Current stock</Label>
              <Input id="i-stock" type="number" step="0.001" value={form.current_stock} onChange={(e) => setForm({ ...form, current_stock: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="i-rate">Last rate (PKR)</Label>
              <Input id="i-rate" type="number" step="0.01" value={form.last_rate} onChange={(e) => setForm({ ...form, last_rate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="i-reorder">Reorder level</Label>
              <Input id="i-reorder" type="number" step="0.001" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="i-notes">Notes</Label>
              <Textarea id="i-notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : item ? "Save changes" : "Create item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ItemFormDialog;
