import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "Layer (20-72 mgg)", value: 45000, color: "hsl(var(--chart-1))" },
  { name: "Grower (8-20 mgg)", value: 12000, color: "hsl(var(--chart-3))" },
  { name: "Brooding (0-8 mgg)", value: 8000, color: "hsl(var(--chart-4))" },
  { name: "Afkir (>72 mgg)", value: 3000, color: "hsl(var(--chart-2))" },
];

export function FlockDistributionChart() {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="section-title">Distribusi Umur Flock</CardTitle>
        <p className="text-xs text-muted-foreground">Total: {total.toLocaleString("id-ID")} ekor</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-[200px] w-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => value.toLocaleString("id-ID")}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 flex-1">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {item.value.toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
