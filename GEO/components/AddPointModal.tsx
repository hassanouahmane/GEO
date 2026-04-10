'use client';

import { useState } from 'react';
import { useGeo } from '@/app/context/GeoContext';
import { CATEGORY_LABELS, CATEGORY_EMOJIS, Category, DEFAULT_CENTER } from '@/lib/constants';
import { getCurrentPosition } from '@/lib/geo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const categories: Category[] = ['restaurant', 'hotel', 'site', 'leisure'];

interface AddPointModalProps {
  onClose: () => void;
}

export default function AddPointModal({ onClose }: AddPointModalProps) {
  const { addPoi } = useGeo();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('restaurant');
  const [latitude, setLatitude] = useState(DEFAULT_CENTER[0].toString());
  const [longitude, setLongitude] = useState(DEFAULT_CENTER[1].toString());
  const [description, setDescription] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = async () => {
    setIsLocating(true);
    try {
      console.log('[v0] Requesting geolocation...');
      const position = await getCurrentPosition();
      console.log('[v0] Position received:', position);
      setLatitude(position.latitude.toString());
      setLongitude(position.longitude.toString());
    } catch (error) {
      console.error('[v0] Failed to get position:', error);
      alert(`Unable to get current location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      alert('Invalid coordinates');
      return;
    }

    addPoi({
      name: name.trim(),
      category,
      latitude: lat,
      longitude: lon,
      description: description.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-card rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Ajouter un point
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nom
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter point name"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Catégorie
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    category === cat
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-foreground hover:bg-secondary'
                  }`}
                >
                  {CATEGORY_EMOJIS[cat]} {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleLocate}
            disabled={isLocating}
            variant="outline"
            className="w-full border-accent text-accent hover:bg-accent/10 font-semibold"
          >
            {isLocating ? '⏳ Localisation en cours...' : '📍 Déterminer ma position actuelle'}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Latitude
              </label>
              <Input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Longitude
              </label>
              <Input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add optional description"
              className="w-full"
            />
          </div>

          {/* Preview */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
            <div className="flex items-start gap-2">
              <span className="text-2xl">{CATEGORY_EMOJIS[category]}</span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{name || 'Nom du point'}</p>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_LABELS[category]}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-muted text-muted-foreground hover:bg-secondary"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
