import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Place } from '../data/kolkataPlaces';

interface PlaceDetailSheetProps {
    place: Place;
    onClose: () => void;
    onNavigate: () => void;
}

export default function PlaceDetailSheet({ place, onClose, onNavigate }: PlaceDetailSheetProps) {
    const onCopyCoordinates = async () => {
        await Clipboard.setStringAsync(`${place.latitude}, ${place.longitude}`);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.handle} />
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close-circle" size={28} color="#e0e0e0" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{place.name}</Text>

                <View style={styles.infoRow}>
                    <Text style={styles.address}>{place.address}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.coordinates}>
                        {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
                    </Text>
                    <TouchableOpacity onPress={onCopyCoordinates} style={styles.copyButton}>
                        <Ionicons name="copy-outline" size={16} color="#70757a" />
                    </TouchableOpacity>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.navigateButton} onPress={onNavigate}>
                        <MaterialIcons name="directions" size={24} color="white" />
                        <Text style={styles.navigateText}>Directions</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 0, // Remove default padding to control inner layout better
        paddingBottom: 20, // Reduced from 40
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 15,
        width: '100%',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 4,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        marginBottom: 8,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 12,
    },
    content: {
        paddingHorizontal: 24, // Consistent horizontal padding
        paddingBottom: 10, // Reduced from 24
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#202124',
        marginBottom: 8,
        lineHeight: 28, // Better line height for multi-line titles
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    address: {
        fontSize: 14,
        color: '#70757a',
        flex: 1,
    },
    coordinates: {
        fontSize: 14,
        color: '#70757a',
        fontFamily: 'monospace', // Monospace helps aligning coords nicely
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    navigateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A73E8',
        paddingVertical: 10,
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 24,
    },
    navigateText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
    copyButton: {
        marginLeft: 8,
        padding: 4,
    }
});
