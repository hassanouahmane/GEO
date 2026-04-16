'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { POI, INITIAL_POIS, Category } from '@/lib/constants';

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface GeoContextType {
  pois: POI[];
  userLocation: UserLocation | null;
  selectedPoiId: string | null;
  activeFilters: Category[];
  searchQuery: string;
  addPoi: (poi: Omit<POI, 'id' | 'createdAt'>) => Promise<void>;
  updatePoi: (id: string, poi: Omit<POI, 'id' | 'createdAt'>) => Promise<void>;
  deletePoi: (id: string) => Promise<void>;
  selectPoi: (id: string | null) => void;
  setUserLocation: (location: UserLocation | null) => void;
  setActiveFilters: (filters: Category[]) => void;
  setSearchQuery: (query: string) => void;
  getFilteredPois: () => POI[];
}

const GeoContext = createContext<GeoContextType | undefined>(undefined);

export function GeoProvider({ children }: { children: React.ReactNode }) {
  const [pois, setPois] = useState<POI[]>(INITIAL_POIS);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadPois = async () => {
      try {
        const response = await fetch('/api/pois');
        if (!response.ok) {
          throw new Error('Failed to fetch POIs');
        }

        const data: POI[] = await response.json();
        setPois(
          data.map((poi) => ({
            ...poi,
            createdAt: new Date(poi.createdAt),
          }))
        );
      } catch (error) {
        console.error('[GeoContext] Failed to load POIs:', error);
      }
    };

    loadPois();
  }, []);

  const addPoi = useCallback(
    async (newPoi: Omit<POI, 'id' | 'createdAt'>) => {
      try {
        const response = await fetch('/api/pois', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPoi),
        });

        if (!response.ok) {
          throw new Error('Failed to create POI');
        }

        const createdPoi: POI = await response.json();
        setPois((prev) => [
          {
            ...createdPoi,
            createdAt: new Date(createdPoi.createdAt),
          },
          ...prev,
        ]);
      } catch (error) {
        console.error('[GeoContext] Failed to create POI:', error);
        throw error;
      }
    },
    []
  );

  const updatePoi = useCallback(async (id: string, updatedPoi: Omit<POI, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`/api/pois/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPoi),
      });

      if (!response.ok) {
        throw new Error('Failed to update POI');
      }

      const poiFromDb: POI = await response.json();
      setPois((prev) =>
        prev.map((poi) =>
          poi.id === id
            ? {
                ...poiFromDb,
                createdAt: new Date(poiFromDb.createdAt),
              }
            : poi
        )
      );
    } catch (error) {
      console.error('[GeoContext] Failed to update POI:', error);
      throw error;
    }
  }, []);

  const deletePoi = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/pois/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete POI');
      }

      setPois((prev) => prev.filter((poi) => poi.id !== id));
      setSelectedPoiId((prev) => (prev === id ? null : prev));
    } catch (error) {
      console.error('[GeoContext] Failed to delete POI:', error);
      throw error;
    }
  }, []);

  const selectPoi = useCallback((id: string | null) => {
    setSelectedPoiId(id);
  }, []);

  const getFilteredPois = useCallback(() => {
    let filtered = pois;

    // Apply category filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter((poi) =>
        activeFilters.includes(poi.category)
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((poi) =>
        poi.name.toLowerCase().includes(query) ||
        poi.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [pois, activeFilters, searchQuery]);

  const value: GeoContextType = {
    pois,
    userLocation,
    selectedPoiId,
    activeFilters,
    searchQuery,
    addPoi,
    updatePoi,
    deletePoi,
    selectPoi,
    setUserLocation,
    setActiveFilters,
    setSearchQuery,
    getFilteredPois,
  };

  return <GeoContext.Provider value={value}>{children}</GeoContext.Provider>;
}

export function useGeo() {
  const context = useContext(GeoContext);
  if (context === undefined) {
    throw new Error('useGeo must be used within a GeoProvider');
  }
  return context;
}
