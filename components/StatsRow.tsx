'use client';

import { useGeo } from '@/app/context/GeoContext';
import { CATEGORY_LABELS } from '@/lib/constants';
import StatCard from './StatCard';

export default function StatsRow() {
  const { pois } = useGeo();

  const totalPoints = pois.length;
  const restaurants = pois.filter((p) => p.category === 'restaurant').length;
  const hotels = pois.filter((p) => p.category === 'hotel').length;
  const sites = pois.filter((p) => p.category === 'site').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total de points" value={totalPoints} />
      <StatCard title={CATEGORY_LABELS.restaurant} value={restaurants} />
      <StatCard title={CATEGORY_LABELS.hotel} value={hotels} />
      <StatCard title={CATEGORY_LABELS.site} value={sites} />
    </div>
  );
}
