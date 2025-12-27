import * as TaskManager from 'expo-task-manager';
import { DeviceEventEmitter } from 'react-native';

export const BACKGROUND_NAVIGATION_TASK = 'BACKGROUND_NAVIGATION_TASK';

TaskManager.defineTask(BACKGROUND_NAVIGATION_TASK, async ({ data, error }) => {
    if (error) {
        console.error("Background task error:", error);
        return;
    }
    if (data) {
        const { locations } = data as any;
        // Emit event to the UI
        DeviceEventEmitter.emit('backgroundLocation', locations);
        // console.log("Received background location", locations[0]);
    }
});
