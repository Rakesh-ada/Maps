import { apiClient } from './apiClient';

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

export interface NominatimResult {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    boundingbox: string[];
    lat: string;
    lon: string;
    display_name: string;
    class: string;
    type: string;
    importance: number;
    icon?: string;
    address?: {
        road?: string;
        suburb?: string;
        city?: string;
        state?: string;
        country?: string;
        [key: string]: string | undefined;
    };
}

export const searchNominatim = async (query: string): Promise<NominatimResult[]> => {
    if (query.length < 3) return [];

    const url = `${NOMINATIM_BASE}?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;

    try {
        return await apiClient<NominatimResult[]>(url, {
            headers: {
                'User-Agent': 'RastaApp/1.0 (contact@rasta.app)',
            },
        });
    } catch (error) {
        console.error("Nominatim search failed:", error);
        return [];
    }
};

export const reverseGeocode = async (lat: number, lon: number): Promise<NominatimResult | null> => {
    const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    try {
        return await apiClient<NominatimResult>(url, {
            headers: {
                'User-Agent': 'RastaApp/1.0 (contact@rasta.app)',
            },
        });
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        return null;
    }
};

export const searchNominatimByViewbox = async (query: string, viewbox: string): Promise<NominatimResult[]> => {
    const url = `${NOMINATIM_BASE}?q=${encodeURIComponent(query)}&format=json&limit=20&viewbox=${viewbox}&bounded=1`;
    try {
        return await apiClient<NominatimResult[]>(url, {
            headers: {
                'User-Agent': 'RastaApp/1.0 (contact@rasta.app)',
            },
        });
    } catch (error) {
        console.error("Nominatim viewbox search failed:", error);
        return [];
    }
};
