import { Place } from '../data/kolkataPlaces';

// REPLACE WITH YOUR TOMTOM API KEY
const TOMTOM_API_KEY = 'YOUR_TOMTOM_API_KEY';
const BASE_URL = 'https://api.tomtom.com/search/2/search';

export const searchNearbyPlaces = async (
    latitude: number,
    longitude: number,
    query: string = 'restaurant',
    radius: number = 1000
): Promise<Place[]> => {
    if (TOMTOM_API_KEY === 'YOUR_TOMTOM_API_KEY') {
        console.warn('TomTom API Key is missing. Please add it in utils/tomtom.ts');
        return [];
    }

    try {
        const url = `${BASE_URL}/${encodeURIComponent(query)}.json?key=${TOMTOM_API_KEY}&lat=${latitude}&lon=${longitude}&radius=${radius}&limit=20`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
            return data.results.map((result: any) => ({
                id: result.id,
                name: result.poi.name,
                address: result.address.freeformAddress,
                latitude: result.position.lat,
                longitude: result.position.lon,
                category: result.poi.categories?.[0] || 'Place',
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching TomTom places:', error);
        return [];
    }
};
