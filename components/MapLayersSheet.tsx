import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { MapType } from 'react-native-maps';

const WL_TZ_OFFSET = '+05:30';

const pad2 = (n: number): string => String(n).padStart(2, '0');

const digitsOnly = (value: string, maxDigits: number): string => {
    const d = String(value || '').replace(/\D+/g, '');
    return d.slice(0, maxDigits);
};

const formatDdMmYyyy = (value: string): string => {
    const d = digitsOnly(value, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

const formatHhMm = (value: string): string => {
    const d = digitsOnly(value, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}:${d.slice(2)}`;
};

const isoToParts = (iso: string): { date: string; time: string } => {
    const s = String(iso || '').trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!m) return { date: '', time: '' };
    const yyyy = m[1];
    const mm = m[2];
    const dd = m[3];
    const hh = m[4];
    const mi = m[5];
    return { date: `${dd}/${mm}/${yyyy}`, time: `${hh}:${mi}` };
};

const partsToIso = (dateText: string, timeText: string): string => {
    const d = String(dateText || '').trim();
    const t = String(timeText || '').trim();

    if (!d || !t) return '';

    const dm = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    const tm = t.match(/^(\d{1,2}):(\d{1,2})$/);
    if (!dm || !tm) return '';

    const dd = Number(dm[1]);
    const mm = Number(dm[2]);
    const yyyy = Number(dm[3]);
    const hh = Number(tm[1]);
    const mi = Number(tm[2]);

    if (yyyy < 1900 || yyyy > 2100) return '';
    if (mm < 1 || mm > 12) return '';
    if (hh < 0 || hh > 23) return '';
    if (mi < 0 || mi > 59) return '';

    const dt = new Date(yyyy, mm - 1, dd, hh, mi, 0, 0);
    if (dt.getFullYear() !== yyyy || dt.getMonth() !== (mm - 1) || dt.getDate() !== dd) return '';

    return `${yyyy}-${pad2(mm)}-${pad2(dd)}T${pad2(hh)}:${pad2(mi)}:00${WL_TZ_OFFSET}`;
};

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
    waterloggingHours?: number;
    onWaterloggingHoursChange?: (hours: number) => void;
    waterloggingMode?: 'hours' | 'range';
    onWaterloggingModeChange?: (mode: 'hours' | 'range') => void;
    waterloggingFrom?: string;
    waterloggingTo?: string;
    onWaterloggingFromChange?: (value: string) => void;
    onWaterloggingToChange?: (value: string) => void;
    onWaterloggingTest?: (fromIso: string, toIso: string) => void;
    showOverall: boolean;
    onToggleOverall: () => void;
    overallAt?: string;
    onOverallAtChange?: (value: string) => void;
    overallAtOptions?: Array<{ label: string; value: string }>;
    onOverallTest?: () => void;
    overallTestHistory?: Array<{ testedAt: string; riskScore: number; riskLevel: string; rainfallRaw?: number | null }>;
}

export default function MapLayersSheet({ visible, onClose, mapType, onMapTypeChange, showTraffic, onToggleTraffic, showRoadCondition, onToggleRoadCondition, showWaterlogging, onToggleWaterlogging, waterloggingHours = 6, onWaterloggingHoursChange, waterloggingMode = 'hours', onWaterloggingModeChange, waterloggingFrom = '', waterloggingTo = '', onWaterloggingFromChange, onWaterloggingToChange, onWaterloggingTest, showOverall, onToggleOverall, overallAt = '', onOverallAtChange, overallAtOptions, onOverallTest, overallTestHistory = [] }: MapLayersSheetProps) {
    const options = [1, 3, 6, 12, 24];
    const [overallPickerVisible, setOverallPickerVisible] = useState(false);
    const [overallUseCustom, setOverallUseCustom] = useState(false);

    const [wlFromDate, setWlFromDate] = useState(() => isoToParts(waterloggingFrom).date);
    const [wlFromTime, setWlFromTime] = useState(() => isoToParts(waterloggingFrom).time);
    const [wlToDate, setWlToDate] = useState(() => isoToParts(waterloggingTo).date);
    const [wlToTime, setWlToTime] = useState(() => isoToParts(waterloggingTo).time);

    useEffect(() => {
        if (!visible) return;
        if (waterloggingMode !== 'range') return;
        const f = isoToParts(waterloggingFrom);
        const t = isoToParts(waterloggingTo);
        setWlFromDate(f.date);
        setWlFromTime(f.time);
        setWlToDate(t.date);
        setWlToTime(t.time);
    }, [visible, waterloggingMode, waterloggingFrom, waterloggingTo]);

    const resolvedOverallOptions = useMemo(() => {
        if (Array.isArray(overallAtOptions) && overallAtOptions.length) return overallAtOptions;
        return [
            { label: 'Live (now)', value: '' },
            { label: 'Example: 2024-12-01T04:00:00+05:30', value: '2024-12-01T04:00:00+05:30' },
        ];
    }, [overallAtOptions]);

    const currentOverallLabel = useMemo(() => {
        const hit = resolvedOverallOptions.find((o) => String(o.value) === String(overallAt));
        if (hit) return hit.label;
        if (!overallAt.trim()) return 'Live (now)';
        return overallAt.trim();
    }, [overallAt, resolvedOverallOptions]);

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

                        {showWaterlogging && (typeof onWaterloggingHoursChange === 'function' || typeof onWaterloggingModeChange === 'function') && (
                            <>
                                <View style={styles.divider} />
                                <Text style={styles.sectionTitle}>Waterlogging time window</Text>

                                <View style={styles.pillsRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={[styles.pill, waterloggingMode === 'hours' && styles.pillSelected]}
                                        onPress={() => onWaterloggingModeChange?.('hours')}
                                    >
                                        <Text style={[styles.pillText, waterloggingMode === 'hours' && styles.pillTextSelected]}>Last N hours</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={[styles.pill, waterloggingMode === 'range' && styles.pillSelected]}
                                        onPress={() => onWaterloggingModeChange?.('range')}
                                    >
                                        <Text style={[styles.pillText, waterloggingMode === 'range' && styles.pillTextSelected]}>Custom range</Text>
                                    </TouchableOpacity>
                                </View>

                                {waterloggingMode === 'hours' && typeof onWaterloggingHoursChange === 'function' && (
                                    <>
                                        <View style={styles.pillsRow}>
                                            {options.map((h) => {
                                                const selected = Number(waterloggingHours) === Number(h);
                                                return (
                                                    <TouchableOpacity
                                                        key={`wl-${h}`}
                                                        activeOpacity={0.8}
                                                        style={[styles.pill, selected && styles.pillSelected]}
                                                        onPress={() => onWaterloggingHoursChange(h)}
                                                    >
                                                        <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{h}h</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                        <Text style={styles.sectionHint}>This controls live crowd reports (last N hours) blended into the historical hotspots.</Text>
                                    </>
                                )}

                                {waterloggingMode === 'range' && (
                                    <>
                                        <View style={styles.inputBlock}>
                                            <Text style={styles.inputLabel}>From</Text>
                                            <View style={styles.inputRow}>
                                                <TextInput
                                                    value={wlFromDate}
                                                    onChangeText={(t) => {
                                                        const next = formatDdMmYyyy(t);
                                                        setWlFromDate(next);
                                                        onWaterloggingFromChange?.(partsToIso(next, wlFromTime));
                                                    }}
                                                    placeholder="DD/MM/YYYY"
                                                    keyboardType="number-pad"
                                                    autoCapitalize="none"
                                                    autoCorrect={false}
                                                    maxLength={10}
                                                    style={[styles.textInput, styles.dateInput]}
                                                />
                                                <TextInput
                                                    value={wlFromTime}
                                                    onChangeText={(t) => {
                                                        const next = formatHhMm(t);
                                                        setWlFromTime(next);
                                                        onWaterloggingFromChange?.(partsToIso(wlFromDate, next));
                                                    }}
                                                    placeholder="HH:MM"
                                                    keyboardType="number-pad"
                                                    autoCapitalize="none"
                                                    autoCorrect={false}
                                                    maxLength={5}
                                                    style={[styles.textInput, styles.timeInput]}
                                                />
                                            </View>
                                        </View>
                                        <View style={styles.inputBlock}>
                                            <Text style={styles.inputLabel}>To</Text>
                                            <View style={styles.inputRow}>
                                                <TextInput
                                                    value={wlToDate}
                                                    onChangeText={(t) => {
                                                        const next = formatDdMmYyyy(t);
                                                        setWlToDate(next);
                                                        onWaterloggingToChange?.(partsToIso(next, wlToTime));
                                                    }}
                                                    placeholder="DD/MM/YYYY"
                                                    keyboardType="number-pad"
                                                    autoCapitalize="none"
                                                    autoCorrect={false}
                                                    maxLength={10}
                                                    style={[styles.textInput, styles.dateInput]}
                                                />
                                                <TextInput
                                                    value={wlToTime}
                                                    onChangeText={(t) => {
                                                        const next = formatHhMm(t);
                                                        setWlToTime(next);
                                                        onWaterloggingToChange?.(partsToIso(wlToDate, next));
                                                    }}
                                                    placeholder="HH:MM"
                                                    keyboardType="number-pad"
                                                    autoCapitalize="none"
                                                    autoCorrect={false}
                                                    maxLength={5}
                                                    style={[styles.textInput, styles.timeInput]}
                                                />
                                            </View>
                                        </View>

                                        {typeof onWaterloggingTest === 'function' && (
                                            <View style={styles.pillsRow}>
                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                    style={[styles.pill, styles.pillSelected]}
                                                    onPress={() => onWaterloggingTest(partsToIso(wlFromDate, wlFromTime), partsToIso(wlToDate, wlToTime))}
                                                >
                                                    <Text style={[styles.pillText, styles.pillTextSelected]}>Test</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        <Text style={styles.sectionHint}>Enter Date + Time. Example: 15/12/2024 and 10:00</Text>
                                    </>
                                )}
                            </>
                        )}

                        {showOverall && typeof onOverallAtChange === 'function' && (
                            <>
                                <View style={styles.divider} />
                                <Text style={styles.sectionTitle}>Overall risk time</Text>

                                <View style={styles.inputBlock}>
                                    <Text style={styles.inputLabel}>At</Text>
                                    <TouchableOpacity activeOpacity={0.85} style={styles.textInput} onPress={() => setOverallPickerVisible(true)}>
                                        <Text style={{ color: '#202124' }} numberOfLines={1}>{currentOverallLabel}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.pillsRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={[styles.pill, overallUseCustom && styles.pillSelected]}
                                        onPress={() => setOverallUseCustom((p) => !p)}
                                    >
                                        <Text style={[styles.pillText, overallUseCustom && styles.pillTextSelected]}>Custom</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={[styles.pill, styles.pillSelected]}
                                        onPress={() => onOverallTest?.()}
                                    >
                                        <Text style={[styles.pillText, styles.pillTextSelected]}>Test</Text>
                                    </TouchableOpacity>
                                </View>

                                {overallUseCustom && (
                                    <View style={styles.inputBlock}>
                                        <TextInput
                                            value={overallAt}
                                            onChangeText={(t) => onOverallAtChange?.(t)}
                                            placeholder="YYYY-MM-DDTHH:mm:ss+05:30"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            style={styles.textInput}
                                        />
                                    </View>
                                )}

                                {Array.isArray(overallTestHistory) && overallTestHistory.length > 0 && (
                                    <>
                                        <Text style={styles.sectionTitle}>Test timeline</Text>
                                        <View style={{ maxHeight: 140 }}>
                                            <ScrollView>
                                                {overallTestHistory.slice(0, 10).map((h: any, idx: number) => (
                                                    <Text key={`ot-${idx}`} style={styles.sectionHint}>
                                                        {String(h.testedAt)} → {Number(h.riskScore).toFixed(3)} ({String(h.riskLevel)}){typeof h.rainfallRaw === 'number' ? ` rain=${Number(h.rainfallRaw).toFixed(2)}` : ''}
                                                    </Text>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </>
                                )}

                                <Modal
                                    animationType="fade"
                                    transparent={true}
                                    visible={overallPickerVisible}
                                    onRequestClose={() => setOverallPickerVisible(false)}
                                >
                                    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOverallPickerVisible(false)}>
                                        <TouchableWithoutFeedback>
                                            <View style={[styles.sheet, { marginHorizontal: 16, marginBottom: 120 }]}>
                                                <View style={styles.header}>
                                                    <Text style={styles.title}>Pick a time</Text>
                                                    <TouchableOpacity onPress={() => setOverallPickerVisible(false)}>
                                                        <MaterialIcons name="close" size={24} color="#5f6368" />
                                                    </TouchableOpacity>
                                                </View>

                                                {resolvedOverallOptions.map((o) => {
                                                    const selected = String(o.value) === String(overallAt);
                                                    return (
                                                        <TouchableOpacity
                                                            key={`opt-${o.label}-${o.value}`}
                                                            activeOpacity={0.8}
                                                            style={[styles.pill, selected && styles.pillSelected]}
                                                            onPress={() => {
                                                                onOverallAtChange?.(String(o.value));
                                                                setOverallPickerVisible(false);
                                                            }}
                                                        >
                                                            <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{o.label}</Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </TouchableOpacity>
                                </Modal>
                            </>
                        )}
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
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#202124',
        marginBottom: 12,
    },
    sectionHint: {
        fontSize: 12,
        color: '#70757a',
        marginTop: 10,
    },
    pillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    inputBlock: {
        marginTop: 12,
    },
    inputLabel: {
        fontSize: 12,
        color: '#5f6368',
        fontWeight: '600',
        marginBottom: 6,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    dateInput: {
        flex: 1,
    },
    timeInput: {
        width: 110,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#e8eaed',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#202124',
        backgroundColor: 'white',
    },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#e8eaed',
        backgroundColor: 'white',
        marginRight: 8,
        marginBottom: 8,
    },
    pillSelected: {
        borderColor: '#1A73E8',
        backgroundColor: '#e8f0fe',
    },
    pillText: {
        fontSize: 12,
        color: '#5f6368',
        fontWeight: '600',
    },
    pillTextSelected: {
        color: '#1A73E8',
    },
});
