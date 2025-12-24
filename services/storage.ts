import { Place } from '@/data/kolkataPlaces';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@saved_places';

export const savePlace = async (place: Place): Promise<Place[]> => {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const savedPlaces: Place[] = stored ? JSON.parse(stored) : [];

        // Check if already saved
        if (savedPlaces.some(p => p.id === place.id)) {
            return savedPlaces;
        }

        const newPlaces = [...savedPlaces, place];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaces));
        return newPlaces;
    } catch (e) {
        console.error("Failed to save place", e);
        return [];
    }
};

export const removePlace = async (placeId: string): Promise<Place[]> => {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const savedPlaces: Place[] = stored ? JSON.parse(stored) : [];

        const newPlaces = savedPlaces.filter(p => p.id !== placeId);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaces));
        return newPlaces;
    } catch (e) {
        console.error("Failed to remove place", e);
        return [];
    }
};

export const getSavedPlaces = async (): Promise<Place[]> => {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to get saved places", e);
        return [];
    }
};

export const isPlaceSaved = async (placeId: string): Promise<boolean> => {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const savedPlaces: Place[] = stored ? JSON.parse(stored) : [];
        return savedPlaces.some(p => p.id === placeId);
    } catch (e) {
        return false;
    }
};
