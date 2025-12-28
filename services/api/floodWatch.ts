import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from './apiClient';

// Use 10.0.2.2 for Android Emulator, localhost for iOS/Web
// You might need to change this to your machine's IP if testing on a real device
const resolveDevHost = (): string | null => {
    const anyConstants: any = Constants;
    const debuggerHost: string | undefined = anyConstants?.expoConfig?.debuggerHost ?? anyConstants?.manifest?.debuggerHost;
    const hostUri: string | undefined = anyConstants?.expoConfig?.hostUri ?? anyConstants?.manifest2?.extra?.expoClient?.hostUri;

    const candidate = debuggerHost ?? hostUri;
    if (!candidate || typeof candidate !== 'string') return null;

    // debuggerHost looks like: "192.168.0.5:19000" or "192.168.0.5:8081"
    const host = candidate.split(':')[0]?.trim();
    if (!host) return null;
    return host;
};

const normalizeBaseUrl = (raw: string | undefined): string | null => {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim().replace(/\/+$/, '');
    if (!trimmed) return null;

    try {
        const u = new URL(trimmed);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
        if (u.pathname && u.pathname !== '/') return null;
        return `${u.protocol}//${u.host}`;
    } catch {
        return null;
    }
};

const adaptAndroidLoopback = (baseUrl: string, devHost: string | null): string => {
    if (Platform.OS !== 'android') return baseUrl;

    try {
        const u = new URL(baseUrl);
        const host = (u.hostname || '').toLowerCase();
        if (host !== 'localhost' && host !== '127.0.0.1') return baseUrl;

        const port = u.port ? `:${u.port}` : ':8000';
        if (devHost) return `http://${devHost}${port}`;
        return `http://10.0.2.2${port}`;
    } catch {
        return baseUrl;
    }
};

const API_BASE_URL = (() => {
    const devHost = resolveDevHost();

    const envUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_FLOODWATCH_BASE_URL);
    if (envUrl) return adaptAndroidLoopback(envUrl, devHost);

    const isDevice = Boolean((Constants as any)?.isDevice);
    if (Platform.OS === 'android' && !isDevice) return 'http://10.0.2.2:8000';

    if (devHost) return `http://${devHost}:8000`;

    return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';
})();

export interface RiskData {
    risk_score: number;
    risk_level: string;
    ml_details: {
        cluster: number;
        anomaly: number;
    };
    as_of?: {
        ts_epoch: number;
        ts_utc: string;
        rainfall_raw: number | null;
    };
}

export interface RouteGeometry {
    type: string;
    coordinates: number[][]; // [lon, lat]
}

export interface FloodRouteData {
    distance_km: number;
    route_risk: number;
    geometry: RouteGeometry;
    is_fallback?: boolean;
}

export interface Alert {
    id?: string;
    message: string;
    severity?: string;
    timestamp?: string;
    // Add other fields as returned by the backend if necessary
}

export interface AlertsResponse {
    alerts: any[];
    messages: string[]; // Legacy simple string alerts
}

export interface MlPlotBounds {
    west: number;
    east: number;
    south: number;
    north: number;
}

export interface RainfallTime {
    ts_epoch: number;
    ts_utc: string;
}

export interface MlPlotMetaResponse {
    plot: string;
    meta: {
        bounds: MlPlotBounds;
        bins?: number;
        [key: string]: any;
    };
    window?: {
        from_ts: number;
        to_ts: number;
    } | null;
}

type MlPlotQuery = {
    hours?: number;
    from?: string;
    to?: string;
    at?: string;
};

export const floodWatchApi = {
    /**
     * Check if the backend is healthy
     */
    checkHealth: async (): Promise<{ status: string }> => {
        return apiClient(`${API_BASE_URL}/health`);
    },

    /**
     * Get flood risk for a specific location
     */
    getFloodRisk: async (lat: number, lon: number, at?: string): Promise<RiskData> => {
        const qsParts: string[] = [`lat=${encodeURIComponent(String(lat))}`, `lon=${encodeURIComponent(String(lon))}`];
        if (typeof at === 'string' && at.trim()) qsParts.push(`at=${encodeURIComponent(at.trim())}`);
        const url = `${API_BASE_URL}/risk?${qsParts.join('&')}`;
        return apiClient<RiskData>(url);
    },

    /**
     * Get a flood-safe route between two points
     */
    getFloodRoute: async (
        startLat: number,
        startLon: number,
        endLat: number,
        endLon: number
    , opts?: { waterlogging?: boolean }): Promise<FloodRouteData> => {
        const qsParts: string[] = [
            `start_lat=${encodeURIComponent(String(startLat))}`,
            `start_lon=${encodeURIComponent(String(startLon))}`,
            `end_lat=${encodeURIComponent(String(endLat))}`,
            `end_lon=${encodeURIComponent(String(endLon))}`,
        ];
        if (opts?.waterlogging) qsParts.push('waterlogging=1');
        const url = `${API_BASE_URL}/route?${qsParts.join('&')}`;
        return apiClient<FloodRouteData>(url);
    },

    /**
     * Submit a flood report
     * @param severity 1 (Low) to 5 (Critical)
     */
    submitReport: async (lat: number, lon: number, severity: number): Promise<{ status: string }> => {
        return apiClient(`${API_BASE_URL}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lat, lon, severity }),
        });
    },

    /**
     * Get active flood alerts
     */
    getAlerts: async (): Promise<AlertsResponse> => {
        return apiClient(`${API_BASE_URL}/alerts`);
    },

    getMlPlotMeta: async (plotName: string, query?: MlPlotQuery): Promise<MlPlotMetaResponse> => {
        const base = `${API_BASE_URL}/ml/plot_meta/${encodeURIComponent(plotName)}`;
        const qsParts: string[] = [];
        if (typeof query?.hours === 'number') qsParts.push(`hours=${encodeURIComponent(String(query.hours))}`);
        if (typeof query?.from === 'string' && query.from.trim()) qsParts.push(`from=${encodeURIComponent(query.from.trim())}`);
        if (typeof query?.to === 'string' && query.to.trim()) qsParts.push(`to=${encodeURIComponent(query.to.trim())}`);
        if (typeof query?.at === 'string' && query.at.trim()) qsParts.push(`at=${encodeURIComponent(query.at.trim())}`);
        const qs = qsParts.length ? `?${qsParts.join('&')}` : '';
        return apiClient(`${base}${qs}`);
    },

    getRainfallTimes: async (limit: number = 30): Promise<{ times: RainfallTime[] }> => {
        const url = `${API_BASE_URL}/ml/rainfall_times?limit=${encodeURIComponent(String(limit))}`;
        return apiClient<{ times: RainfallTime[] }>(url);
    },

    getMlPlotUrl: (
        plotName: string,
        cacheBustOrOpts: boolean | (MlPlotQuery & { cacheBust?: boolean }) = true
    ): string => {
        const base = `${API_BASE_URL}/ml/plot/${encodeURIComponent(plotName)}`;
        const opts = typeof cacheBustOrOpts === 'boolean' ? { cacheBust: cacheBustOrOpts } : (cacheBustOrOpts ?? {});

        const qsParts: string[] = [];
        if (typeof opts.hours === 'number') qsParts.push(`hours=${encodeURIComponent(String(opts.hours))}`);
        if (typeof opts.from === 'string' && opts.from.trim()) qsParts.push(`from=${encodeURIComponent(opts.from.trim())}`);
        if (typeof opts.to === 'string' && opts.to.trim()) qsParts.push(`to=${encodeURIComponent(opts.to.trim())}`);
        if (typeof opts.at === 'string' && opts.at.trim()) qsParts.push(`at=${encodeURIComponent(opts.at.trim())}`);
        const cacheBust = opts.cacheBust !== false;
        if (cacheBust) qsParts.push(`t=${Date.now()}`);

        return qsParts.length ? `${base}?${qsParts.join('&')}` : base;
    },

    /**
     * Trigger ML model retraining
     */
    retrainModel: async (): Promise<any> => {
        return apiClient(`${API_BASE_URL}/ml/retrain`, {
            method: 'POST',
        });
    }
};
