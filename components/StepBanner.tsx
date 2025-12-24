import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StepBannerProps {
    instruction: string;
    distance: number;
    onExit: () => void;
}

export default function StepBanner({ instruction, distance, onExit }: StepBannerProps) {
    const insets = useSafeAreaInsets();

    const getIcon = (instruction: string): any => {
        const lower = instruction.toLowerCase();
        if (lower.includes('left')) return 'arrow-left-top';
        if (lower.includes('right')) return 'arrow-right-top';
        if (lower.includes('u-turn')) return 'arrow-u-left-top';
        if (lower.includes('straight') || lower.includes('continue')) return 'arrow-up';
        if (lower.includes('roundabout')) return 'rotate-left';
        return 'navigation';
    };

    const formatDistance = (meters: number): string => {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        }
        return `${(meters / 1000).toFixed(1)} km`;
    };

    return (
        <View style={[styles.container, { top: insets.top + 10 }]}>
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name={getIcon(instruction)} size={32} color="#5f6368" />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.instruction} numberOfLines={2}>
                        {instruction}
                    </Text>
                    <Text style={styles.distance}>
                        {formatDistance(distance)}
                    </Text>
                </View>
                <View style={styles.exitContainer}>
                    <MaterialCommunityIcons name="close" size={24} color="#5f6368" onPress={onExit} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 16,
        zIndex: 100, // Ensure it sits above other floating elements
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    iconContainer: {
        marginRight: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f1f3f4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    instruction: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#5f6368',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    distance: {
        fontSize: 16,
        fontWeight: '500',
        color: '#5f6368',
    },
    exitContainer: {
        marginLeft: 10,
        padding: 4,
    },
});
