import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";

interface RateRow { rate: number; recorded_at: string; client_id: string | null; clients: { name: string } | null }

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemName: string;
  itemCurrentLastRate: number;
  onRecorded: () => void;
}

const schema = z.object({
  rate: z.coerce.number().min(0.01, "Rate must be greater than zero"),
  quantity: z.coerce.number().min(0).optional(),
  client_id: z.string().uuid().nullable(),
});

const RecordRateDialog = ({ open, onOpenChange, itemId, itemName, itemCurrentLastRate, onRecorded }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [history, setHistory] = useState<RateRow[]>([]);
  const [rate, setRate] = useState(String(itemCurrentLastRate || ""));
  const [quantity, setQuantity] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setRate(String(itemCurrentLastRate || ""));
    setQuantity("");
    setClientId(null);

    supabase.from("clients").select("id, name").order("name").then(({ data }) => {
      setClients(data ?? []);
    });
    supabase
      .from("item_rate_history")
      .select("rate, recorded_at, client_id, clients(name)")
      .eq("item_id", itemId)
      .order("recorded_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setHistory((data as unknown as RateRow[]) ?? []));
  }, [open, itemId, itemCurrentLastRate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ rate, quantity: quantity || undefined, client_id: clientId });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (!user) return toast.error("Not authenticated");

    setLoading(true);
    const { error: histErr } = await supabase.from("item_rate_history").insert({
      item_id: itemId,
      client_id: parsed.data.client_id,
      document_type: "manual",
      document_id: null,
      rate: parsed.data.rate,
      quantity: parsed.data.quantity ?? null,
      recorded_by: user.id,
    });
    if (histErr) { setLoading(false); return toast.error(histErr.message); }

    // Update last_rate snapshot on the item
    const { error: itemErr } = await supabase
      .from("inventory_items")
      .update({ last_rate: parsed.data.rate })
      .eq("id", itemId);

    setLoading(false);
    if (itemErr) return toast.error(itemErr.message);
    toast.success("Rate recorded");
    onRecorded();
    onOpenChange(false);
  };

  const lastThree = useMemo(() => history.slice(0, 3), [history]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record rate — {itemName}</DialogTitle>
          <DialogDescription>Stored as an immutable snapshot in the rate history log.</DialogDescription>
        </DialogHeader>

        {lastThree.length > 0 && (
          <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1">
            <div className="font-medium text-foreground">Last 3 rates</div>
            {lastThree.map((h, i) => (
              <div key={i} className="flex justify-between text-muted-foreground">
                <span>
                  ₨ {Number(h.rate).toLocaleString()} · {h.clients?.name ?? "—"}
                </span>
                <span>{format(new Date(h.recorded_at), "dd MMM yyyy")}</span>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="r-rate">Rate (PKR) *</Label>
              <Input id="r-rate" type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-qty">Quantity</Label>
              <Input id="r-qty" type="number" step="0.001" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="r-client">Client (optional)</Label>
              <Select value={clientId ?? "none"} onValueChange={(v) => setClientId(v === "none" ? null : v)}>
                <SelectTrigger id="r-client"><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— No client —</SelectItem>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record rate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordRateDialog;
