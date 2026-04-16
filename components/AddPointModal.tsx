'use client';

import { useState } from 'react';
import { useGeo } from '@/app/context/GeoContext';
import { CATEGORY_COLORS, CATEGORY_LABELS, Category, DEFAULT_CENTER } from '@/lib/constants';
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
      const position = await getCurrentPosition();
      setLatitude(position.latitude.toString());
      setLongitude(position.longitude.toString());
    } catch (error) {
      console.error('Failed to get position:', error);
      alert(`Impossible d'obtenir la position actuelle: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      await addPoi({
        name: name.trim(),
        category,
        latitude: lat,
        longitude: lon,
        description: description.trim() || undefined,
      });

      onClose();
    } catch {
      alert("Erreur lors de l'enregistrement du point en base");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-foreground">
          Ajouter un point
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Renseignez les informations pour creer un nouveau lieu.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            <label className="mb-2 block text-sm font-medium text-foreground">
              Catégorie
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-md px-3 py-2 text-sm transition-colors ${
                    category === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-secondary'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleLocate}
            disabled={isLocating}
            variant="outline"
            className="w-full border-primary/35 text-primary hover:bg-primary/10 font-semibold"
          >
            {isLocating ? 'Localisation en cours...' : 'Determiner ma position actuelle'}
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

          <div className="rounded-md border border-border bg-muted/50 p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Apercu</p>
            <div className="flex items-start gap-3">
              <span
                className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[category] }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{name || 'Nom du point'}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {CATEGORY_LABELS[category]}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
