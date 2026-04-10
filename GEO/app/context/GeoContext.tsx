'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
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
  addPoi: (poi: Omit<POI, 'id' | 'createdAt'>) => void;
  deletePoi: (id: string) => void;
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

  const addPoi = useCallback(
    (newPoi: Omit<POI, 'id' | 'createdAt'>) => {
      const poi: POI = {
        ...newPoi,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      setPois((prev) => [poi, ...prev]);
    },
    []
  );

  const deletePoi = useCallback((id: string) => {
    setPois((prev) => prev.filter((poi) => poi.id !== id));
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
