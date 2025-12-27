import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Polygon } from 'react-native-svg';

interface MapControlsProps {
    onOpenLayers: () => void;
    onRecenter: () => void;
    isUserLocationCentered?: boolean;
    onNavigate?: () => void;
    onReport?: () => void;
    heading?: number;
    isCompassMode?: boolean;
    showLayers?: boolean;
    isNavigation?: boolean;
}

export default function MapControls({ onOpenLayers, onRecenter, isUserLocationCentered, onNavigate, onReport, heading = 0, isCompassMode, showLayers = true, isNavigation = false }: MapControlsProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { top: insets.top + (isNavigation ? 110 : 160) }]} pointerEvents="box-none">
            {/* Top Right Controls */}
            <View style={styles.topRightControls}>
                {showLayers && (
                    <TouchableOpacity style={styles.fab} onPress={onOpenLayers} activeOpacity={0.9}>
                        <MaterialIcons name="layers" size={24} color="#5f6368" />
                    </TouchableOpacity>
                )}

                {onReport && showLayers && (
                    <TouchableOpacity style={styles.fab} onPress={onReport} activeOpacity={0.9} onLongPress={() => { }}>
                        <MaterialIcons name="campaign" size={24} color="#D93025" />
                    </TouchableOpacity>
                )}

                {(isCompassMode || isNavigation) && (
                    <TouchableOpacity
                        style={[styles.fab, styles.compassFab]}
                        activeOpacity={0.9}
                    >
                        <Svg width={48} height={48} viewBox="0 0 24 24" style={{ transform: [{ rotate: `${-heading}deg` }] }}>
                            <Path
                                d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
                                fill="white"
                            />
                            <Polygon points="12,6 15,12 9,12" fill="#EA4335" />
                            <Polygon points="12,18 15,12 9,12" fill="#1A73E8" />
                        </Svg>
                    </TouchableOpacity>
                )}
            </View>

            {/* Bottom Right Controls */}
            <View style={styles.bottomRightControls}>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={onRecenter}
                    activeOpacity={0.9}
                >
                    <MaterialIcons name="my-location" size={24} color={isUserLocationCentered ? "#1A73E8" : "#5f6368"} />
                </TouchableOpacity>

                {onNavigate && (
                    <TouchableOpacity style={[styles.fab, styles.navigateFab]} onPress={onNavigate} activeOpacity={0.9}>
                        <MaterialIcons name="directions" size={24} color="white" />
                        <View style={styles.navigateTextContainer}>
                            {/* Optional: Text "GO" could go here if we wanted a pill shape */}
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
        flexDirection: 'column',
    },
    topRightControls: {
        position: 'absolute',
        right: 16,
        // Top alignment is handled by container padding/top prop
        top: 0,
        alignItems: 'center',
    },
    bottomRightControls: {
        position: 'absolute',
        right: 16,
        bottom: 12, // Lowered as requested
        alignItems: 'center',
    },
    fab: {
        width: 48,
        height: 48,
        borderRadius: 24, // Circular but Google Maps uses slightly more square sometimes, but circle is safe
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
        marginBottom: 12,
    },
    compassFab: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
    },
    navigateFab: {
        backgroundColor: '#1A73E8',
        width: 56,
        height: 56,
        borderRadius: 16, // Squircle for the primary action
    },
    navigateTextContainer: {

    }
});
