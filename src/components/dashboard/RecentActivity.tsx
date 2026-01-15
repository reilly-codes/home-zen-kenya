import { Banknote, Wrench, UserMinus, Calendar, Bell } from 'lucide-react';
import { recentActivity, Activity } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  banknote: Banknote,
  wrench: Wrench,
  'user-minus': UserMinus,
  calendar: Calendar,
  bell: Bell,
};

const typeColors: Record<Activity['type'], string> = {
  payment: 'bg-success/10 text-success',
  maintenance: 'bg-warning/10 text-warning',
  tenant: 'bg-destructive/10 text-destructive',
  notice: 'bg-primary/10 text-primary',
};

export function RecentActivity() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest updates from your properties</p>
      </div>
      <div className="divide-y divide-border">
        {recentActivity.map((activity) => {
          const Icon = iconMap[activity.icon] || Bell;
          return (
            <div key={activity.id} className="activity-item">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                typeColors[activity.type]
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.timestamp}</span>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-border">
        <button className="text-sm font-medium text-primary hover:underline w-full text-center">
          View all activity
        </button>
      </div>
    </div>
  );
}
