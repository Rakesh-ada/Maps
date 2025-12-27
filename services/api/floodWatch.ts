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
}

export interface RouteGeometry {
    type: string;
    coordinates: number[][]; // [lon, lat]
}

export interface FloodRouteData {
    distance_km: number;
    route_risk: number;
    geometry: RouteGeometry;
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

export interface MlPlotMetaResponse {
    plot: string;
    meta: {
        bounds: MlPlotBounds;
        bins?: number;
        [key: string]: any;
    };
}

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
    getFloodRisk: async (lat: number, lon: number): Promise<RiskData> => {
        const url = `${API_BASE_URL}/risk?lat=${lat}&lon=${lon}`;
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
    ): Promise<FloodRouteData> => {
        const url = `${API_BASE_URL}/route?start_lat=${startLat}&start_lon=${startLon}&end_lat=${endLat}&end_lon=${endLon}`;
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

    getMlPlotMeta: async (plotName: string): Promise<MlPlotMetaResponse> => {
        return apiClient(`${API_BASE_URL}/ml/plot_meta/${encodeURIComponent(plotName)}`);
    },

    getMlPlotUrl: (plotName: string, cacheBust = true): string => {
        const base = `${API_BASE_URL}/ml/plot/${encodeURIComponent(plotName)}`;
        return cacheBust ? `${base}?t=${Date.now()}` : base;
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
