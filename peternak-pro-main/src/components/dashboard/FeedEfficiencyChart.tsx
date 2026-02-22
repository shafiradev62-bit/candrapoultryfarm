import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { kandang: "K-01", fcr: 2.12 },
  { kandang: "K-02", fcr: 2.08 },
  { kandang: "K-03", fcr: 2.25 },
  { kandang: "K-04", fcr: 1.98 },
  { kandang: "K-05", fcr: 2.15 },
  { kandang: "K-06", fcr: 2.31 },
  { kandang: "K-07", fcr: 2.05 },
  { kandang: "K-08", fcr: 2.19 },
];

export function FeedEfficiencyChart() {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="section-title">Feed Efficiency per Kandang</CardTitle>
        <p className="text-xs text-muted-foreground">FCR (Feed Conversion Ratio)</p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="kandang"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                domain={[1.8, 2.5]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="fcr"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
