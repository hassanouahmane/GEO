'use client';

interface StatCardProps {
  title: string;
  value: string | number;
}

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
