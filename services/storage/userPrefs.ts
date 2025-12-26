import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = '@user_prefs';

export interface UserPrefs {
    mapType: 'standard' | 'satellite' | 'hybrid' | 'terrain';
    showTraffic: boolean;
}

const DEFAULT_PREFS: UserPrefs = {
    mapType: 'standard',
    showTraffic: false,
};

export const getUserPrefs = async (): Promise<UserPrefs> => {
    try {
        const stored = await AsyncStorage.getItem(PREFS_KEY);
        return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
    } catch (e) {
        console.error("Failed to get user prefs", e);
        return DEFAULT_PREFS;
    }
};

export const saveUserPrefs = async (prefs: Partial<UserPrefs>) => {
    try {
        const current = await getUserPrefs();
        const newPrefs = { ...current, ...prefs };
        await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(newPrefs));
    } catch (e) {
        console.error("Failed to save user prefs", e);
    }
};
