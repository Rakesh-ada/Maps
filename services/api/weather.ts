import { apiClient } from './apiClient';

const WEATHER_BASE = "https://api.open-meteo.com/v1/forecast";

export const getWeather = async (lat: number, lon: number) => {
    const url = `${WEATHER_BASE}?latitude=${lat}&longitude=${lon}&current_weather=true`;

    try {
        const data = await apiClient<any>(url);
        return mapWmoCodeToIcon(data.current_weather.weathercode);
    } catch (error) {
        console.warn("Weather fetch failed:", error);
        return "cloud"; // Default fallback
    }
};

const mapWmoCodeToIcon = (code: number): string => {
    if (code === 0) return "sunny";
    if (code >= 1 && code <= 3) return "partly-sunny";
    if (code >= 45 && code <= 48) return "cloudy";
    if (code >= 51 && code <= 67) return "rainy";
    if (code >= 95) return "thunderstorm";
    return "cloud"; // Default
};
