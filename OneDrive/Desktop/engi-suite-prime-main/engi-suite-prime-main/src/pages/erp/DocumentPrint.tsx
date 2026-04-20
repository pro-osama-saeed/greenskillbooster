import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePanelBase } from "@/lib/usePanelBase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { formatPKR } from "@/lib/tax";
import { amountInWordsPKR } from "@/lib/numberToWords";

type DocType = "quotation" | "bill" | "invoice" | "challan";

const TITLES: Record<DocType, string> = {
  quotation: "Quotation",
  invoice: "Tax invoice",
  bill: "Bill",
  challan: "Delivery challan",
};

interface Doc {
  id: string;
  doc_no: string;
  doc_type: DocType;
  issue_date: string;
  status: string;
  notes: string | null;
  subtotal: number;
  tax_total: number;
  grand_total: number;
  client_id: string | null;
}

interface Line {
  id: string;
  description: string;
  quantity: number;
  unit: string | null;
  rate: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
  position: number;
  tax_rule_id: string | null;
}

interface Client {
  name: string;
  ntn: string | null;
  address: string | null;
  city: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
}

interface TaxRule { id: string; code: string; rate: number }

const DocumentPrint = () => {
  const { type, id } = useParams<{ type: DocType; id: string }>();
  const navigate = useNavigate();
  const base = usePanelBase();
  const docType = (type ?? "quotation") as DocType;

  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [taxes, setTaxes] = useState<TaxRule[]>([]);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const [{ data: d }, { data: rows }, { data: trs }] = await Promise.all([
        supabase.from("documents").select("*").eq("id", id).maybeSingle(),
        supabase.from("document_items").select("*").eq("document_id", id).order("position"),
        supabase.from("tax_rules").select("id, code, rate"),
      ]);
      setDoc(d as Doc | null);
      setLines((rows ?? []) as Line[]);
      setTaxes((trs ?? []) as TaxRule[]);
      if (d?.client_id) {
        const { data: c } = await supabase
          .from("clients")
          .select("name, ntn, address, city, contact_person, phone, email")
          .eq("id", d.client_id)
          .maybeSingle();
        setClient(c as Client | null);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="grid place-items-center min-h-screen"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }
  if (!doc) {
    return <div className="grid place-items-center min-h-screen text-muted-foreground">Document not found</div>;
  }

  // Tax breakdown grouped by tax rate
  const taxBreakdown = lines.reduce<Record<string, { rate: number; taxable: number; tax: number; code: string }>>((acc, l) => {
    const key = `${l.tax_rate}-${l.tax_rule_id ?? "none"}`;
    const code = taxes.find((t) => t.id === l.tax_rule_id)?.code ?? (l.tax_rate > 0 ? `Tax ${l.tax_rate}%` : "Zero-rated");
    const taxable = Number(l.line_total) - Number(l.tax_amount);
    if (!acc[key]) acc[key] = { rate: Number(l.tax_rate), taxable: 0, tax: 0, code };
    acc[key].taxable += taxable;
    acc[key].tax += Number(l.tax_amount);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Toolbar (hidden in print) */}
      <div className="print:hidden border-b bg-card">
        <div className="max-w-[210mm] mx-auto flex items-center justify-between px-6 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`${base}/documents/${docType}/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to editor
          </Button>
          <Button variant="hero" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable sheet */}
      <article className="print-sheet max-w-[210mm] mx-auto my-6 bg-card shadow-card border print:shadow-none print:border-0 print:my-0 p-10 print:p-8 text-foreground">
        {/* Letterhead */}
        <header className="flex items-start justify-between border-b-2 border-primary pb-5">
          <div className="flex items-start gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-md bg-background ring-1 ring-border p-1">
              <BrandLogo />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold text-primary leading-tight">Apex Arc Engineering</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Engineering · Inventory · Compliance</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pakistan<br />
                +92 305 8906453 · arcengineering86@gmail.com
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{TITLES[docType]}</div>
            <div className="font-mono text-xl font-semibold mt-1">{doc.doc_no}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Issue date: <span className="font-medium text-foreground">{new Date(doc.issue_date).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Status: <span className="font-medium uppercase text-foreground">{doc.status}</span>
            </div>
          </div>
        </header>

        {/* Client block */}
        <section className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Bill to</div>
            <div className="font-semibold">{client?.name ?? "—"}</div>
            {client?.contact_person && <div className="text-sm">{client.contact_person}</div>}
            {client?.address && <div className="text-sm text-muted-foreground">{client.address}</div>}
            {client?.city && <div className="text-sm text-muted-foreground">{client.city}</div>}
            {client?.phone && <div className="text-sm text-muted-foreground">Tel: {client.phone}</div>}
            {client?.email && <div className="text-sm text-muted-foreground">{client.email}</div>}
            {client?.ntn && <div className="text-sm mt-1">NTN: <span className="font-mono">{client.ntn}</span></div>}
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Currency</div>
            <div className="font-medium">PKR (Pakistan Rupee)</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-3 mb-1">Reference</div>
            <div className="font-mono text-sm">{doc.doc_no}</div>
          </div>
        </section>

        {/* Items */}
        <section className="mt-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-secondary text-secondary-foreground">
                <th className="text-left px-3 py-2 w-10 border border-border">#</th>
                <th className="text-left px-3 py-2 border border-border">Description</th>
                <th className="text-right px-3 py-2 w-20 border border-border">Qty</th>
                <th className="text-left px-3 py-2 w-16 border border-border">Unit</th>
                <th className="text-right px-3 py-2 w-28 border border-border">Rate</th>
                <th className="text-right px-3 py-2 w-20 border border-border">Tax %</th>
                <th className="text-right px-3 py-2 w-32 border border-border">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, idx) => (
                <tr key={l.id} className="break-inside-avoid">
                  <td className="px-3 py-2 border border-border tabular-nums">{idx + 1}</td>
                  <td className="px-3 py-2 border border-border">{l.description}</td>
                  <td className="px-3 py-2 border border-border text-right tabular-nums">{Number(l.quantity).toLocaleString("en-PK")}</td>
                  <td className="px-3 py-2 border border-border">{l.unit ?? "—"}</td>
                  <td className="px-3 py-2 border border-border text-right tabular-nums">{formatPKR(Number(l.rate))}</td>
                  <td className="px-3 py-2 border border-border text-right tabular-nums">{Number(l.tax_rate)}%</td>
                  <td className="px-3 py-2 border border-border text-right tabular-nums">{formatPKR(Number(l.line_total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals + Tax breakdown */}
        <section className="mt-6 grid grid-cols-2 gap-6 break-inside-avoid">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tax breakdown (FBR)</div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-2 py-1.5 border border-border">Tax</th>
                  <th className="text-right px-2 py-1.5 border border-border">Taxable</th>
                  <th className="text-right px-2 py-1.5 border border-border">Tax</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(taxBreakdown).map((b, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1.5 border border-border">{b.code} ({b.rate}%)</td>
                    <td className="px-2 py-1.5 border border-border text-right tabular-nums">{formatPKR(b.taxable)}</td>
                    <td className="px-2 py-1.5 border border-border text-right tabular-nums">{formatPKR(b.tax)}</td>
                  </tr>
                ))}
                {Object.keys(taxBreakdown).length === 0 && (
                  <tr><td colSpan={3} className="px-2 py-2 border border-border text-center text-muted-foreground">No tax lines</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="text-sm">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatPKR(Number(doc.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total tax</span>
                <span className="tabular-nums">{formatPKR(Number(doc.tax_total))}</span>
              </div>
              <div className="flex justify-between border-t-2 border-primary pt-2 mt-2 font-bold text-base">
                <span>Grand total</span>
                <span className="tabular-nums">{formatPKR(Number(doc.grand_total))}</span>
              </div>
              {(docType === "invoice" || docType === "bill") && (
                <div className="mt-3 rounded-md bg-muted px-3 py-2 text-xs">
                  <span className="uppercase tracking-wider text-muted-foreground">Amount in words: </span>
                  <span className="font-medium text-foreground italic">{amountInWordsPKR(Number(doc.grand_total))}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Notes */}
        {doc.notes && (
          <section className="mt-6 break-inside-avoid">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Notes / Terms</div>
            <p className="text-sm whitespace-pre-wrap text-foreground/90">{doc.notes}</p>
          </section>
        )}

        {/* Signature area */}
        <section className="mt-12 grid grid-cols-2 gap-12 break-inside-avoid">
          <div>
            <div className="border-t border-foreground/40 pt-2 text-xs text-muted-foreground">Prepared by</div>
            <div className="text-sm font-medium mt-6">Apex Arc Engineering Authorized Signatory</div>
          </div>
          <div>
            <div className="border-t border-foreground/40 pt-2 text-xs text-muted-foreground">Received by (client)</div>
            <div className="text-sm text-muted-foreground mt-6">Name, signature & stamp</div>
          </div>
        </section>

        <footer className="mt-10 pt-3 border-t text-[10px] text-center text-muted-foreground">
          This is a computer-generated document from Apex Arc Engineering. For questions contact arcengineering86@gmail.com.
        </footer>
      </article>
    </div>
  );
};

export default DocumentPrint;
