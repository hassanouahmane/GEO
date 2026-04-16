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
    <div className="flex h-full flex-col bg-card">
      <div className="border-b border-border px-4 py-5">
        <h1 className="text-lg font-semibold text-foreground">Points d'interet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explorez et filtrez les emplacements en temps reel.
        </p>

        <Input
          type="text"
          placeholder="Rechercher un point"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-4"
        />

        <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Filtrer par categorie
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilters([])}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              activeFilters.length === 0
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-secondary'
            }`}
          >
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleFilterToggle(category)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                activeFilters.includes(category)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-secondary'
              }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {filteredPois.length === 0 ? (
          <div className="rounded-md border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Aucun point trouvé
          </div>
        ) : (
          filteredPois.map((poi) => (
            <POICard key={poi.id} poi={poi} />
          ))
        )}
      </div>

      <div className="border-t border-border p-4">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Ajouter un point
        </Button>
      </div>

      {isModalOpen && (
        <AddPointModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
