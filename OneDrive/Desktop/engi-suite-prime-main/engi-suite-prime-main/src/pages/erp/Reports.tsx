import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/erp/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download } from "lucide-react";
import { formatPKR } from "@/lib/tax";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";

interface DocRow {
  id: string; doc_no: string; doc_type: string; issue_date: string;
  subtotal: number; tax_total: number; grand_total: number;
  client_id: string | null;
  clients: { name: string } | null;
}
interface ItemRow {
  document_id: string; description: string; quantity: number; line_total: number; tax_amount: number;
  tax_rules: { code: string; name: string } | null;
  inventory_items: { name: string; item_code: string } | null;
}

const startOfYear = () => `${new Date().getFullYear()}-01-01`;
const today = () => new Date().toISOString().slice(0, 10);

const monthKey = (d: string) => d.slice(0, 7);   // YYYY-MM
const monthLabel = (k: string) => format(new Date(`${k}-01`), "MMM yyyy");

const downloadCSV = (filename: string, rows: (string | number)[][]) => {
  const csv = rows.map((r) =>
    r.map((c) => {
      const s = String(c ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const Reports = () => {
  const [from, setFrom] = useState(startOfYear());
  const [to, setTo] = useState(today());
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);

  const load = async () => {
    setLoading(true);
    const { data: docsData, error: e1 } = await supabase
      .from("documents")
      .select("id, doc_no, doc_type, issue_date, subtotal, tax_total, grand_total, client_id, clients(name)")
      .in("doc_type", ["invoice", "bill"])
      .in("status", ["sent", "paid"])
      .gte("issue_date", from)
      .lte("issue_date", to)
      .order("issue_date");
    if (e1) { setLoading(false); return toast.error(e1.message); }
    const docList = (docsData ?? []) as unknown as DocRow[];
    setDocs(docList);

    if (docList.length) {
      const { data: itemsData, error: e2 } = await supabase
        .from("document_items")
        .select("document_id, description, quantity, line_total, tax_amount, tax_rules(code, name), inventory_items(name, item_code)")
        .in("document_id", docList.map((d) => d.id));
      if (e2) { setLoading(false); return toast.error(e2.message); }
      setItems((itemsData ?? []) as unknown as ItemRow[]);
    } else {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  // Revenue by month
  const revenueByMonth = useMemo(() => {
    const m = new Map<string, { revenue: number; tax: number; count: number }>();
    for (const d of docs) {
      const k = monthKey(d.issue_date);
      const cur = m.get(k) ?? { revenue: 0, tax: 0, count: 0 };
      cur.revenue += Number(d.subtotal) || 0;
      cur.tax += Number(d.tax_total) || 0;
      cur.count += 1;
      m.set(k, cur);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [docs]);

  // Tax by code
  const taxByCode = useMemo(() => {
    const m = new Map<string, { name: string; amount: number }>();
    for (const it of items) {
      const code = it.tax_rules?.code ?? "—";
      const name = it.tax_rules?.name ?? "Untaxed";
      const cur = m.get(code) ?? { name, amount: 0 };
      cur.amount += Number(it.tax_amount) || 0;
      m.set(code, cur);
    }
    return Array.from(m.entries())
      .filter(([, v]) => v.amount > 0)
      .sort(([, a], [, b]) => b.amount - a.amount);
  }, [items]);

  // Top clients
  const topClients = useMemo(() => {
    const m = new Map<string, { name: string; total: number; count: number }>();
    for (const d of docs) {
      const id = d.client_id ?? "—";
      const cur = m.get(id) ?? { name: d.clients?.name ?? "—", total: 0, count: 0 };
      cur.total += Number(d.grand_total) || 0;
      cur.count += 1;
      m.set(id, cur);
    }
    return Array.from(m.values()).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [docs]);

  // Top items
  const topItems = useMemo(() => {
    const m = new Map<string, { name: string; code: string; qty: number; total: number }>();
    for (const it of items) {
      const code = it.inventory_items?.item_code ?? "—";
      const name = it.inventory_items?.name ?? it.description;
      const key = `${code}|${name}`;
      const cur = m.get(key) ?? { name, code, qty: 0, total: 0 };
      cur.qty += Number(it.quantity) || 0;
      cur.total += Number(it.line_total) || 0;
      m.set(key, cur);
    }
    return Array.from(m.values()).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [items]);

  const totals = useMemo(() => ({
    revenue: docs.reduce((s, d) => s + (Number(d.subtotal) || 0), 0),
    tax: docs.reduce((s, d) => s + (Number(d.tax_total) || 0), 0),
    grand: docs.reduce((s, d) => s + (Number(d.grand_total) || 0), 0),
    docs: docs.length,
  }), [docs]);

  const exportAll = () => {
    const rows: (string | number)[][] = [];
    rows.push([`Apex Arc Engineering sales report`, `${from} to ${to}`]);
    rows.push([]);
    rows.push(["Summary"]);
    rows.push(["Documents", totals.docs]);
    rows.push(["Subtotal (revenue)", totals.revenue.toFixed(2)]);
    rows.push(["Tax collected", totals.tax.toFixed(2)]);
    rows.push(["Grand total", totals.grand.toFixed(2)]);
    rows.push([]);
    rows.push(["Revenue by month"]);
    rows.push(["Month", "Documents", "Revenue", "Tax"]);
    revenueByMonth.forEach(([k, v]) => rows.push([monthLabel(k), v.count, v.revenue.toFixed(2), v.tax.toFixed(2)]));
    rows.push([]);
    rows.push(["Tax by code"]);
    rows.push(["Code", "Name", "Amount"]);
    taxByCode.forEach(([code, v]) => rows.push([code, v.name, v.amount.toFixed(2)]));
    rows.push([]);
    rows.push(["Top 10 clients"]);
    rows.push(["Client", "Documents", "Total"]);
    topClients.forEach((c) => rows.push([c.name, c.count, c.total.toFixed(2)]));
    rows.push([]);
    rows.push(["Top 10 items"]);
    rows.push(["Code", "Item", "Qty", "Total"]);
    topItems.forEach((i) => rows.push([i.code, i.name, i.qty.toFixed(2), i.total.toFixed(2)]));

    downloadCSV(`apex-arc-sales-${from}-to-${to}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales report"
        description="Monthly revenue, tax collected by code, top clients and top items."
      >
        <Button variant="outline" size="sm" onClick={exportAll} disabled={!docs.length}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </PageHeader>

      <div className="rounded-xl border bg-card p-5 shadow-card grid md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label>From</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="space-y-1.5 flex items-end col-span-2">
          <Button onClick={load} variant="hero" size="sm" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Documents (sent/paid)" value={String(totals.docs)} />
        <KPI label="Revenue" value={formatPKR(totals.revenue)} />
        <KPI label="Tax collected" value={formatPKR(totals.tax)} />
        <KPI label="Grand total" value={formatPKR(totals.grand)} />
      </div>

      {/* Revenue by month */}
      <Section title="Revenue by month">
        {revenueByMonth.length === 0 ? <Empty /> : (
          <div className="p-5 space-y-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMonth.map(([k, v]) => ({ month: monthLabel(k), Revenue: Math.round(v.revenue), Tax: Math.round(v.tax) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    formatter={(v: number) => formatPKR(v)}
                  />
                  <Legend />
                  <Bar dataKey="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Tax" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Documents</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueByMonth.map(([k, v]) => (
                  <TableRow key={k}>
                    <TableCell>{monthLabel(k)}</TableCell>
                    <TableCell className="text-right tabular-nums">{v.count}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPKR(v.revenue)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPKR(v.tax)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tax by code */}
        <Section title="Tax collected by code">
          {taxByCode.length === 0 ? <Empty /> : (
            <div className="p-5 space-y-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taxByCode.map(([code, v]) => ({ name: `${code} — ${v.name}`, value: Math.round(v.amount) }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={2}
                    >
                      {taxByCode.map((_, i) => {
                        const palette = [
                          "hsl(var(--primary))",
                          "hsl(var(--accent))",
                          "hsl(var(--secondary))",
                          "hsl(var(--muted-foreground))",
                          "hsl(var(--destructive))",
                        ];
                        return <Cell key={i} fill={palette[i % palette.length]} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      formatter={(v: number) => formatPKR(v)}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxByCode.map(([code, v]) => (
                    <TableRow key={code}>
                      <TableCell className="font-mono text-xs">{code}</TableCell>
                      <TableCell>{v.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPKR(v.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Section>

        {/* Top clients */}
        <Section title="Top 10 clients">
          {topClients.length === 0 ? <Empty /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Docs</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.count}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPKR(c.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Section>
      </div>

      {/* Top items */}
      <Section title="Top 10 items">
        {topItems.length === 0 ? <Empty /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty sold</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topItems.map((it, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{it.code}</TableCell>
                  <TableCell>{it.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{it.qty}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPKR(it.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>
    </div>
  );
};

const KPI = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border bg-card p-5 shadow-card">
    <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="text-2xl font-bold mt-1 tabular-nums">{value}</div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border bg-card shadow-card overflow-hidden">
    <div className="px-5 py-3 border-b font-semibold text-sm">{title}</div>
    {children}
  </div>
);

const Empty = () => <div className="p-10 text-center text-sm text-muted-foreground">No data in this period.</div>;

export default Reports;
