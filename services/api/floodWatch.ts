import { apiClient } from './apiClient';
import { floodWatchUrl } from './floodWatchBaseUrl';

export type FloodWatchLineString = {
  type: 'LineString';
  coordinates: Array<[number, number]>;
};

export interface FloodRouteResponse {
  distance_km: number;
  route_risk: number;
  geometry: FloodWatchLineString;
  is_fallback?: boolean;
}

export interface FloodRiskResponse {
  risk_score?: number;
  risk_level?: string;
  ml_risk?: number;
  rainfall_raw?: number | null;
  as_of?: string;
}

export type LatLon = { latitude: number; longitude: number };

function toLatLonCoords(geom: FloodWatchLineString): LatLon[] {
  return geom.coordinates.map((c) => ({ latitude: c[1], longitude: c[0] }));
}

export async function getFloodRoute(
  start: LatLon,
  end: LatLon,
  waterlogging: boolean
): Promise<{ coordinates: LatLon[]; distanceKm: number; routeRisk: number; isFallback: boolean } | null> {
  const url = floodWatchUrl(
    `/route?start_lat=${encodeURIComponent(start.latitude)}&start_lon=${encodeURIComponent(
      start.longitude
    )}&end_lat=${encodeURIComponent(end.latitude)}&end_lon=${encodeURIComponent(
      end.longitude
    )}&waterlogging=${waterlogging ? 'true' : 'false'}`
  );

  const data = await apiClient<FloodRouteResponse>(url);
  if (!data || !data.geometry || data.geometry.type !== 'LineString') return null;

  const coordinates = toLatLonCoords(data.geometry);
  return {
    coordinates,
    distanceKm: Number(data.distance_km ?? 0),
    routeRisk: Number(data.route_risk ?? 0),
    isFallback: Boolean(data.is_fallback),
  };
}

export async function getRisk(lat: number, lon: number, at?: string): Promise<FloodRiskResponse> {
  const qs = at ? `&at=${encodeURIComponent(at)}` : '';
  const url = floodWatchUrl(`/risk?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}${qs}`);
  return apiClient<FloodRiskResponse>(url);
}

export async function getAlerts(): Promise<any> {
  const url = floodWatchUrl('/alerts');
  return apiClient<any>(url);
}

export async function getRiskHeatmapMeta(at?: string): Promise<any> {
  const qs = at ? `?at=${encodeURIComponent(at)}` : '';
  const url = floodWatchUrl(`/ml/plot_meta/risk_heatmap${qs}`);
  return apiClient<any>(url);
}

export function getRiskHeatmapPngUrl(at?: string): string {
  const qs = at ? `?at=${encodeURIComponent(at)}` : '';
  return floodWatchUrl(`/ml/plot/risk_heatmap${qs}`);
}
