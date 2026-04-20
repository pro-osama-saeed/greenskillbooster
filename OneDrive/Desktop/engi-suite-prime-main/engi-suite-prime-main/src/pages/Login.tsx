import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Clock } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const signInSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
});

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = signInSchema.safeParse(data);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setLoading(true);
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }

    const userId = signInData.user?.id;
    if (!userId) {
      setLoading(false);
      return toast.error("Sign-in failed");
    }

    // Approval gate: check profile status before allowing access
    const { data: profile } = await supabase
      .from("profiles")
      .select("approval_status, rejection_reason")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile && profile.approval_status !== "approved") {
      await supabase.auth.signOut();
      setLoading(false);
      if (profile.approval_status === "rejected") {
        toast.error(
          profile.rejection_reason
            ? `Your account was not approved: ${profile.rejection_reason}`
            : "Your account was not approved. Please contact support."
        );
      } else {
        toast.message("Your account is under review", {
          description: "Please wait for admin approval before signing in.",
          icon: <Clock className="h-4 w-4" />,
        });
      }
      return;
    }

    // Role-based panel routing — admins go to /admin, staff to /staff
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");

    setLoading(false);
    toast.success("Welcome back");
    navigate(isAdmin ? "/admin" : "/staff");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left visual */}
      <div className="hidden md:flex relative overflow-hidden bg-gradient-hero text-primary-foreground p-12 flex-col justify-between">
        <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-white/10 backdrop-blur p-1">
            <BrandLogo />
          </span>
          Apex Arc Engineering
        </Link>
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight">
            Engineering ERP, built for the field and the finance team.
          </h2>
          <p className="mt-3 text-primary-foreground/80 max-w-md">
            Quotations, invoices, inventory, FBR-aligned taxes, delivery challans — one system.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">
          Note: new accounts require admin approval before sign-in.
        </p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-sm">
          <Link to="/" className="md:hidden inline-flex items-center gap-2 mb-6 font-display text-lg font-bold text-primary">
            <span className="grid h-8 w-8 place-items-center rounded-md ring-1 ring-border p-0.5">
              <BrandLogo />
            </span>
            Apex Arc Engineering
          </Link>

          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Access your Apex Arc Engineering ERP workspace.</p>
          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="si-email">Email</Label>
              <Input id="si-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="si-password">Password</Label>
              <Input
                id="si-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            New to Apex Arc Engineering?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
