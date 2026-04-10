'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold text-primary">{value}</p>
        </div>
        {icon && <div className="text-3xl text-accent">{icon}</div>}
      </div>
    </div>
  );
}
