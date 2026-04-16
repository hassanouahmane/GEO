export type Category = 'restaurant' | 'hotel' | 'site' | 'leisure';

export interface POI {
  id: string;
  name: string;
  category: Category;
  latitude: number;
  longitude: number;
  description?: string;
  createdAt: Date;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  restaurant: '#10b981', // green
  hotel: '#2e86c1', // blue
  site: '#f59e0b', // amber
  leisure: '#8b5cf6', // purple
};

export const CATEGORY_LABELS: Record<Category, string> = {
  restaurant: 'Restaurant',
  hotel: 'Hôtel',
  site: 'Site',
  leisure: 'Loisir',
};

export const INITIAL_POIS: POI[] = [];

export const DEFAULT_CENTER: [number, number] = [30.4210, -9.5831]; // Agadir, Morocco
export const DEFAULT_ZOOM = 14;