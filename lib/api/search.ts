const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ArtisanSearchResult {
  _id: string;
  userId: string;
  tradeCategory: string;
  ratingAvg?: number;
  ratingCount?: number;
  verificationStatus: string;
  distanceMeters: number;
  rankingScore: number;
  portfolioPhotos?: string[];
  isAvailable?: boolean;
  location: {
    type: string;
    coordinates: [number, number];
  };

  // These are already present in the raw Mongo document returned by
  // the search aggregation — no backend change needed to expose them,
  // just declaring them here so the frontend can use them.
  fullName?: string;
  businessName?: string;
  avatarUrl?: string;
  offerType?: 'services' | 'products' | 'both';
  serviceIds?: string[];
  productIds?: string[];
}

export interface SearchParams {
  longitude: number;
  latitude: number;
  category?: string;
  radiusKm?: number;
}

export async function searchArtisans(params: SearchParams): Promise<ArtisanSearchResult[]> {
  const query = new URLSearchParams({
    longitude: params.longitude.toString(),
    latitude: params.latitude.toString(),
    ...(params.category && { category: params.category }),
    ...(params.radiusKm && { radiusKm: params.radiusKm.toString() }),
  });

  const response = await fetch(`${API_URL}/search/artisans?${query.toString()}`);

  if (!response.ok) {
    throw new Error('Search failed');
  }

  return response.json();
}