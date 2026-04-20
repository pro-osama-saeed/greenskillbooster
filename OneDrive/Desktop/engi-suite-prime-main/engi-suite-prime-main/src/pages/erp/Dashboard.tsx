import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { usePanelBase } from "@/lib/usePanelBase";
import { FileText, Package, Users, TrendingUp, Plus, Truck, Wallet, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/tax";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar,
} from "recharts";
import { format } from "date-fns";

interface Counts { clients: number; vendors: number; items: number; lowStock: number; outstanding: number }
interface OutstandingByClient { client: string; due: number }
interface RevenuePoint { month: string; revenue: number; }

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const base = usePanelBase();
  const [counts, setCounts] = useState<Counts>({ clients: 0, vendors: 0, items: 0, lowStock: 0, outstanding: 0 });
  const [byClient, setByClient] = useState<OutstandingByClient[]>([]);
  const [revenueSeries, setRevenueSeries] = useState<RevenuePoint[]>([]);
  const [stockSeries, setStockSeries] = useState<{ name: string; stock: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [c, v, i, items, docs, pays, revenueDocs, topStock] = await Promise.all([
        supabase.from("clients").select("*", { count: "exact", head: true }),
        supabase.from("vendors").select("*", { count: "exact", head: true }),
        supabase.from("inventory_items").select("*", { count: "exact", head: true }),
        supabase.from("inventory_items").select("current_stock, reorder_level"),
        supabase.from("documents").select("id, grand_total, client_id, clients(name)").in("doc_type", ["invoice", "bill"]),
        supabase.from("payments").select("document_id, amount"),
        supabase.from("documents").select("issue_date, subtotal").in("doc_type", ["invoice", "bill"]).in("status", ["sent", "paid"]).order("issue_date"),
        supabase.from("inventory_items").select("name, current_stock").order("current_stock", { ascending: false }).limit(6),
      ]);
      const low = (items.data ?? []).filter(
        (r: { current_stock: number; reorder_level: number }) => r.reorder_level > 0 && r.current_stock <= r.reorder_level,
      ).length;

      const paidByDoc = new Map<string, number>();
      (pays.data ?? []).forEach((p) => paidByDoc.set(p.document_id, (paidByDoc.get(p.document_id) ?? 0) + Number(p.amount)));

      const dueByClient = new Map<string, number>();
      let totalOut = 0;
      (docs.data ?? []).forEach((d: { id: string; grand_total: number; client_id: string | null; clients: { name: string } | null }) => {
        const due = Math.max(Number(d.grand_total) - (paidByDoc.get(d.id) ?? 0), 0);
        if (due > 0) {
          totalOut += due;
          const name = d.clients?.name ?? "Unknown client";
          dueByClient.set(name, (dueByClient.get(name) ?? 0) + due);
        }
      });

      setCounts({
        clients: c.count ?? 0,
        vendors: v.count ?? 0,
        items: i.count ?? 0,
        lowStock: low,
        outstanding: totalOut,
      });
      setByClient(
        Array.from(dueByClient.entries())
          .map(([client, due]) => ({ client, due }))
          .sort((a, b) => b.due - a.due)
          .slice(0, 6),
      );

      // Revenue series (last 6 months)
      const monthMap = new Map<string, number>();
      (revenueDocs.data ?? []).forEach((d: { issue_date: string; subtotal: number }) => {
        const k = d.issue_date.slice(0, 7);
        monthMap.set(k, (monthMap.get(k) ?? 0) + Number(d.subtotal || 0));
      });
      const series = Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([k, revenue]) => ({ month: format(new Date(`${k}-01`), "MMM"), revenue: Math.round(revenue) }));
      setRevenueSeries(series);

      setStockSeries(
        (topStock.data ?? []).map((s: { name: string; current_stock: number }) => ({
          name: s.name.length > 14 ? `${s.name.slice(0, 13)}…` : s.name,
          stock: Number(s.current_stock) || 0,
        })),
      );
    };
    load();
  }, []);

  const kpis = [
    { label: "Clients", value: counts.clients, icon: Users, to: `${base}/clients`, money: false },
    { label: "Vendors", value: counts.vendors, icon: Truck, to: `${base}/vendors`, money: false },
    { label: "Inventory items", value: counts.items, icon: Package, to: `${base}/inventory`, money: false },
    { label: "Low-stock alerts", value: counts.lowStock, icon: TrendingUp, to: `${base}/inventory`, money: false },
    { label: "Outstanding receivables", value: counts.outstanding, icon: Wallet, to: `${base}/payments`, money: true },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{user?.email}</span>
          </p>
          <h1 className="font-display text-3xl font-bold mt-1">
            {isAdmin ? "Admin dashboard" : "Workspace"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link to={`${base}/clients`}><Plus className="h-4 w-4 mr-1" /> Client</Link></Button>
          <Button asChild variant="outline" size="sm"><Link to={`${base}/vendors`}><Plus className="h-4 w-4 mr-1" /> Vendor</Link></Button>
          <Button asChild variant="hero" size="sm"><Link to={`${base}/inventory`}><Package className="h-4 w-4 mr-1" /> Inventory</Link></Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <Link key={k.label} to={k.to} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-elegant transition-smooth group">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{k.label}</span>
              <span className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-secondary-foreground group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-smooth">
                <k.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 font-display text-2xl font-bold tabular-nums">
              {k.money ? formatPKR(k.value) : k.value}
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Revenue trend (last 6 months)</h2>
          {revenueSeries.length === 0 ? (
            <div className="mt-6 grid place-items-center py-12 border border-dashed rounded-lg text-sm text-muted-foreground">
              No invoiced revenue yet
            </div>
          ) : (
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries}>
                  <defs>
                    <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    formatter={(v: number) => formatPKR(v)}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="font-semibold flex items-center gap-2"><Package className="h-4 w-4" /> Top stock on hand</h2>
          {stockSeries.length === 0 ? (
            <div className="mt-6 grid place-items-center py-12 border border-dashed rounded-lg text-sm text-muted-foreground">
              No inventory items yet
            </div>
          ) : (
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockSeries} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="stock" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="font-semibold flex items-center gap-2"><Wallet className="h-4 w-4" /> Outstanding by client</h2>
          {byClient.length === 0 ? (
            <div className="mt-6 grid place-items-center py-12 border border-dashed rounded-lg text-sm text-muted-foreground">
              All invoices settled — nothing outstanding
            </div>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {byClient.map((b) => (
                <li key={b.client} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span className="font-medium">{b.client}</span>
                  <span className="tabular-nums text-warning font-semibold">{formatPKR(b.due)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Quick links</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Link to={`${base}/quotations`} className="rounded-md border p-3 hover:bg-muted/50">Quotations</Link>
            <Link to={`${base}/invoices`} className="rounded-md border p-3 hover:bg-muted/50">Invoices</Link>
            <Link to={`${base}/payments`} className="rounded-md border p-3 hover:bg-muted/50">Payments</Link>
            <Link to={`${base}/inventory/movements`} className="rounded-md border p-3 hover:bg-muted/50">Stock movements</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
