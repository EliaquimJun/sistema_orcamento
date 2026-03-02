import { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-amber-600/10 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-amber-600" />
        </div>
      </div>
    </Card>
  );
}
