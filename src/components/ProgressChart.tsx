import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ProgressChartProps {
  data: Array<{
    date: string;
    actions: number;
    points: number;
  }>;
}

export const ProgressChart = ({ data }: ProgressChartProps) => {
  return (
    <Card className="bg-gradient-card border-primary/10">
      <CardHeader>
        <CardTitle className="text-foreground">Progress Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
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
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="actions" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Actions"
            />
            <Line 
              type="monotone" 
              dataKey="points" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              name="Points"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
