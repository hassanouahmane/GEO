'use client';

import { useGeo } from '@/app/context/GeoContext';
import { POI, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/constants';
import { calculateDistance } from '@/lib/geo';

interface POICardProps {
  poi: POI;
}

export default function POICard({ poi }: POICardProps) {
  const { selectedPoiId, selectPoi, userLocation } = useGeo();
  const isSelected = selectedPoiId === poi.id;

  let distance: string | null = null;
  if (userLocation) {
    const distanceKm = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      poi.latitude,
      poi.longitude
    );
    distance = distanceKm < 1
      ? `${Math.round(distanceKm * 1000)}m`
      : `${distanceKm.toFixed(1)}km`;
  }

  return (
    <div
      onClick={() => selectPoi(isSelected ? null : poi.id)}
      className={`cursor-pointer rounded-md border p-3 transition-all ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-primary/50 hover:bg-muted/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: CATEGORY_COLORS[poi.category] }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {poi.name}
          </h3>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {CATEGORY_LABELS[poi.category]}
          </p>
          {distance && (
            <p className="mt-1 text-xs font-medium text-primary">{distance}</p>
          )}
        </div>
      </div>
    </div>
  );
}
