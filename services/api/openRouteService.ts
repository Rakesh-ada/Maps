import polyline from '@mapbox/polyline';
import { apiClient } from './apiClient';

// We use the OSRM / OSM public endpoints as a fallback/implementation for "OpenRouteService" 
// per the previous context where these were used. 
// Ideally this should use: https://api.openrouteservice.org/v2/directions/{profile}
// But without a confirmed API Key logic in env, we stick to the working endpoints from index.tsx
// while structurally preparing for ORS.

export interface RouteCoordinates {
    latitude: number;
    longitude: number;
}

export const getRoute = async (
    start: RouteCoordinates,
    end: RouteCoordinates,
    mode: 'driving' | 'walking' = 'driving'
): Promise<{ coordinates: RouteCoordinates[]; distance: number; duration: number; steps: any[] } | null> => {
    let url = '';
    if (mode === 'walking') {
        url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=polyline&steps=true`;
    } else {
        // driving
        url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=polyline&steps=true`;
    }

    try {
        const data = await apiClient<any>(url);

        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const points = polyline.decode(route.geometry);
            const coords = points.map((point: number[]) => ({
                latitude: point[0],
                longitude: point[1]
            }));

            return {
                coordinates: coords,
                distance: route.distance,
                duration: route.duration,
                steps: route.legs?.[0]?.steps || []
            };
        }
        return null;
    } catch (error) {
        console.error("Route fetching failed:", error);
        return null;
    }
};
