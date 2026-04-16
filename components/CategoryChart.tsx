'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useGeo } from '@/app/context/GeoContext';
import { CATEGORY_COLORS } from '@/lib/constants';

export default function CategoryChart() {
  const { pois } = useGeo();

  const data = [
    {
      category: 'Restaurant',
      count: pois.filter((p) => p.category === 'restaurant').length,
      fill: CATEGORY_COLORS.restaurant,
    },
    {
      category: 'Hôtel',
      count: pois.filter((p) => p.category === 'hotel').length,
      fill: CATEGORY_COLORS.hotel,
    },
    {
      category: 'Site',
      count: pois.filter((p) => p.category === 'site').length,
      fill: CATEGORY_COLORS.site,
    },
    {
      category: 'Loisir',
      count: pois.filter((p) => p.category === 'leisure').length,
      fill: CATEGORY_COLORS.leisure,
    },
  ];

  return (
    <div className="rounded-md border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Points par catégorie
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="category" stroke="#666666" />
          <YAxis stroke="#666666" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#1a1a1a' }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((item, index) => (
              <Cell key={`cell-${index}`} fill={item.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
