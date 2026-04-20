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

export interface ClientRecord {
  id: string;
  name: string;
  ntn: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientRecord | null;
  onSaved: () => void;
}

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(150),
  ntn: z.string().trim().max(30).optional().or(z.literal("")),
  contact_person: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

const empty = { name: "", ntn: "", contact_person: "", phone: "", email: "", address: "", city: "", notes: "" };

const ClientFormDialog = ({ open, onOpenChange, client, onSaved }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name ?? "",
        ntn: client.ntn ?? "",
        contact_person: client.contact_person ?? "",
        phone: client.phone ?? "",
        email: client.email ?? "",
        address: client.address ?? "",
        city: client.city ?? "",
        notes: client.notes ?? "",
      });
    } else setForm(empty);
  }, [client, open]);

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
      ntn: parsed.data.ntn || null,
      contact_person: parsed.data.contact_person || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      notes: parsed.data.notes || null,
    };

    const { error } = client
      ? await supabase.from("clients").update(payload).eq("id", client.id)
      : await supabase.from("clients").insert({ ...payload, created_by: user.id });

    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(client ? "Client updated" : "Client created");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{client ? "Edit client" : "New client"}</DialogTitle>
          <DialogDescription>Customer profile used in quotations and invoices.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="c-name">Name *</Label>
              <Input id="c-name" value={form.name} onChange={set("name")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-ntn">NTN</Label>
              <Input id="c-ntn" value={form.ntn} onChange={set("ntn")} placeholder="0000000-0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-contact">Contact person</Label>
              <Input id="c-contact" value={form.contact_person} onChange={set("contact_person")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-phone">Phone</Label>
              <Input id="c-phone" value={form.phone} onChange={set("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" value={form.email} onChange={set("email")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="c-address">Address</Label>
              <Input id="c-address" value={form.address} onChange={set("address")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-city">City</Label>
              <Input id="c-city" value={form.city} onChange={set("city")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="c-notes">Notes</Label>
              <Textarea id="c-notes" rows={2} value={form.notes} onChange={set("notes")} />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : client ? "Save changes" : "Create client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientFormDialog;
