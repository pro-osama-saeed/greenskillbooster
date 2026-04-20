import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPKR } from "@/lib/tax";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  documentId: string;
  documentNo: string;
  grandTotal: number;
  onSaved?: () => void;
}

const PaymentDialog = ({ open, onOpenChange, documentId, documentNo, grandTotal, onSaved }: Props) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<string>("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [paid, setPaid] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReference(""); setNotes(""); setMethod("cash");
    setDate(new Date().toISOString().slice(0, 10));
    (async () => {
      const { data } = await supabase.from("payments").select("amount").eq("document_id", documentId);
      const total = (data ?? []).reduce((s, p) => s + Number(p.amount), 0);
      setPaid(total);
      const due = Math.max(grandTotal - total, 0);
      setAmount(due ? due.toFixed(2) : "");
    })();
  }, [open, documentId, grandTotal]);

  const due = Math.max(grandTotal - paid, 0);

  const submit = async () => {
    if (!user) return toast.error("Not authenticated");
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    setSaving(true);
    const { error } = await supabase.from("payments").insert({
      document_id: documentId,
      amount: amt,
      payment_date: date,
      method,
      reference: reference || null,
      notes: notes || null,
      created_by: user.id,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`Payment of ${formatPKR(amt)} recorded`);
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment · <span className="font-mono">{documentNo}</span></DialogTitle>
          <DialogDescription>
            Grand total {formatPKR(grandTotal)} · Paid so far {formatPKR(paid)} · <span className="font-medium text-foreground">Due {formatPKR(due)}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount (PKR) *</Label>
              <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Payment date *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reference / Cheque #</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="optional" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="hero" onClick={submit} disabled={saving}>Record payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
