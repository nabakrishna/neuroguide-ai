import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'highlight';
}

export function StatsCard({ title, value, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
  return (
    <div
      className={cn(
        'p-5 rounded-xl border transition-all duration-200',
        variant === 'highlight'
          ? 'bg-neuro-blue-light border-neuro-blue/20'
          : 'bg-card border-border hover:shadow-elevated'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1">{trend}</p>
          )}
        </div>
        <div
          className={cn(
            'p-2.5 rounded-lg',
            variant === 'highlight'
              ? 'bg-neuro-blue/10'
              : 'bg-muted'
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5',
              variant === 'highlight' ? 'text-neuro-blue' : 'text-muted-foreground'
            )}
          />
        </div>
      </div>
    </div>
  );
}
