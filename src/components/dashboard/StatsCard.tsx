import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary';
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]",
        variant === 'primary'
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl"
          : "bg-card border border-border shadow-sm hover:shadow-lg"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === 'primary' ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-2xl md:text-3xl font-bold tracking-tight",
            variant === 'primary' ? "text-primary-foreground" : "text-foreground"
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-sm",
              variant === 'primary' ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded",
                trend.isPositive
                  ? variant === 'primary'
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-success/10 text-success"
                  : variant === 'primary'
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-destructive/10 text-destructive"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className={cn(
                "text-xs",
                variant === 'primary' ? "text-primary-foreground/60" : "text-muted-foreground"
              )}>
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl",
          variant === 'primary'
            ? "bg-primary-foreground/20"
            : "bg-primary/10"
        )}>
          <Icon className={cn(
            "h-6 w-6",
            variant === 'primary' ? "text-primary-foreground" : "text-primary"
          )} />
        </div>
      </div>
    </div>
  );
}
