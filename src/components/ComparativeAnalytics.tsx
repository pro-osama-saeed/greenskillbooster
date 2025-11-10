import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Users } from "lucide-react";

interface ComparativeAnalyticsProps {
  userStats: {
    actions: number;
    points: number;
    streak: number;
  };
  communityAverage: {
    actions: number;
    points: number;
    streak: number;
  };
}

export const ComparativeAnalytics = ({ userStats, communityAverage }: ComparativeAnalyticsProps) => {
  const data = [
    {
      metric: "Actions",
      You: userStats.actions,
      Community: communityAverage.actions,
    },
    {
      metric: "Points",
      You: userStats.points,
      Community: communityAverage.points,
    },
    {
      metric: "Streak",
      You: userStats.streak,
      Community: communityAverage.streak,
    },
  ];

  const performanceBetter = 
    userStats.actions > communityAverage.actions &&
    userStats.points > communityAverage.points;

  return (
    <Card className="bg-gradient-card border-primary/10">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Your Performance vs Community
        </CardTitle>
        {performanceBetter && (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <TrendingUp className="h-4 w-4" />
            You're performing above average!
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="metric" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }}
            />
            <Legend />
            <Bar dataKey="You" fill="hsl(var(--primary))" />
            <Bar dataKey="Community" fill="hsl(var(--muted))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
