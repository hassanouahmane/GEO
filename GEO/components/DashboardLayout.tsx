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

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>

          <StatsRow />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
