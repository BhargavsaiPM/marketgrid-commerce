import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  pulse?: boolean;
}

export function MetricCard({ title, value, icon, pulse }: MetricCardProps) {
  return (
    <div className={`glass-1 rounded-xl p-6 border ${pulse ? 'border-tertiary shadow-[0_0_15px_rgba(245,166,35,0.4)] animate-pulse' : 'border-outline-variant'} flex flex-col`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-on-surface-variant font-medium text-sm">{title}</h3>
        <div className="text-outline-variant">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-mono font-bold text-on-surface">
        {value}
      </div>
    </div>
  );
}
