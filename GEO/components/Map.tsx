'use client';

import { useEffect, useRef, useState } from 'react';
import { useGeo } from '@/app/context/GeoContext';
import {
  CATEGORY_COLORS,
  CATEGORY_EMOJIS,
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
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const { pois, selectedPoiId, selectPoi, userLocation, setUserLocation } =
    useGeo();
  const [isLocating, setIsLocating] = useState(false);

  // Initialize map
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
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
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

  // Fonction manuelle pour obtenir la position
  const handleManualLocate = async () => {
    setIsLocating(true);
    try {
      console.log('📍 Demande de géolocalisation...');
      const coords = await getCurrentPosition();
      console.log('✅ Position trouvée:', coords);
      
      setUserLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      
      if (mapRef.current) {
        mapRef.current.setView(
          [coords.latitude, coords.longitude],
          15 // Zoom plus proche pour la position utilisateur
        );
        
        // Optionnel: Ajouter un popup temporaire
        const L = await initLeaflet();
        L.popup()
          .setLatLng([coords.latitude, coords.longitude])
          .setContent('📍 Vous êtes ici')
          .openOn(mapRef.current);
      }
    } catch (error) {
      console.error('❌ Erreur de géolocalisation:', error);
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

  // NE PAS auto-fetch au chargement - laisser l'utilisateur cliquer sur le bouton
  // Cela évite les erreurs de permission et donne le contrôle à l'utilisateur

  // Add user location marker
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const setupUserMarker = async () => {
      const L = await initLeaflet();
      
      // Remove old marker if exists
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
      
      if (mapRef.current) {
        userMarkerRef.current = L.circleMarker(
          [userLocation.latitude, userLocation.longitude],
          {
            radius: 10,
            fillColor: '#2e86c1',
            color: '#ffffff',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8,
          }
        ).addTo(mapRef.current);
        
        // Ajouter une popup au survol/clic
        userMarkerRef.current.bindPopup('📍 Votre position');
      }
    };

    setupUserMarker();
  }, [userLocation]);

  // Update POI markers
  useEffect(() => {
    if (!mapRef.current) return;

    const setupMarkers = async () => {
      const L = await initLeaflet();

      // Remove old markers
      Object.values(markersRef.current).forEach((marker) => {
        if (marker) marker.remove();
      });
      markersRef.current = {};

      if (!mapRef.current) return;

      // Add new markers
      pois.forEach((poi) => {
        const color = CATEGORY_COLORS[poi.category];
        const marker = L.circleMarker([poi.latitude, poi.longitude], {
          radius: selectedPoiId === poi.id ? 12 : 10,
          fillColor: color,
          color: '#ffffff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.95,
        })
          .on('click', () => selectPoi(selectedPoiId === poi.id ? null : poi.id))
          .bindTooltip(`${CATEGORY_EMOJIS[poi.category]} ${CATEGORY_LABELS[poi.category]} - ${poi.name}`)
          .addTo(mapRef.current!);

        markersRef.current[poi.id] = marker;
      });
    };

    setupMarkers();
  }, [pois, selectedPoiId, selectPoi]);

  // Handle map centering on selected POI
  useEffect(() => {
    if (!mapRef.current || !selectedPoiId) return;

    const selectedPoi = pois.find((p) => p.id === selectedPoiId);
    if (selectedPoi) {
      mapRef.current.setView(
        [selectedPoi.latitude, selectedPoi.longitude],
        DEFAULT_ZOOM
      );
    }
  }, [selectedPoiId, pois]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainerRef} id="map" className="w-full h-full" />
      
      {/* Bouton flottant pour la géolocalisation */}
      <button
        onClick={handleManualLocate}
        disabled={isLocating}
        className="absolute bottom-20 right-4 z-[1000] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full shadow-lg flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        <span className="text-xl">
          {isLocating ? '⏳' : '📍'}
        </span>
        <span className="hidden sm:inline">
          {isLocating ? 'Localisation...' : 'Ma position'}
        </span>
      </button>

      <div className="absolute top-4 right-4 z-[1000] rounded-lg bg-card/90 border border-border p-3 shadow-md">
        <p className="text-xs font-semibold mb-2 text-foreground">Categories</p>
        <div className="space-y-1">
          {(['restaurant', 'hotel', 'site', 'leisure'] as const).map((category) => (
            <div key={category} className="flex items-center gap-2 text-xs">
              <span
                className="inline-block h-3 w-3 rounded-full border border-white"
                style={{ backgroundColor: CATEGORY_COLORS[category] }}
              />
              <span>{CATEGORY_EMOJIS[category]}</span>
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