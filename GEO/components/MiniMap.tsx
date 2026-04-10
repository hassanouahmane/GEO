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
  const { pois } = useGeo();

  useEffect(() => {
    if (mapRef.current) return;

    const setupMap = async () => {
      const L = await initLeaflet();
      const map = L.map('mini-map', {
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

      mapRef.current = map;
    };

    setupMap();
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
        const markerHtml = `
          <div style="
            background-color: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            border: 2px solid white;
            font-size: 10px;
          ">
            •
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        L.marker([poi.latitude, poi.longitude], { icon }).addTo(
          mapRef.current!
        );
      });
    };

    setupMarkers();
  }, [pois]);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Vue générale</h2>
      <div id="mini-map" className="w-full h-64 rounded-lg overflow-hidden border border-border" />
    </div>
  );
}
