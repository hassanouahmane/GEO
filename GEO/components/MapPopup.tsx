'use client';

import { useGeo } from '@/app/context/GeoContext';
import { CATEGORY_EMOJIS, CATEGORY_LABELS } from '@/lib/constants';

interface MapPopupProps {
  poiId: string;
}

export default function MapPopup({ poiId }: MapPopupProps) {
  const { pois } = useGeo();
  const poi = pois.find((p) => p.id === poiId);

  if (!poi) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm z-40">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{CATEGORY_EMOJIS[poi.category]}</span>
        <div className="flex-1">
          <h3 className="font-bold text-foreground text-lg">{poi.name}</h3>
          <p className="text-xs text-muted-foreground">
            {CATEGORY_LABELS[poi.category]}
          </p>
          {poi.description && (
            <p className="text-sm text-foreground mt-2">{poi.description}</p>
          )}
          <button className="mt-3 text-accent font-semibold text-sm hover:underline">
            Voir détails
          </button>
        </div>
      </div>
    </div>
  );
}
