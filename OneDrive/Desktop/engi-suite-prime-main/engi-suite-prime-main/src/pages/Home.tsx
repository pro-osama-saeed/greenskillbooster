import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bolt, HardHat, Wrench, Building2, FileText, Package, Calculator, ShieldCheck } from "lucide-react";

const features = [
  { icon: FileText, title: "Quote → Invoice flow", desc: "One-click conversion from quotation to bill, invoice and delivery challan." },
  { icon: Package, title: "Inventory + rate history", desc: "Last 3 client rates suggested on every line item." },
  { icon: Calculator, title: "FBR-ready tax engine", desc: "FST 17%, IT 3%, KAPRA 1%, PEPRA 4%, inclusive or exclusive." },
  { icon: ShieldCheck, title: "Audit trail", desc: "Every rate change, document and approval is tracked." },
];

const disciplines = [
  { icon: Bolt, label: "Electrical" },
  { icon: Wrench, label: "Mechanical" },
  { icon: Building2, label: "Civil" },
  { icon: HardHat, label: "Industrial" },
];

const Home = () => (
  <>
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, hsl(38 92% 60% / 0.4), transparent 40%), radial-gradient(circle at 80% 60%, hsl(200 90% 60% / 0.3), transparent 40%)",
      }} />
      <div className="container relative py-24 md:py-32 grid gap-10 md:grid-cols-2 items-center animate-fade-in">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Engineering ERP · PKR · FBR-aligned
          </span>
          <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold leading-tight">
            Run your engineering firm on one platform.
          </h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-xl">
            Apex Arc Engineering unifies quotations, billing, inventory, taxes and delivery challans — built for electrical,
            mechanical, civil and industrial contractors.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/login">Start free <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/5 border-white/20 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
              <Link to="/signup">Create account</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-6">
            {disciplines.map((d) => (
              <div key={d.label} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <d.icon className="h-4 w-4 text-accent" /> {d.label}
              </div>
            ))}
          </div>
        </div>

        {/* Mock dashboard card */}
        <div className="relative animate-fade-in-slow">
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-elegant">
            <div className="flex items-center justify-between text-xs text-primary-foreground/70">
              <span>Monthly revenue</span><span>PKR</span>
            </div>
            <div className="mt-2 font-display text-3xl font-bold">₨ 4,820,500</div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { l: "Invoices", v: "128" },
                { l: "Quotations", v: "42" },
                { l: "Clients", v: "67" },
              ].map((s) => (
                <div key={s.l} className="rounded-lg bg-white/5 p-3">
                  <div className="text-xs text-primary-foreground/70">{s.l}</div>
                  <div className="font-semibold mt-1">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              {[
                ["INV-00128", "Paid", "342,000"],
                ["QT-00042", "Sent", "1,210,400"],
                ["DC-00097", "Draft", "—"],
              ].map(([d, s, a]) => (
                <div key={d} className="flex items-center justify-between text-sm rounded-md bg-white/5 px-3 py-2">
                  <span className="font-mono text-primary-foreground/80">{d}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">{s}</span>
                  <span className="font-medium">₨ {a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="container py-20">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Built for the way engineering firms actually operate.
        </h2>
        <p className="mt-3 text-muted-foreground">
          From the field to the finance team, Apex Arc Engineering replaces spreadsheets and disconnected tools with a single
          source of truth.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border bg-card p-6 shadow-card hover:shadow-elegant transition-smooth">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-gradient-primary text-primary-foreground">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="container pb-24">
      <div className="rounded-2xl bg-gradient-primary p-10 md:p-14 text-primary-foreground shadow-elegant flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="font-display text-2xl md:text-3xl font-bold">Ready to streamline your back office?</h3>
          <p className="mt-2 text-primary-foreground/80 max-w-xl">Create your account in under a minute. New sign-ups are reviewed and approved by an admin before access is granted.</p>
        </div>
        <Button asChild variant="hero" size="lg">
          <Link to="/login">Create your account <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
    </section>
  </>
);

export default Home;
