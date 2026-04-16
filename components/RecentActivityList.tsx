'use client';

import { useGeo } from '@/app/context/GeoContext';
import { CATEGORY_LABELS } from '@/lib/constants';

export default function RecentActivityList() {
  const { pois } = useGeo();

  // Sort by creation date (newest first) and get last 3
  const recentPois = [...pois]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-md border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Activité récente
      </h2>

      {recentPois.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Aucune activité récente
        </p>
      ) : (
        <div className="space-y-3">
          {recentPois.map((poi) => (
            <div
              key={poi.id}
              className="flex items-start justify-between gap-3 rounded-md border border-border/70 px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {poi.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(poi.createdAt)}
                </p>
              </div>
              <span className="rounded-sm border border-border bg-muted px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                {CATEGORY_LABELS[poi.category]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
