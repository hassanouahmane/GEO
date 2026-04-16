'use client';

import { useEffect, useRef } from 'react';
import { useGeo } from '@/app/context/GeoContext';
import { CATEGORY_COLORS, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/constants';
import type * as L from 'leaflet';

let leafletModule: typeof import('leaflet');

const initLeaflet = async () => {
  if (!leafletModule) {
    leafletModule = await import('leaflet');
    await import('leaflet/dist/leaflet.css');
  }
  return leafletModule;
};

export default function MiniMap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const { pois } = useGeo();

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;
    let isMounted = true;

    const setupMap = async () => {
      const L = await initLeaflet();
      const container = mapContainerRef.current;
      if (!container || !isMounted) return;

      // Prevent Leaflet double-init during hot reloads.
      if ((container as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) {
        return;
      }

      const map = L.map(container, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM - 2,
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      if (isMounted) {
        mapRef.current = map;
      } else {
        map.remove();
      }
    };

    setupMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const setupMarkers = async () => {
      const L = await initLeaflet();

      // Remove existing markers
      mapRef.current!.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          mapRef.current!.removeLayer(layer);
        }
      });

      if (!mapRef.current) return;

      // Add POI markers
      pois.forEach((poi) => {
        const color = CATEGORY_COLORS[poi.category];
        L.circleMarker([poi.latitude, poi.longitude], {
          radius: 7,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95,
        }).addTo(mapRef.current!);
      });
    };

    setupMarkers();
  }, [pois]);

  return (
    <div className="rounded-md border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-4">Vue générale</h2>
      <div ref={mapContainerRef} id="mini-map" className="h-64 w-full overflow-hidden rounded-md border border-border" />
    </div>
  );
}
