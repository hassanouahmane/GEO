'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useGeo } from '@/app/context/GeoContext';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
} from '@/lib/constants';
import { getCurrentPosition } from '@/lib/geo';
import MapPopup from './MapPopup';
import type * as L from 'leaflet';

let leafletModule: typeof import('leaflet');

const initLeaflet = async () => {
  if (!leafletModule) {
    leafletModule = await import('leaflet');
    await import('leaflet/dist/leaflet.css');
  }
  return leafletModule;
};

export default function Map() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const { pois, selectedPoiId, selectPoi, userLocation, setUserLocation } =
    useGeo();
  const [isLocating, setIsLocating] = useState(false);

  const selectedPoi = useMemo(
    () => pois.find((poi) => poi.id === selectedPoiId) ?? null,
    [pois, selectedPoiId]
  );

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    let isMounted = true;

    const setupMap = async () => {
      const L = await initLeaflet();
      const container = mapContainerRef.current;
      if (!container || !isMounted) return;

      if ((container as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) {
        return;
      }

      const map = L.map(container, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);

      if (isMounted) {
        mapRef.current = map;
        markersLayerRef.current = markersLayer;
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
      markersLayerRef.current = null;
    };
  }, []);

  // Fonction manuelle pour obtenir la position
  const handleManualLocate = async () => {
    setIsLocating(true);
    try {
      console.log('Demande de geolocalisation...');
      const coords = await getCurrentPosition();
      console.log('Position trouvee:', coords);
      
      setUserLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (mapRef.current) {
        mapRef.current.panTo([coords.latitude, coords.longitude]);
        mapRef.current.setZoom(15);
      }
    } catch (error) {
      console.error('Erreur de geolocalisation:', error);
      let errorMessage = "Impossible d'obtenir votre position";

      if (error instanceof Error) {
        if (error.message.includes('denied')) {
          errorMessage = "Vous avez refusé l'accès à votre position. Veuillez autoriser dans les paramètres du navigateur.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Délai dépassé. Vérifiez votre connexion GPS.";
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    let isMounted = true;

    const renderMarkers = async () => {
      const L = await initLeaflet();
      if (!isMounted || !mapRef.current || !markersLayerRef.current) return;

      markersLayerRef.current.clearLayers();

      pois.forEach((poi) => {
        const isSelected = selectedPoiId === poi.id;
        const marker = L.circleMarker([poi.latitude, poi.longitude], {
          radius: isSelected ? 9 : 7,
          fillColor: CATEGORY_COLORS[poi.category],
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95,
        });

        marker.bindTooltip(`${CATEGORY_LABELS[poi.category]} - ${poi.name}`, {
          direction: 'top',
          offset: [0, -8],
        });

        marker.on('click', () => {
          selectPoi(isSelected ? null : poi.id);
        });

        marker.addTo(markersLayerRef.current!);
      });

      if (userLocation) {
        L.circleMarker([userLocation.latitude, userLocation.longitude], {
          radius: 8,
          fillColor: '#2e86c1',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95,
        })
          .bindTooltip('Votre position', { direction: 'top', offset: [0, -8] })
          .addTo(markersLayerRef.current);
      }
    };

    renderMarkers();

    return () => {
      isMounted = false;
    };
  }, [pois, selectedPoiId, userLocation, selectPoi]);

  useEffect(() => {
    if (!mapRef.current || !selectedPoi) return;
    mapRef.current.panTo([selectedPoi.latitude, selectedPoi.longitude]);
    mapRef.current.setZoom(DEFAULT_ZOOM);
  }, [selectedPoi]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Bouton flottant pour la géolocalisation */}
      <button
        onClick={handleManualLocate}
        disabled={isLocating}
        className="absolute bottom-20 right-4 z-50 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-md shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        {isLocating ? 'Localisation...' : 'Ma position'}
      </button>

      <div className="absolute top-4 right-4 z-50 rounded-md bg-card/95 border border-border p-3 shadow-md">
        <p className="text-xs font-semibold mb-2 text-foreground">Categories</p>
        <div className="space-y-1">
          {(['restaurant', 'hotel', 'site', 'leisure'] as const).map((category) => (
            <div key={category} className="flex items-center gap-2 text-xs">
              <span
                className="inline-block h-3 w-3 rounded-full border border-white"
                style={{ backgroundColor: CATEGORY_COLORS[category] }}
              />
              <span className="text-foreground">{CATEGORY_LABELS[category]}</span>
            </div>
          ))}
        </div>
      </div>
      
      {selectedPoiId && (
        <MapPopup poiId={selectedPoiId} onClose={() => selectPoi(null)} />
      )}
    </div>
  );
}