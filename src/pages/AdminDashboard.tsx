import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  Users, Activity, Award, TrendingUp, Calendar, 
  Shield, CheckCircle, XCircle, Eye, EyeOff, Search, UserX, UserCheck 
} from "lucide-react";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActions: 0,
    totalBadges: 0,
    activeUsers: 0,
  });
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [climateActions, setClimateActions] = useState<any[]>([]);
  const [badgeForm, setBadgeForm] = useState({
    userId: "",
    eventName: "",
    eventIcon: "🎉",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [pointsAdjustment, setPointsAdjustment] = useState(0);
  const [suspensionReason, setSuspensionReason] = useState("");

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) {
      toast.error("Please sign in");
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("Access denied", {
          description: "You don't have admin privileges",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load platform statistics
      const [profilesRes, actionsRes, badgesRes, statsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("climate_actions").select("*"),
        supabase.from("user_achievements").select("id", { count: "exact", head: true }),
        supabase.from("user_stats").select("*"),
      ]);

      setStats({
        totalUsers: profilesRes.count || 0,
        totalActions: actionsRes.data?.length || 0,
        totalBadges: badgesRes.count || 0,
        activeUsers: statsRes.data?.filter(s => s.total_actions > 0).length || 0,
      });

      // Process engagement data (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const engagementByDay = last7Days.map(date => {
        const actionsOnDay = actionsRes.data?.filter(
          a => a.created_at.split('T')[0] === date
        ).length || 0;
        return {
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          actions: actionsOnDay,
        };
      });
      setEngagementData(engagementByDay);

      // Process category data
      const categories = actionsRes.data?.reduce((acc: any, action) => {
        const cat = action.category || 'other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      const categoryChartData = Object.entries(categories || {}).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      }));
      setCategoryData(categoryChartData);

      // Load climate actions for moderation
      const { data: actionsWithProfiles } = await supabase
        .from("climate_actions")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      setClimateActions(actionsWithProfiles || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActionVisibility = async (actionId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from("climate_actions")
        .update({ is_public: !isPublic })
        .eq("id", actionId);

      if (error) throw error;

      toast.success(`Action ${!isPublic ? 'made public' : 'hidden'}`);
      loadDashboardData();
    } catch (error) {
      console.error("Error updating action:", error);
      toast.error("Failed to update action");
    }
  };

  const deleteAction = async (actionId: string) => {
    if (!confirm("Are you sure you want to delete this action?")) return;

    try {
      const { error } = await supabase
        .from("climate_actions")
        .delete()
        .eq("id", actionId);

      if (error) throw error;

      toast.success("Action deleted");
      loadDashboardData();
    } catch (error) {
      console.error("Error deleting action:", error);
      toast.error("Failed to delete action");
    }
  };

  const awardBadge = async () => {
    if (!badgeForm.userId || !badgeForm.eventName) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("award_event_badge", {
        p_user_id: badgeForm.userId,
        p_event_name: badgeForm.eventName,
        p_event_icon: badgeForm.eventIcon,
      });

      if (error) throw error;

      toast.success("Badge awarded successfully!");
      setBadgeForm({ userId: "", eventName: "", eventIcon: "🎉" });
      loadDashboardData();
    } catch (error) {
      console.error("Error awarding badge:", error);
      toast.error("Failed to award badge");
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_stats(*),
          user_achievements(count)
        `)
        .ilike("username", `%${query}%`)
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    }
  };

  const loadUserDetails = async (userId: string) => {
    try {
      const [profileRes, statsRes, achievementsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("user_stats").select("*").eq("user_id", userId).single(),
        supabase.from("user_achievements").select("*").eq("user_id", userId),
      ]);

      if (profileRes.error) throw profileRes.error;

      setSelectedUser({
        ...profileRes.data,
        stats: statsRes.data,
        achievements: achievementsRes.data || [],
      });
    } catch (error) {
      console.error("Error loading user details:", error);
      toast.error("Failed to load user details");
    }
  };

  const adjustUserPoints = async () => {
    if (!selectedUser || pointsAdjustment === 0) {
      toast.error("Please enter a points adjustment");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_stats")
        .update({
          total_points: selectedUser.stats.total_points + pointsAdjustment,
        })
        .eq("user_id", selectedUser.id);

      if (error) throw error;

      toast.success(`${pointsAdjustment > 0 ? 'Added' : 'Removed'} ${Math.abs(pointsAdjustment)} points`);
      setPointsAdjustment(0);
      loadUserDetails(selectedUser.id);
    } catch (error) {
      console.error("Error adjusting points:", error);
      toast.error("Failed to adjust points");
    }
  };

  const toggleSuspension = async () => {
    if (!selectedUser) return;

    if (!selectedUser.suspended && !suspensionReason.trim()) {
      toast.error("Please provide a suspension reason");
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          suspended: !selectedUser.suspended,
          suspension_reason: !selectedUser.suspended ? suspensionReason : null,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast.success(`User ${selectedUser.suspended ? 'unsuspended' : 'suspended'}`);
      setSuspensionReason("");
      loadUserDetails(selectedUser.id);
    } catch (error) {
      console.error("Error toggling suspension:", error);
      toast.error("Failed to update suspension status");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Platform analytics and management tools
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/suggestions")}>
            Lesson Suggestions
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Climate Actions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActions}</div>
              <p className="text-xs text-muted-foreground">Total tracked</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBadges}</div>
              <p className="text-xs text-muted-foreground">Achievements unlocked</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">With actions</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="badges">Award Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>User Engagement (Last 7 Days)</CardTitle>
                  <CardDescription>Daily climate actions tracked</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="actions" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions by Category</CardTitle>
                  <CardDescription>Distribution of climate action types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Search */}
              <Card>
                <CardHeader>
                  <CardTitle>Search Users</CardTitle>
                  <CardDescription>Find users by username</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by username..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                    />
                    <Button size="icon" variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {users.map((user) => (
                      <Card
                        key={user.id}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => loadUserDetails(user.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{user.username}</p>
                              <p className="text-xs text-muted-foreground">
                                {user.user_stats?.[0]?.total_points || 0} points
                              </p>
                            </div>
                            {user.suspended && (
                              <Badge variant="destructive">Suspended</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Details & Management */}
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    {selectedUser ? `Managing ${selectedUser.username}` : "Select a user to manage"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedUser ? (
                    <>
                      {/* User Stats */}
                      <div className="space-y-2">
                        <h3 className="font-semibold">User Stats</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Points</p>
                            <p className="font-bold">{selectedUser.stats?.total_points || 0}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Actions</p>
                            <p className="font-bold">{selectedUser.stats?.total_actions || 0}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Current Streak</p>
                            <p className="font-bold">{selectedUser.stats?.current_streak || 0}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Achievements</p>
                            <p className="font-bold">{selectedUser.achievements?.length || 0}</p>
                          </div>
                        </div>
                      </div>

                      {/* Points Adjustment */}
                      <div className="space-y-2 pt-4 border-t">
                        <Label htmlFor="pointsAdjust">Adjust Points</Label>
                        <div className="flex gap-2">
                          <Input
                            id="pointsAdjust"
                            type="number"
                            placeholder="e.g., +100 or -50"
                            value={pointsAdjustment || ""}
                            onChange={(e) => setPointsAdjustment(parseInt(e.target.value) || 0)}
                          />
                          <Button onClick={adjustUserPoints}>Apply</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Use positive numbers to add points, negative to remove
                        </p>
                      </div>

                      {/* Suspension Management */}
                      <div className="space-y-2 pt-4 border-t">
                        <Label>Account Status</Label>
                        {selectedUser.suspended ? (
                          <div className="space-y-2">
                            <Badge variant="destructive" className="w-full justify-center">
                              Account Suspended
                            </Badge>
                            {selectedUser.suspension_reason && (
                              <p className="text-sm text-muted-foreground">
                                Reason: {selectedUser.suspension_reason}
                              </p>
                            )}
                            <Button
                              onClick={toggleSuspension}
                              variant="outline"
                              className="w-full"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Unsuspend Account
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Badge variant="default" className="w-full justify-center">
                              Account Active
                            </Badge>
                            <Textarea
                              placeholder="Suspension reason (required)"
                              value={suspensionReason}
                              onChange={(e) => setSuspensionReason(e.target.value)}
                            />
                            <Button
                              onClick={toggleSuspension}
                              variant="destructive"
                              className="w-full"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend Account
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* User Achievements */}
                      <div className="space-y-2 pt-4 border-t">
                        <h3 className="font-semibold">Recent Achievements</h3>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {selectedUser.achievements?.slice(0, 5).map((achievement: any) => (
                            <div
                              key={achievement.id}
                              className="flex items-center gap-2 text-sm p-2 rounded bg-muted"
                            >
                              <span>{achievement.achievement_icon}</span>
                              <span>{achievement.achievement_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Search and select a user to view details
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Climate Actions Moderation</CardTitle>
                <CardDescription>Review and manage user-submitted climate actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {climateActions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No actions to moderate</p>
                  ) : (
                    climateActions.map((action) => (
                      <Card key={action.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline">{action.category}</Badge>
                                <Badge variant={action.is_public ? "default" : "secondary"}>
                                  {action.is_public ? "Public" : "Hidden"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  by {action.profiles?.username || "Unknown"} •{" "}
                                  {new Date(action.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {action.story && (
                                <p className="text-sm">{action.story}</p>
                              )}
                              {action.city && (
                                <p className="text-xs text-muted-foreground">
                                  📍 {action.city}, {action.country}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleActionVisibility(action.id, action.is_public)}
                              >
                                {action.is_public ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteAction(action.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Award Special Event Badge</CardTitle>
                <CardDescription>
                  Manually award badges to users for special events or achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    placeholder="Enter user UUID"
                    value={badgeForm.userId}
                    onChange={(e) => setBadgeForm({ ...badgeForm, userId: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Find user IDs in the database or user profiles
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input
                    id="eventName"
                    placeholder="e.g., Earth Day 2024 Participant"
                    value={badgeForm.eventName}
                    onChange={(e) => setBadgeForm({ ...badgeForm, eventName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventIcon">Badge Icon</Label>
                  <Select
                    value={badgeForm.eventIcon}
                    onValueChange={(value) => setBadgeForm({ ...badgeForm, eventIcon: value })}
                  >
                    <SelectTrigger id="eventIcon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="🎉">🎉 Party</SelectItem>
                      <SelectItem value="🌍">🌍 Earth</SelectItem>
                      <SelectItem value="🏆">🏆 Trophy</SelectItem>
                      <SelectItem value="⭐">⭐ Star</SelectItem>
                      <SelectItem value="💚">💚 Green Heart</SelectItem>
                      <SelectItem value="🌱">🌱 Sprout</SelectItem>
                      <SelectItem value="🔥">🔥 Fire</SelectItem>
                      <SelectItem value="💎">💎 Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={awardBadge} className="w-full">
                  <Award className="h-4 w-4 mr-2" />
                  Award Badge
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
