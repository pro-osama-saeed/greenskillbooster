import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import PageHeader from "@/components/erp/PageHeader";
import EmptyState from "@/components/erp/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ShieldCheck, Users as UsersIcon, Check, X, Clock } from "lucide-react";

interface ProfileRow {
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  organization: string | null;
  role_interest: string | null;
  approval_status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
  roles: ("admin" | "staff")[];
}

const Users = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "user_id, email, full_name, phone, organization, role_interest, approval_status, rejection_reason, created_at"
        )
        .order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setLoading(false);
    if (pErr || rErr) return toast.error((pErr ?? rErr)!.message);

    const byUser = new Map<string, ("admin" | "staff")[]>();
    (roles ?? []).forEach((r) => {
      const arr = byUser.get(r.user_id) ?? [];
      arr.push(r.role as "admin" | "staff");
      byUser.set(r.user_id, arr);
    });

    setRows(
      (profiles ?? []).map((p) => ({
        ...(p as Omit<ProfileRow, "roles">),
        roles: byUser.get(p.user_id) ?? [],
      }))
    );
  };

  useEffect(() => {
    load();
  }, []);

  const pending = useMemo(() => rows.filter((r) => r.approval_status === "pending"), [rows]);
  const approved = useMemo(() => rows.filter((r) => r.approval_status === "approved"), [rows]);
  const rejected = useMemo(() => rows.filter((r) => r.approval_status === "rejected"), [rows]);

  const approve = async (userId: string) => {
    setBusyId(userId);
    const { error } = await supabase
      .from("profiles")
      .update({
        approval_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: user?.id,
        rejection_reason: null,
      })
      .eq("user_id", userId);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("User approved — they can now sign in.");
    load();
  };

  const reject = async (userId: string) => {
    const reason = window.prompt("Reason for rejection (optional):") ?? "";
    setBusyId(userId);
    const { error } = await supabase
      .from("profiles")
      .update({
        approval_status: "rejected",
        rejection_reason: reason || null,
      })
      .eq("user_id", userId);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("User rejected");
    load();
  };

  const promote = async (userId: string) => {
    setBusyId(userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("Promoted to admin");
    load();
  };

  const revoke = async (userId: string) => {
    if (userId === user?.id) return toast.error("You cannot revoke your own admin role");
    setBusyId(userId);
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("Admin revoked");
    load();
  };

  const renderApprovalActions = (r: ProfileRow) => (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="outline" disabled={busyId === r.user_id} onClick={() => approve(r.user_id)}>
        <Check className="h-3.5 w-3.5 mr-1" /> Approve
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive hover:text-destructive"
        disabled={busyId === r.user_id}
        onClick={() => reject(r.user_id)}
      >
        <X className="h-3.5 w-3.5 mr-1" /> Reject
      </Button>
    </div>
  );

  const renderPendingTable = (list: ProfileRow[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Organization</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((r) => (
          <TableRow key={r.user_id}>
            <TableCell className="font-medium">{r.full_name ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{r.email ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{r.phone ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{r.organization ?? "—"}</TableCell>
            <TableCell>{r.role_interest ?? "—"}</TableCell>
            <TableCell className="text-right">{renderApprovalActions(r)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderActiveTable = (list: ProfileRow[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Roles</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((r) => {
          const isAdminRow = r.roles.includes("admin");
          const isSelf = r.user_id === user?.id;
          return (
            <TableRow key={r.user_id}>
              <TableCell className="font-medium">{r.full_name ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{r.email ?? "—"}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {r.roles.map((role) => (
                    <Badge key={role} variant={role === "admin" ? "default" : "secondary"} className="font-normal">
                      {role === "admin" && <ShieldCheck className="h-3 w-3 mr-1" />}
                      {role}
                    </Badge>
                  ))}
                  {r.roles.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {isAdminRow ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isSelf || busyId === r.user_id}
                    onClick={() => revoke(r.user_id)}
                    className="text-destructive hover:text-destructive"
                    title={isSelf ? "Cannot revoke your own admin role" : ""}
                  >
                    Revoke admin
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled={busyId === r.user_id} onClick={() => promote(r.user_id)}>
                    Promote to admin
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  const renderRejectedTable = (list: ProfileRow[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((r) => (
          <TableRow key={r.user_id}>
            <TableCell className="font-medium">{r.full_name ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{r.email ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{r.rejection_reason ?? "—"}</TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="outline" disabled={busyId === r.user_id} onClick={() => approve(r.user_id)}>
                <Check className="h-3.5 w-3.5 mr-1" /> Approve
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Approve new sign-ups and manage admin / staff access." />

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" /> Pending
              {pending.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1.5">
                  {pending.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <div className="rounded-xl border bg-card shadow-card">
              {pending.length === 0 ? (
                <EmptyState
                  icon={<Check className="h-5 w-5" />}
                  title="No pending approvals"
                  description="All registered users have been reviewed."
                />
              ) : (
                renderPendingTable(pending)
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-4">
            <div className="rounded-xl border bg-card shadow-card">
              {approved.length === 0 ? (
                <EmptyState
                  icon={<UsersIcon className="h-5 w-5" />}
                  title="No approved users yet"
                  description="Approved users will appear here."
                />
              ) : (
                renderActiveTable(approved)
              )}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-4">
            <div className="rounded-xl border bg-card shadow-card">
              {rejected.length === 0 ? (
                <EmptyState
                  icon={<X className="h-5 w-5" />}
                  title="No rejected users"
                  description="Rejected users will appear here. You can re-approve them at any time."
                />
              ) : (
                renderRejectedTable(rejected)
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Users;
