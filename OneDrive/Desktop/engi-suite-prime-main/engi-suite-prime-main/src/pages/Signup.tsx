import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const signUpSchema = z
  .object({
    full_name: z.string().trim().min(2, "Full name is required").max(100),
    email: z.string().trim().email("Enter a valid email").max(255),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number")
      .max(20)
      .regex(/^[+0-9\s\-()]+$/, "Phone may only contain digits, spaces, +, - and ()"),
    organization: z.string().trim().max(120).optional().or(z.literal("")),
    role_interest: z.enum(["Student", "Engineer", "Client", "Contractor", "Other"], {
      message: "Please select your role",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(/[A-Za-z]/, "Password must contain a letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

const passwordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
};

const strengthMeta = [
  { label: "Too weak", color: "bg-destructive" },
  { label: "Weak", color: "bg-destructive" },
  { label: "Fair", color: "bg-yellow-500" },
  { label: "Good", color: "bg-blue-500" },
  { label: "Strong", color: "bg-green-500" },
];

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [password, setPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    const parsed = signUpSchema.safeParse(data);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          organization: parsed.data.organization || null,
          role_interest: parsed.data.role_interest,
        },
      },
    });

    // Make sure we don't keep them logged in even if Supabase auto-confirms
    await supabase.auth.signOut();
    setLoading(false);

    if (error) return toast.error(error.message);
    setSubmitted(true);
    toast.success("Registration submitted. Waiting for admin approval.");
  };

  if (submitted) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-surface p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-card text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold">Registration submitted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you for registering with Apex Arc Engineering. Your account is now <b>pending admin approval</b>.
            You will be notified once your account has been reviewed.
          </p>
          <div className="mt-6 grid gap-2">
            <Button onClick={() => navigate("/login")} variant="hero">Back to sign in</Button>
            <Button asChild variant="ghost"><Link to="/">Go to homepage</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  const score = passwordStrength(password);
  const meta = strengthMeta[score];

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.1fr]">
      {/* Brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-hero text-primary-foreground p-12 flex-col justify-between">
        <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-white/10 backdrop-blur p-1">
            <BrandLogo />
          </span>
          Apex Arc Engineering
        </Link>
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight">
            Join the Apex Arc Engineering platform.
          </h2>
          <p className="mt-3 text-primary-foreground/80 max-w-md">
            One workspace for quotations, invoices, inventory and FBR-aligned tax — purpose-built for
            engineering teams.
          </p>
          <div className="mt-8 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 mt-0.5 text-primary-foreground/90" />
              <p className="text-primary-foreground/80">
                Every account is verified by an administrator before access is granted, keeping your
                workspace secure.
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-primary-foreground/60">
          Already have an account? <Link to="/login" className="underline">Sign in</Link>
        </p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-lg">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-6 font-display text-lg font-bold text-primary">
            <span className="grid h-8 w-8 place-items-center rounded-md ring-1 ring-border p-0.5">
              <BrandLogo />
            </span>
            Apex Arc Engineering
          </Link>

          <h1 className="font-display text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in your details. An administrator will review and approve your access.
          </p>

          <form onSubmit={handleSignUp} className="mt-6 space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" placeholder="Ali Khan" required maxLength={100} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+92 300 1234567" required />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="organization" name="organization" placeholder="Apex Arc Engineering Pvt Ltd" maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role_interest">Role / interest</Label>
                <Select name="role_interest" required>
                  <SelectTrigger id="role_interest"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineer">Engineer</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Contractor">Contractor</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < score ? meta.color : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {password.length === 0
                  ? "At least 8 characters with letters and numbers."
                  : `Strength: ${meta.label}`}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required />
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
