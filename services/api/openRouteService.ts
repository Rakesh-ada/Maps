// Force update
import { apiClient } from './apiClient';

const OSRM_BASE_URL = 'http://router.project-osrm.org/route/v1';

export interface RouteStep {
    distance: number;
    duration: number;
    maneuver: {
        location: [number, number];
        bearing_before: number;
        bearing_after: number;
        type: string;
        modifier?: string;
    };
    name: string;
}

export interface RouteData {
    coordinates: { latitude: number; longitude: number }[];
    distance: number;
    duration: number;
    steps: RouteStep[];
}

export const getRoute = async (
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number },
    mode: 'driving' | 'walking' = 'driving'
): Promise<RouteData | null> => {
    // OSRM supports 'driving' (car), 'walking' (foot), 'cycling' (bike)
    // Map 'driving' -> 'driving', 'walking' -> 'foot'
    const profile = mode === 'walking' ? 'foot' : 'driving';

    // Coordinates formatted as "lon,lat"
    const startCoord = `${start.longitude},${start.latitude}`;
    const endCoord = `${end.longitude},${end.latitude}`;

    const url = `${OSRM_BASE_URL}/${profile}/${startCoord};${endCoord}?overview=full&geometries=geojson&steps=true`;

    try {
        const data: any = await apiClient(url);

        if (!data.routes || data.routes.length === 0) {
            throw new Error('No route found');
        }

        const route = data.routes[0];
        const geometry = route.geometry.coordinates;

        // Convert GeoJSON [lon, lat] to { latitude, longitude }
        const coordinates = geometry.map((coord: [number, number]) => ({
            latitude: coord[1],
            longitude: coord[0],
        }));

        // Flatten steps from all legs (usually just one leg)
        const steps = route.legs.flatMap((leg: any) => leg.steps);

        return {
            coordinates,
            distance: route.distance, // meters
            duration: route.duration, // seconds
            steps,
        };
    } catch (error) {
        console.error('OSRM Route fetch failed:', error);
        return null;
    }
};
