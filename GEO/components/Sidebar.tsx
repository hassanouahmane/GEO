'use client';

import { useState } from 'react';
import { useGeo } from '@/app/context/GeoContext';
import { CATEGORY_LABELS, Category } from '@/lib/constants';
import POICard from './POICard';
import AddPointModal from './AddPointModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categories: Category[] = ['restaurant', 'hotel', 'site', 'leisure'];

export default function Sidebar() {
  const {
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
    getFilteredPois,
  } = useGeo();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFilterToggle = (category: Category) => {
    setActiveFilters(
      activeFilters.includes(category)
        ? activeFilters.filter((c) => c !== category)
        : [...activeFilters, category]
    );
  };

  const filteredPois = getFilteredPois();

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold text-primary mb-4">GeoApp</h1>

        <Input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilters([])}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              activeFilters.length === 0
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-foreground hover:bg-secondary'
            }`}
          >
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleFilterToggle(category)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeFilters.includes(category)
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-foreground hover:bg-secondary'
              }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredPois.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun point trouvé
          </div>
        ) : (
          filteredPois.map((poi) => (
            <POICard key={poi.id} poi={poi} />
          ))
        )}
      </div>

      <div className="p-4 border-t border-border">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-accent hover:bg-accent/90"
        >
          + Ajouter un point
        </Button>
      </div>

      {isModalOpen && (
        <AddPointModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
