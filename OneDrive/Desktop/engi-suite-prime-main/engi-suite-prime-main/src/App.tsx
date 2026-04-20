import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import RoleRoute from "@/components/RoleRoute";
import PanelRedirect from "@/components/PanelRedirect";
import SiteLayout from "@/components/site/SiteLayout";
import AdminLayout from "@/components/erp/AdminLayout";
import StaffLayout from "@/components/erp/StaffLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/erp/Dashboard";
import Clients from "./pages/erp/Clients";
import Vendors from "./pages/erp/Vendors";
import Inventory from "./pages/erp/Inventory";
import Documents from "./pages/erp/Documents";
import DocumentEditor from "./pages/erp/DocumentEditor";
import DocumentPrint from "./pages/erp/DocumentPrint";
import Payments from "./pages/erp/Payments";
import StockMovements from "./pages/erp/StockMovements";
import Users from "./pages/erp/Users";
import TaxSettings from "./pages/erp/TaxSettings";
import ModulePlaceholder from "./pages/erp/ModulePlaceholder";
import PurchaseOrders from "./pages/erp/PurchaseOrders";
import PurchaseOrderEditor from "./pages/erp/PurchaseOrderEditor";
import ClientStatement from "./pages/erp/ClientStatement";
import Reports from "./pages/erp/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * Operational routes shared by both admin and staff panels.
 * Mounted twice — once under /admin and once under /staff — so that
 * the active panel is encoded in the URL and enforced by RoleRoute.
 */
const sharedOperationalRoutes = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="quotations" element={<Documents docType="quotation" />} />
    <Route path="invoices" element={<Documents docType="invoice" />} />
    <Route path="bills" element={<Documents docType="bill" />} />
    <Route path="challans" element={<Documents docType="challan" />} />
    <Route path="documents/:type/:id" element={<DocumentEditor />} />
    <Route path="documents/:type/:id/print" element={<DocumentPrint />} />
    <Route path="inventory" element={<Inventory />} />
    <Route path="inventory/movements" element={<StockMovements />} />
    <Route path="payments" element={<Payments />} />
    <Route path="clients" element={<Clients />} />
    <Route path="clients/statement" element={<ClientStatement />} />
    <Route path="vendors" element={<Vendors />} />
    <Route path="purchase-orders" element={<PurchaseOrders />} />
    <Route path="purchase-orders/:id" element={<PurchaseOrderEditor />} />
    <Route path="reports" element={<Reports />} />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Public marketing site */}
            {/* Public marketing site */}
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Legacy /erp entry — send users to their own panel */}
            <Route path="/erp/*" element={<PanelRedirect />} />

            {/* Admin panel — strictly admin-only */}
            <Route
              path="/admin"
              element={
                <RoleRoute allow="admin">
                  <AdminLayout />
                </RoleRoute>
              }
            >
              {sharedOperationalRoutes}
              <Route path="users" element={<Users />} />
              <Route path="tax" element={<TaxSettings />} />
              <Route
                path="settings"
                element={<ModulePlaceholder title="Admin settings" description="Company details and preferences." />}
              />
            </Route>

            {/* Staff panel — strictly staff-only (no admin modules) */}
            <Route
              path="/staff"
              element={
                <RoleRoute allow="staff">
                  <StaffLayout />
                </RoleRoute>
              }
            >
              {sharedOperationalRoutes}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
