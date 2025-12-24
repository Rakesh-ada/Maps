import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RouteInfo {
    distance: number; // in meters
    duration: number; // in seconds
    steps?: Array<{
        instruction: string;
        distance: number;
        duration: number;
    }>;
}

interface RouteInfoSheetProps {
    routeInfo: RouteInfo | null;
    onClose: () => void;
    onStartNavigation?: () => void;
    travelMode: 'driving' | 'walking';
    onModeChange: (mode: 'driving' | 'walking') => void;
}

export default function RouteInfoSheet({ routeInfo, onClose, onStartNavigation, travelMode, onModeChange }: RouteInfoSheetProps) {
    if (!routeInfo) return null;

    const formatDistance = (meters: number): string => {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        }
        return `${(meters / 1000).toFixed(1)} km`;
    };

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} hr ${remainingMinutes} min`;
    };

    const getStepIcon = (instruction: string): any => {
        const lower = instruction.toLowerCase();
        if (lower.includes('left')) return 'turn-left';
        if (lower.includes('right')) return 'turn-right';
        if (lower.includes('u-turn')) return 'u-turn-left';
        if (lower.includes('straight')) return 'arrow-upward';
        if (lower.includes('roundabout')) return 'roundabout-left';
        return 'navigation';
    };

    return (
        <View style={styles.container}>
            <View style={styles.handleContainer}>
                <View style={styles.handle} />
            </View>
            <View style={styles.header}>
                <View style={styles.routeSummary}>
                    <Text style={styles.duration}>
                        {formatDuration(routeInfo.duration)}
                        <Text style={styles.trafficNote}> (Fastest)</Text>
                    </Text>
                    <View style={styles.detailsRow}>
                        <Text style={styles.distanceAlert}>{formatDistance(routeInfo.distance)}</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <MaterialIcons name="close" size={24} color="#5f6368" />
                </TouchableOpacity>
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity onPress={onStartNavigation} style={styles.startButton} activeOpacity={0.8}>
                    <MaterialIcons name="navigation" size={24} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>

                <View style={styles.modeContainer}>
                    <TouchableOpacity
                        style={[styles.modeButton, travelMode === 'driving' && styles.selectedModeButton]}
                        onPress={() => onModeChange('driving')}
                    >
                        <MaterialIcons name="directions-car" size={24} color={travelMode === 'driving' ? '#1A73E8' : '#70757a'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeButton, travelMode === 'walking' && styles.selectedModeButton]}
                        onPress={() => onModeChange('walking')}
                    >
                        <MaterialIcons name="directions-walk" size={24} color={travelMode === 'walking' ? '#1A73E8' : '#70757a'} />
                    </TouchableOpacity>
                </View>
            </View>

            {routeInfo.steps && routeInfo.steps.length > 0 && (
                <View style={{ flex: 1, maxHeight: 200 }}>
                    <ScrollView style={styles.stepsContainer}>
                        <Text style={styles.stepsTitle}>Directions</Text>
                        {routeInfo.steps.map((step, index) => (
                            <View key={index} style={styles.stepItem}>
                                <View style={styles.stepIcon}>
                                    <MaterialIcons name={getStepIcon(step.instruction)} size={20} color="#5f6368" />
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepInstruction}>{step.instruction}</Text>
                                    <Text style={styles.stepDistance}>{formatDistance(step.distance)}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 16,
        maxHeight: '45%',
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    routeSummary: {
        flex: 1,
    },
    duration: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#188038', // Google Maps Green for good traffic
        letterSpacing: -0.5,
    },
    trafficNote: {
        fontSize: 18,
        fontWeight: '500',
        color: '#70757a',
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    distanceAlert: {
        fontSize: 16,
        color: '#70757a',
        fontWeight: '500',
    },
    closeButton: {
        padding: 4,
        marginTop: 4,
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        justifyContent: 'space-between',
    },
    startButton: {
        flex: 1,
        backgroundColor: '#1A73E8',
        paddingVertical: 12,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        elevation: 2,
    },
    startButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    modeContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f3f4',
        borderRadius: 24,
        padding: 4,
    },
    modeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    selectedModeButton: {
        backgroundColor: 'white',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    stepsContainer: {
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f3f4',
        paddingTop: 10,
    },
    stepsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#202124',
        marginBottom: 12,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    stepIcon: {
        marginTop: 2,
        marginRight: 16,
    },
    stepContent: {
        flex: 1,
    },
    stepInstruction: {
        fontSize: 16,
        color: '#202124',
        marginBottom: 4,
        lineHeight: 22,
        textTransform: 'capitalize',
    },
    stepDistance: {
        fontSize: 13,
        color: '#70757a',
    },
});
