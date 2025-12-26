import * as Location from 'expo-location';

export const requestLocationPermissions = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
};

export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
    try {
        const hasPermission = await requestLocationPermissions();
        if (!hasPermission) return null;

        return await Location.getCurrentPositionAsync({});
    } catch (error) {
        console.error("Error getting location:", error);
        return null;
    }
};
