import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const colorMap = {
  default: 'bg-muted text-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-amber-500/10 text-amber-600',
  destructive: 'bg-destructive/10 text-destructive',
};

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'primary',
  className 
}: StatCardProps) {
  const TrendIcon = trend ? (trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus) : null;
  const trendColor = trend ? (trend.value > 0 ? 'text-success' : trend.value < 0 ? 'text-destructive' : 'text-muted-foreground') : '';

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && TrendIcon && (
              <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
                <TrendIcon className="h-4 w-4" />
                <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", colorMap[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
