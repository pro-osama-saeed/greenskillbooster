import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Ban, CheckCircle, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  created_at: string;
  suspended: boolean;
  suspension_reason: string;
  suspended_until: string;
  warnings_count: number;
  user_stats: {
    total_actions: number;
    total_points: number;
  };
  user_roles?: Array<{ role: string }>;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [suspensionDialog, setSuspensionDialog] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [roleDialog, setRoleDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_stats (
          total_actions,
          total_points
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (profilesError) {
      toast.error('Failed to load users');
      setLoading(false);
      return;
    }

    if (profilesData && profilesData.length > 0) {
      const userIds = profilesData.map(p => p.id);
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const rolesMap = new Map<string, Array<{ role: string }>>();
      rolesData?.forEach(role => {
        if (!rolesMap.has(role.user_id)) {
          rolesMap.set(role.user_id, []);
        }
        rolesMap.get(role.user_id)?.push({ role: role.role });
      });

      const enrichedUsers = profilesData.map(profile => ({
        ...profile,
        user_roles: rolesMap.get(profile.id) || []
      }));

      setUsers(enrichedUsers);
    }

    setLoading(false);
  };

  const handleRoleChange = async (role: 'admin' | 'co_admin' | 'moderator') => {
    if (!selectedUser) return;

    try {
      setProcessing(true);
      const currentRoles = selectedUser.user_roles?.map((r: any) => r.role) || [];
      
      if (currentRoles.includes(role)) {
        const { error } = await supabase.rpc('revoke_user_role', {
          p_user_id: selectedUser.id,
          p_role: role
        });
        if (error) throw error;
        toast.success(`${role} role removed`);
      } else {
        const { error } = await supabase.rpc('assign_user_role', {
          p_user_id: selectedUser.id,
          p_role: role
        });
        if (error) throw error;
        toast.success(`${role} role assigned`);
      }

      setRoleDialog(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error changing user role:', error);
      toast.error(error.message || 'Failed to change user role');
    } finally {
      setProcessing(false);
    }
  };

  const suspendUser = async () => {
    if (!selectedUser || !suspensionReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setProcessing(true);

    const { error } = await supabase.rpc('suspend_user', {
      p_user_id: selectedUser.id,
      p_reason: suspensionReason,
      p_duration_days: suspensionDays ? parseInt(suspensionDays) : null
    });

    if (error) {
      toast.error('Failed to suspend user');
      setProcessing(false);
      return;
    }

    toast.success('User suspended successfully');
    setSuspensionDialog(false);
    setSuspensionReason('');
    setSuspensionDays('');
    setSelectedUser(null);
    setProcessing(false);
    fetchUsers();
  };

  const unsuspendUser = async (userId: string) => {
    const { error } = await supabase.rpc('unsuspend_user', {
      p_user_id: userId
    });

    if (error) {
      toast.error('Failed to unsuspend user');
      return;
    }

    toast.success('User unsuspended successfully');
    fetchUsers();
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage users and suspensions</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.username}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Actions</p>
                  <p className="font-semibold">{user.user_stats?.total_actions || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Points</p>
                  <p className="font-semibold">{user.user_stats?.total_points || 0}</p>
                </div>
              </div>

              {user.user_roles && user.user_roles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {user.user_roles.map((r: any) => (
                    <Badge key={r.role} variant="secondary" className="text-xs">
                      {r.role}
                    </Badge>
                  ))}
                </div>
              )}

              {user.warnings_count > 0 && (
                <Badge variant="secondary">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {user.warnings_count} warning{user.warnings_count > 1 ? 's' : ''}
                </Badge>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedUser(user);
                    setRoleDialog(true);
                  }}
                >
                  Manage Roles
                </Button>
                
                {user.suspended ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => unsuspendUser(user.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Unsuspend
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedUser(user);
                      setSuspensionDialog(true);
                    }}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend
                  </Button>
                )}
              </div>

              {user.suspended && (
                <div className="pt-2 border-t">
                  <Badge variant="destructive" className="w-full justify-center mb-1">
                    <Ban className="w-3 h-3 mr-1" />
                    Suspended
                  </Badge>
                  {user.suspension_reason && (
                    <p className="text-xs text-muted-foreground">{user.suspension_reason}</p>
                  )}
                  {user.suspended_until && (
                    <p className="text-xs text-muted-foreground">
                      Until: {new Date(user.suspended_until).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={suspensionDialog} onOpenChange={setSuspensionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspending {selectedUser?.username}. Provide a reason for the suspension.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Reason</label>
              <Textarea
                placeholder="Why is this user being suspended?"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Duration (days)</label>
              <Input
                type="number"
                placeholder="Leave empty for permanent"
                value={suspensionDays}
                onChange={(e) => setSuspensionDays(e.target.value)}
              />
            </div>
            <Button
              onClick={suspendUser}
              disabled={processing}
              className="w-full"
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Suspend User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialog} onOpenChange={setRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              Select a role to assign or remove for {selectedUser?.username}
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Current roles:</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedUser?.user_roles && selectedUser.user_roles.length > 0 ? (
                    selectedUser.user_roles.map((r: any) => (
                      <Badge key={r.role} variant="secondary">{r.role}</Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No roles assigned</span>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={processing}
              onClick={() => handleRoleChange('admin')}
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedUser?.user_roles?.some((r: any) => r.role === 'admin') ? '✓ ' : ''}
              Admin
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={processing}
              onClick={() => handleRoleChange('co_admin')}
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedUser?.user_roles?.some((r: any) => r.role === 'co_admin') ? '✓ ' : ''}
              Co-Admin
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={processing}
              onClick={() => handleRoleChange('moderator')}
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedUser?.user_roles?.some((r: any) => r.role === 'moderator') ? '✓ ' : ''}
              Moderator
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
