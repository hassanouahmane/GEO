'use client';

import Navbar from './Navbar';
import StatsRow from './StatsRow';
import MiniMap from './MiniMap';
import CategoryChart from './CategoryChart';
import RecentActivityList from './RecentActivityList';

export default function DashboardLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-md border border-border bg-card px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Vue d'ensemble
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
              Tableau de bord geospatial
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Suivez les points d'interet, leur repartition et les nouvelles entrees.
            </p>
          </section>

          <StatsRow />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="lg:col-span-2">
              <CategoryChart />
            </div>
            <div>
              <MiniMap />
            </div>
          </div>

          <RecentActivityList />
        </div>
      </div>
    </div>
  );
}
