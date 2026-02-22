import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: "default" | "warning";
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: KPICardProps) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
          variant === "warning" ? "bg-warning/10" : "bg-primary/10"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            variant === "warning" ? "text-warning" : "text-primary"
          )} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={cn(
            "font-medium",
            trend.positive ? "text-success" : "text-destructive"
          )}>
            {trend.positive ? "+" : ""}{trend.value}
          </span>
          <span className="text-muted-foreground">vs kemarin</span>
        </div>
      )}
    </div>
  );
}
