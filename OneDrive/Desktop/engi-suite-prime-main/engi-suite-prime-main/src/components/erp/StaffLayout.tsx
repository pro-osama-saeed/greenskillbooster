import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, FileText, Package, Users, Truck, LogOut, ShieldCheck,
  Receipt, Send, Wallet, History, ClipboardList, BarChart3, ScrollText,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const items = [
  { to: "/staff", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/staff/quotations", label: "Quotations", icon: FileText },
  { to: "/staff/invoices", label: "Invoices", icon: Receipt },
  { to: "/staff/bills", label: "Bills", icon: FileText },
  { to: "/staff/challans", label: "Delivery challans", icon: Send },
  { to: "/staff/payments", label: "Payments", icon: Wallet },
  { to: "/staff/inventory", label: "Inventory", icon: Package },
  { to: "/staff/inventory/movements", label: "Stock movements", icon: History },
  { to: "/staff/purchase-orders", label: "Purchase orders", icon: ClipboardList },
  { to: "/staff/clients", label: "Clients", icon: Users },
  { to: "/staff/clients/statement", label: "Client statement", icon: ScrollText },
  { to: "/staff/vendors", label: "Vendors", icon: Truck },
  { to: "/staff/reports", label: "Reports", icon: BarChart3 },
];

const StaffLayout = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground">
        <Link to="/staff" className="flex items-center gap-2 px-6 h-16 border-b border-sidebar-border">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-sidebar-primary-foreground/10 p-1">
            <BrandLogo />
          </span>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg leading-tight">Apex Arc</span>
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Staff panel</span>
          </div>
        </Link>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-smooth ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <it.icon className="h-4 w-4" /> {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-2 px-2 text-xs text-sidebar-foreground/70">
            <ShieldCheck className="h-3.5 w-3.5" />
            Staff · {user?.email}
          </div>
          <Button onClick={handleSignOut} variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-14 border-b bg-card flex items-center justify-between px-4">
          <Link to="/staff" className="font-display font-bold text-primary">Apex Arc · Staff</Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign out</Button>
        </header>
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
