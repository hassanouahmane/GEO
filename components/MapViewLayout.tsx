'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Map from './Map';

export default function MapViewLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />

      <div className="border-b border-border bg-card px-4 py-3 lg:hidden">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground"
        >
          {sidebarOpen ? 'Fermer les filtres' : 'Ouvrir les filtres'}
        </button>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="hidden w-80 border-r border-border bg-card/90 lg:block lg:overflow-y-auto">
          <Sidebar />
        </div>

        {sidebarOpen && (
          <div className="absolute inset-0 z-30 bg-black/35 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div
              className="h-full w-[85%] max-w-sm border-r border-border bg-card"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden bg-muted/20">
          <Map />
        </div>
      </div>
    </div>
  );
}
