'use client';

import { useGeo } from '@/app/context/GeoContext';
import { POI, CATEGORY_EMOJIS, CATEGORY_LABELS } from '@/lib/constants';
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
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected
          ? 'bg-accent/10 border-accent'
          : 'bg-card border-border hover:border-accent'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-xl">{CATEGORY_EMOJIS[poi.category]}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {poi.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {CATEGORY_LABELS[poi.category]}
          </p>
          {distance && (
            <p className="text-xs text-accent font-medium mt-1">{distance}</p>
          )}
        </div>
      </div>
    </div>
  );
}
