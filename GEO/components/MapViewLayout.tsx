'use client';

import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Map from './Map';

export default function MapViewLayout() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-border overflow-y-auto">
          <Sidebar />
        </div>
        <div className="flex-1 overflow-hidden">
          <Map />
        </div>
      </div>
    </div>
  );
}
