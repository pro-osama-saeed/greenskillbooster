import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/erp/PageHeader";
import EmptyState from "@/components/erp/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Percent, Save } from "lucide-react";

interface TaxRow {
  id: string;
  code: string;
  name: string;
  rate: number;
  description: string | null;
  is_active: boolean;
}

const TaxSettings = () => {
  const [rows, setRows] = useState<TaxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("tax_rules").select("*").order("code");
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows((data ?? []) as TaxRow[]);
  };

  useEffect(() => { load(); }, []);

  const update = (id: string, patch: Partial<TaxRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const save = async (row: TaxRow) => {
    setSavingId(row.id);
    const { error } = await supabase
      .from("tax_rules")
      .update({
        name: row.name,
        rate: Number(row.rate) || 0,
        description: row.description,
        is_active: row.is_active,
      })
      .eq("id", row.id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success(`${row.code} saved`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax engine"
        description="FBR-aligned tax rules used across quotations, bills and invoices."
      />

      <div className="rounded-xl border bg-card shadow-card">
        {loading ? (
          <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<Percent className="h-5 w-5" />} title="No tax rules" description="Seed data missing." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-28 text-right">Rate %</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="text-right w-24">Save</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.code}</TableCell>
                  <TableCell>
                    <Input value={r.name} onChange={(e) => update(r.id, { name: e.target.value })} />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number" step="0.01" min={0}
                      value={r.rate}
                      onChange={(e) => update(r.id, { rate: Number(e.target.value) })}
                      className="text-right tabular-nums"
                    />
                  </TableCell>
                  <TableCell>
                    <Input value={r.description ?? ""} onChange={(e) => update(r.id, { description: e.target.value })} />
                  </TableCell>
                  <TableCell>
                    <Switch checked={r.is_active} onCheckedChange={(v) => update(r.id, { is_active: v })} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="hero" disabled={savingId === r.id} onClick={() => save(r)}>
                      {savingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default TaxSettings;
