import * as Location from 'expo-location';

type LocationCallback = (location: Location.LocationObject) => void;

let subscription: Location.LocationSubscription | null = null;

export const startTracking = async (callback: LocationCallback) => {
    if (subscription) return;

    try {
        subscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 5000,
                distanceInterval: 10,
            },
            callback
        );
    } catch (error) {
        console.error("Error starting location tracking:", error);
    }
};

export const stopTracking = () => {
    if (subscription) {
        subscription.remove();
        subscription = null;
    }
};
