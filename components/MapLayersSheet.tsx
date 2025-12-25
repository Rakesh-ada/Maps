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
    showRoadCondition: boolean;
    onToggleRoadCondition: () => void;
    showWaterlogging: boolean;
    onToggleWaterlogging: () => void;
    showOverall: boolean;
    onToggleOverall: () => void;
}

export default function MapLayersSheet({ visible, onClose, mapType, onMapTypeChange, showTraffic, onToggleTraffic, showRoadCondition, onToggleRoadCondition, showWaterlogging, onToggleWaterlogging, showOverall, onToggleOverall }: MapLayersSheetProps) {
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


                        <View style={styles.typesContainer}>
                            <TouchableOpacity activeOpacity={0.7} style={styles.typeOption} onPress={() => onMapTypeChange('standard')}>
                                <View style={[styles.typeIcon, mapType === 'standard' && styles.selectedTypeIcon]}>
                                    <MaterialIcons name="map" size={28} color={mapType === 'standard' ? '#1A73E8' : '#70757a'} />
                                </View>
                                <Text style={[styles.typeText, mapType === 'standard' && styles.selectedTypeText]}>Default</Text>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={0.7} style={styles.typeOption} onPress={() => onMapTypeChange(mapType === 'hybrid' ? 'standard' : 'hybrid')}>
                                <View style={[styles.typeIcon, mapType === 'hybrid' && styles.selectedTypeIcon]}>
                                    <MaterialIcons name="satellite" size={28} color={mapType === 'hybrid' ? '#1A73E8' : '#70757a'} />
                                </View>
                                <Text style={[styles.typeText, mapType === 'hybrid' && styles.selectedTypeText]}>Satellite</Text>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={0.7} style={styles.typeOption} onPress={() => onMapTypeChange('terrain')}>
                                <View style={[styles.typeIcon, mapType === 'terrain' && styles.selectedTypeIcon]}>
                                    <MaterialIcons name="terrain" size={28} color={mapType === 'terrain' ? '#1A73E8' : '#70757a'} />
                                </View>
                                <Text style={[styles.typeText, mapType === 'terrain' && styles.selectedTypeText]}>Terrain</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.detailsContainer}>
                            <TouchableOpacity activeOpacity={0.7} style={styles.typeOption} onPress={onToggleTraffic}>
                                <View style={[styles.typeIcon, showTraffic && styles.selectedTypeIcon]}>
                                    <MaterialIcons name="traffic" size={28} color={showTraffic ? '#1A73E8' : '#70757a'} />
                                </View>
                                <Text style={[styles.typeText, showTraffic && styles.selectedTypeText]}>Traffic</Text>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={0.7} style={styles.typeOption} onPress={onToggleRoadCondition}>
                                <View style={[styles.typeIcon, showRoadCondition && styles.selectedTypeIcon]}>
                                    <MaterialIcons name="add-road" size={28} color={showRoadCondition ? '#1A73E8' : '#70757a'} />
                                </View>
                                <Text style={[styles.typeText, showRoadCondition && styles.selectedTypeText]}>Road Condition</Text>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={0.7} style={styles.typeOption} onPress={onToggleWaterlogging}>
                                <View style={[styles.typeIcon, showWaterlogging && styles.selectedTypeIcon]}>
                                    <MaterialIcons name="water-drop" size={28} color={showWaterlogging ? '#1A73E8' : '#70757a'} />
                                </View>
                                <Text style={[styles.typeText, showWaterlogging && styles.selectedTypeText]}>Waterlogging</Text>
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={0.7} style={styles.typeOption} onPress={onToggleOverall}>
                                <View style={[styles.typeIcon, showOverall && styles.selectedTypeIcon]}>
                                    <MaterialIcons name="layers" size={28} color={showOverall ? '#1A73E8' : '#70757a'} />
                                </View>
                                <Text style={[styles.typeText, showOverall && styles.selectedTypeText]}>Overall</Text>
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

    typesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    typeOption: {
        alignItems: 'center',
        flex: 1,
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
        textAlign: 'center',
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
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
});
