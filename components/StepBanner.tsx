import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StepBannerProps {
    instruction: string;
    distance: number;
    nextInstruction?: string;
    onExit: () => void;
}

export default function StepBanner({ instruction, distance, nextInstruction, onExit }: StepBannerProps) {
    const insets = useSafeAreaInsets();

    const getIcon = (instruction: string): any => {
        const lower = instruction.toLowerCase();
        if (lower.includes('left')) return 'arrow-left-top';
        if (lower.includes('right')) return 'arrow-right-top';
        if (lower.includes('u-turn')) return 'arrow-u-left-top';
        if (lower.includes('straight') || lower.includes('continue')) return 'arrow-up';
        if (lower.includes('roundabout')) return 'rotate-left';
        if (lower.includes('destination') || lower.includes('arrive')) return 'map-marker';
        return 'navigation';
    };

    const formatDistance = (meters: number): string => {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        }
        return `${(meters / 1000).toFixed(1)} km`;
    };

    // Parse main instruction to split "Turn Left" and "Onto Main St" if possible
    // Simple heuristic: split by 'onto' or take the whole string
    const parseInstruction = (text: string) => {
        // This regex is a simple attempt. Maneuvers often come as "Turn left onto X road"
        const lower = text.toLowerCase();
        // Remove "Turn left" etc from the display if we want just the road name like G-Maps?
        // Actually G-Maps shows "Turn Left" big, then road name small or vice versa.
        // Let's keep it simple: Show full text but bold.
        return text;
    };

    return (
        <View style={[styles.container, { top: insets.top }]}>
            {/* Primary Step Card */}
            <View style={styles.primaryCard}>
                <View style={styles.primaryContent}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name={getIcon(instruction)} size={48} color="white" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.primaryDistance}>{formatDistance(distance)}</Text>
                        <Text style={styles.primaryInstruction} numberOfLines={2}>
                            {parseInstruction(instruction)}
                        </Text>
                    </View>
                </View>

                {/* Close Button overlay */}
                <TouchableOpacity onPress={onExit} style={styles.closeButton}>
                    <MaterialCommunityIcons name="close" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Secondary "Then" Card */}
            {nextInstruction && (
                <View style={styles.secondaryCard}>
                    <Text style={styles.thenText}>Then</Text>
                    <MaterialCommunityIcons name={getIcon(nextInstruction)} size={20} color="white" style={styles.thenIcon} />
                    <Text style={styles.secondaryInstruction} numberOfLines={1}>
                        {nextInstruction}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 10,
        right: 10,
        zIndex: 100,
        // No alignItems: 'center' so cards stretch or use own width
    },
    primaryCard: {
        backgroundColor: '#007d3c', // Google Maps Green
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,

        // If there is a next step, primary card often has no bottom radius or small one, 
        // but let's give it structure.
        // Actually G-Maps connects them. Let's do that.
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,

        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minHeight: 100,
    },
    primaryContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    primaryDistance: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    primaryInstruction: {
        color: 'white',
        fontSize: 20,
        fontWeight: '500',
        // Allow text to wrap
    },
    secondaryCard: {
        backgroundColor: '#005f33', // Darker Green
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000', // Shadow for the bottom part
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    thenText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    thenIcon: {
        marginRight: 8,
    },
    secondaryInstruction: {
        color: 'white',
        fontSize: 16,
        flex: 1,
    },
    closeButton: {
        padding: 8,
        // Position top right
        position: 'absolute',
        top: 8,
        right: 8,
    }
});
