'use client';

import { useGeo } from '@/app/context/GeoContext';
import { CATEGORY_EMOJIS, CATEGORY_LABELS } from '@/lib/constants';

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
    <div className="bg-card border border-border rounded-lg p-6">
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
              className="flex items-start gap-3 pb-3 border-b border-border last:border-b-0"
            >
              <span className="text-2xl">{CATEGORY_EMOJIS[poi.category]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {poi.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_LABELS[poi.category]} • {formatDate(poi.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
