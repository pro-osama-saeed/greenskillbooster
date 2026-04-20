import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export interface VendorRecord {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  items_supplied: string | null;
  notes: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: VendorRecord | null;
  onSaved: () => void;
}

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(150),
  contact_person: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  items_supplied: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

const empty = { name: "", contact_person: "", phone: "", email: "", address: "", city: "", items_supplied: "", notes: "" };

const VendorFormDialog = ({ open, onOpenChange, vendor, onSaved }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (vendor) {
      setForm({
        name: vendor.name ?? "",
        contact_person: vendor.contact_person ?? "",
        phone: vendor.phone ?? "",
        email: vendor.email ?? "",
        address: vendor.address ?? "",
        city: vendor.city ?? "",
        items_supplied: vendor.items_supplied ?? "",
        notes: vendor.notes ?? "",
      });
    } else setForm(empty);
  }, [vendor, open]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (!user) return toast.error("Not authenticated");

    setLoading(true);
    const payload = {
      name: parsed.data.name,
      contact_person: parsed.data.contact_person || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      items_supplied: parsed.data.items_supplied || null,
      notes: parsed.data.notes || null,
    };

    const { error } = vendor
      ? await supabase.from("vendors").update(payload).eq("id", vendor.id)
      : await supabase.from("vendors").insert({ ...payload, created_by: user.id });

    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(vendor ? "Vendor updated" : "Vendor created");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit vendor" : "New vendor"}</DialogTitle>
          <DialogDescription>Supplier profile and items they supply.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="v-name">Supplier name *</Label>
              <Input id="v-name" value={form.name} onChange={set("name")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-contact">Contact person</Label>
              <Input id="v-contact" value={form.contact_person} onChange={set("contact_person")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-phone">Phone</Label>
              <Input id="v-phone" value={form.phone} onChange={set("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-email">Email</Label>
              <Input id="v-email" type="email" value={form.email} onChange={set("email")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-city">City</Label>
              <Input id="v-city" value={form.city} onChange={set("city")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="v-address">Address</Label>
              <Input id="v-address" value={form.address} onChange={set("address")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="v-items">Items supplied</Label>
              <Textarea id="v-items" rows={2} value={form.items_supplied} onChange={set("items_supplied")} placeholder="e.g. Cables, MCBs, switchgear" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="v-notes">Notes</Label>
              <Textarea id="v-notes" rows={2} value={form.notes} onChange={set("notes")} />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : vendor ? "Save changes" : "Create vendor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VendorFormDialog;
