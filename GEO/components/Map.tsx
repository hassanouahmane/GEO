'use client';

import { useEffect, useRef, useState } from 'react';
import { useGeo } from '@/app/context/GeoContext';
import { CATEGORY_COLORS, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/constants';
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
  const markersRef = useRef<Record<string, L.Marker>>({});
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const { pois, selectedPoiId, selectPoi, userLocation, setUserLocation } =
    useGeo();
  const [isLocating, setIsLocating] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    const setupMap = async () => {
      const L = await initLeaflet();
      const map = L.map('map', {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    };

    setupMap();
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
        const markerHtml = `
          <div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            •
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const marker = L.marker([poi.latitude, poi.longitude], {
          icon,
        })
          .on('click', () => selectPoi(selectedPoiId === poi.id ? null : poi.id))
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
      <div id="map" className="w-full h-full" />
      
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
      
      {selectedPoiId && (
        <MapPopup poiId={selectedPoiId} onClose={() => selectPoi(null)} />
      )}
    </div>
  );
}