'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { useGeo } from '@/app/context/GeoContext';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
} from '@/lib/constants';
import { getCurrentPosition } from '@/lib/geo';
import MapPopup from './MapPopup';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API ?? '';

export default function Map() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { pois, selectedPoiId, selectPoi, userLocation, setUserLocation } =
    useGeo();
  const [isLocating, setIsLocating] = useState(false);

  const selectedPoi = useMemo(
    () => pois.find((poi) => poi.id === selectedPoiId) ?? null,
    [pois, selectedPoiId]
  );

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey,
  });

  const mapCenter = useMemo(
    () => ({
      lat: userLocation?.latitude ?? DEFAULT_CENTER[0],
      lng: userLocation?.longitude ?? DEFAULT_CENTER[1],
    }),
    [userLocation]
  );

  const buildMarkerIcon = (color: string, selected: boolean): google.maps.Symbol => ({
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0.95,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: selected ? 9 : 7,
  });

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
        mapRef.current.panTo({ lat: coords.latitude, lng: coords.longitude });
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
    if (!mapRef.current || !selectedPoi) return;
    mapRef.current.panTo({ lat: selectedPoi.latitude, lng: selectedPoi.longitude });
    mapRef.current.setZoom(DEFAULT_ZOOM);
  }, [selectedPoi]);

  if (!googleMapsApiKey) {
    return (
      <div className="relative w-full h-screen">
        <div className="flex h-full items-center justify-center bg-muted px-4 text-center text-sm text-muted-foreground">
          La cle API Google Maps est absente. Ajoutez NEXT_PUBLIC_GOOGLE_MAPS_API dans .env puis redemarrez le serveur.
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="relative w-full h-screen">
        <div className="flex h-full items-center justify-center bg-muted px-4 text-center text-sm text-destructive">
          Impossible de charger Google Maps. Verifiez votre cle API et les restrictions de domaine.
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={DEFAULT_ZOOM}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onUnmount={() => {
            mapRef.current = null;
          }}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {pois.map((poi) => {
            const isSelected = selectedPoiId === poi.id;
            return (
              <MarkerF
                key={poi.id}
                position={{ lat: poi.latitude, lng: poi.longitude }}
                title={`${CATEGORY_LABELS[poi.category]} - ${poi.name}`}
                icon={buildMarkerIcon(CATEGORY_COLORS[poi.category], isSelected)}
                onClick={() => selectPoi(isSelected ? null : poi.id)}
              />
            );
          })}

          {userLocation && (
            <MarkerF
              position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
              title="Votre position"
              icon={buildMarkerIcon('#2e86c1', true)}
            />
          )}

          {selectedPoi && (
            <InfoWindowF
              position={{ lat: selectedPoi.latitude, lng: selectedPoi.longitude }}
              onCloseClick={() => selectPoi(null)}
            >
              <div className="text-sm text-black">
                <p className="font-semibold">{selectedPoi.name}</p>
                <p className="text-xs">{CATEGORY_LABELS[selectedPoi.category]}</p>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      ) : (
        <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
          Chargement de Google Maps...
        </div>
      )}
      
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