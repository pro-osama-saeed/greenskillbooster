import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  profiles: {
    username: string;
  } | null;
}

const AdminSuggestions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadSuggestions();
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
        .in("role", ["admin", "co_admin"]);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error("Access denied", {
          description: "You don't have admin or co-admin privileges",
        });
        navigate("/lessons");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/lessons");
    }
  };

  const loadSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from("lesson_suggestions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch usernames separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((s) => s.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
        
        const enrichedData = data.map((suggestion) => ({
          ...suggestion,
          profiles: profileMap.get(suggestion.user_id) || null,
        }));

        setSuggestions(enrichedData);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error loading suggestions:", error);
      toast.error("Failed to load suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("lesson_suggestions")
        .update({
          status,
          admin_notes: adminNotes[id] || null,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Suggestion ${status}!`);
      loadSuggestions();
    } catch (error) {
      console.error("Error updating suggestion:", error);
      toast.error("Failed to update suggestion");
    }
  };

  const statusConfig = {
    pending: { icon: Clock, color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
    approved: { icon: CheckCircle2, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
    rejected: { icon: XCircle, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/lessons")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lessons
        </Button>

        <h1 className="text-4xl font-bold mb-2">Lesson Suggestions</h1>
        <p className="text-muted-foreground mb-8">
          Review and manage user-submitted lesson ideas
        </p>

        {suggestions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No suggestions yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => {
              const StatusIcon = statusConfig[suggestion.status as keyof typeof statusConfig].icon;
              
              return (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-xl">{suggestion.title}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{suggestion.category}</Badge>
                          <Badge className={statusConfig[suggestion.status as keyof typeof statusConfig].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {suggestion.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            by {suggestion.profiles?.username || "Unknown"} •{" "}
                            {new Date(suggestion.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{suggestion.description}</p>

                    {suggestion.status === "pending" && (
                      <div className="space-y-3 pt-4 border-t">
                        <Textarea
                          placeholder="Add admin notes (optional)..."
                          value={adminNotes[suggestion.id] || ""}
                          onChange={(e) =>
                            setAdminNotes({ ...adminNotes, [suggestion.id]: e.target.value })
                          }
                          className="min-h-20"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => updateStatus(suggestion.id, "approved")}
                            className="flex-1"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => updateStatus(suggestion.id, "rejected")}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {suggestion.admin_notes && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-semibold mb-1">Admin Notes:</p>
                        <p className="text-sm text-muted-foreground">{suggestion.admin_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSuggestions;
