import { NominatimResult, searchNominatim } from './nominatim';
import { getWeather } from './weather';

export interface CombinedSearchResult extends NominatimResult {
    weatherIcon?: string;
}

export const searchPlacesWithWeather = async (query: string): Promise<CombinedSearchResult[]> => {
    const places = await searchNominatim(query);

    const resultsWithWeather = await Promise.all(
        places.map(async (place) => {
            const lat = parseFloat(place.lat);
            const lon = parseFloat(place.lon);
            const weatherIcon = await getWeather(lat, lon);
            return { ...place, weatherIcon };
        })
    );

    return resultsWithWeather;
};
