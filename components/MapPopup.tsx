'use client';

import { useEffect, useState } from 'react';
import { useGeo } from '@/app/context/GeoContext';
import { CATEGORY_LABELS, Category } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface MapPopupProps {
  poiId: string;
  onClose: () => void;
}

const categories: Category[] = ['restaurant', 'hotel', 'site', 'leisure'];

export default function MapPopup({ poiId, onClose }: MapPopupProps) {
  const { pois, updatePoi, deletePoi } = useGeo();
  const poi = pois.find((p) => p.id === poiId);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('restaurant');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!poi) return;
    setName(poi.name);
    setCategory(poi.category);
    setLatitude(poi.latitude.toString());
    setLongitude(poi.longitude.toString());
    setDescription(poi.description ?? '');
    setIsEditing(false);
  }, [poiId, poi]);

  if (!poi) return null;

  const handleUpdate = async () => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (!name.trim()) {
      alert('Le nom est obligatoire');
      return;
    }

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      alert('Coordonnees invalides');
      return;
    }

    try {
      await updatePoi(poi.id, {
        name: name.trim(),
        category,
        latitude: lat,
        longitude: lon,
        description: description.trim() || undefined,
      });
      setIsEditing(false);
    } catch {
      alert('Erreur lors de la modification du point');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Supprimer ce point ?');
    if (!confirmed) return;

    try {
      await deletePoi(poi.id);
      onClose();
    } catch {
      alert('Erreur lors de la suppression du point');
    }
  };

  return (
    <div className="absolute top-4 left-1/2 z-50 w-[92%] max-w-sm -translate-x-1/2 rounded-md border border-border bg-card p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {!isEditing ? (
            <>
              <h3 className="font-bold text-foreground text-lg">{poi.name}</h3>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {CATEGORY_LABELS[poi.category]}
              </p>
              {poi.description && (
                <p className="text-sm text-foreground mt-2">{poi.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)}
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  Modifier
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  Supprimer
                </Button>
                <Button size="sm" variant="ghost" onClick={onClose}>
                  Fermer
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    size="sm"
                    variant={category === cat ? 'default' : 'outline'}
                    onClick={() => setCategory(cat)}
                  >
                    {CATEGORY_LABELS[cat]}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
                <Input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdate}>
                  Enregistrer
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
