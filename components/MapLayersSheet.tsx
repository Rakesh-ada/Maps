import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { MapType } from 'react-native-maps';

interface MapLayersSheetProps {
    visible: boolean;
    onClose: () => void;
    mapType: MapType;
    onMapTypeChange: (type: MapType) => void;
    showTraffic: boolean;
    onToggleTraffic: () => void;
}

export default function MapLayersSheet({ visible, onClose, mapType, onMapTypeChange, showTraffic, onToggleTraffic }: MapLayersSheetProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <TouchableWithoutFeedback>
                    <View style={styles.sheet}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Map details</Text>
                            <TouchableOpacity onPress={onClose}>
                                <MaterialIcons name="close" size={24} color="#5f6368" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>Map type</Text>
                        <View style={styles.typesContainer}>
                            <TouchableOpacity style={styles.typeOption} onPress={() => onMapTypeChange('standard')}>
                                <View style={[styles.typeIcon, mapType === 'standard' && styles.selectedTypeIcon]}>
                                    <MaterialIcons name="map" size={28} color={mapType === 'standard' ? '#1A73E8' : '#70757a'} />
                                </View>
                                <Text style={[styles.typeText, mapType === 'standard' && styles.selectedTypeText]}>Default</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.typeOption} onPress={() => onMapTypeChange('satellite')}>
                                <View style={[styles.typeIcon, mapType === 'satellite' && styles.selectedTypeIcon]}>
                                    <MaterialIcons name="satellite" size={28} color={mapType === 'satellite' ? '#1A73E8' : '#70757a'} />
                                </View>
                                <Text style={[styles.typeText, mapType === 'satellite' && styles.selectedTypeText]}>Satellite</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.typeOption} onPress={() => onMapTypeChange('terrain')}>
                                <View style={[styles.typeIcon, mapType === 'terrain' && styles.selectedTypeIcon]}>
                                    <MaterialIcons name="terrain" size={28} color={mapType === 'terrain' ? '#1A73E8' : '#70757a'} />
                                </View>
                                <Text style={[styles.typeText, mapType === 'terrain' && styles.selectedTypeText]}>Terrain</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>Map details</Text>
                        <View style={styles.detailsContainer}>
                            <TouchableOpacity style={styles.typeOption} onPress={onToggleTraffic}>
                                <View style={[styles.typeIcon, showTraffic && styles.selectedTypeIcon]}>
                                    <MaterialIcons name="traffic" size={28} color={showTraffic ? '#1A73E8' : '#70757a'} />
                                </View>
                                <Text style={[styles.typeText, showTraffic && styles.selectedTypeText]}>Traffic</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '500',
        color: '#202124',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#202124',
        marginBottom: 16,
    },
    typesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    typeOption: {
        alignItems: 'center',
        width: 80,
    },
    typeIcon: {
        width: 56,
        height: 56,
        borderRadius: 12, // Rounded square
        borderWidth: 2,
        borderColor: '#e8eaed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: 'white',
    },
    selectedTypeIcon: {
        borderColor: '#1A73E8',
        backgroundColor: '#e8f0fe',
    },
    typeText: {
        fontSize: 12,
        color: '#70757a',
        fontWeight: '500',
    },
    selectedTypeText: {
        color: '#1A73E8',
    },
    divider: {
        height: 1,
        backgroundColor: '#e8eaed',
        marginBottom: 24,
    },
    detailsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
});
