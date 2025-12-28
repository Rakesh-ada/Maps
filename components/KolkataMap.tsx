import { Place } from '@/data/kolkataPlaces';
import { customMapStyle } from '@/data/mapStyles';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { MapType, Marker, Overlay, Polyline, Region } from 'react-native-maps';

const KOLKATA_REGION = {
    latitude: 22.5726,
    longitude: 88.3639,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

interface KolkataMapProps {
    selectedPlace: Place | null;
    places?: Place[];
    savedPlaces?: Place[];
    floodAlerts?: any[];
    waterloggingOverlay?: {
        imageUrl: string;
        bounds: [[number, number], [number, number]];
    } | null;
    overallOverlay?: {
        imageUrl: string;
        bounds: [[number, number], [number, number]];
    } | null;
    mapRef: React.RefObject<MapView | null>;
    mapType: MapType;
    onRegionChangeComplete?: (region: Region, details?: { isGesture?: boolean }) => void;
    routeCoordinates?: { latitude: number; longitude: number }[];
    onPlaceSelect?: (place: Place) => void;
    onMapPress?: (coordinate: { latitude: number; longitude: number }) => void;
    onPoiClick?: (poi: { placeId: string; name: string; coordinate: { latitude: number; longitude: number } }) => void;
    isUserLocationCentered?: boolean;
    showsTraffic?: boolean;
    showRoadCondition?: boolean;
    showWaterlogging?: boolean;
    showOverall?: boolean;
}

export default function KolkataMap({ selectedPlace, places = [], savedPlaces = [], floodAlerts = [], waterloggingOverlay = null, overallOverlay = null, mapRef, mapType, onRegionChangeComplete, routeCoordinates = [], onPlaceSelect, onMapPress, onPoiClick, isUserLocationCentered, showsTraffic = false, showRoadCondition = false, showWaterlogging = false, showOverall = false }: KolkataMapProps) {
    useEffect(() => {
        if (selectedPlace && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: selectedPlace.latitude,
                longitude: selectedPlace.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    }, [selectedPlace]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={KOLKATA_REGION}
                provider={undefined}
                mapType={mapType}
                customMapStyle={mapType === 'standard' ? customMapStyle : []}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
                rotateEnabled={!isUserLocationCentered}
                onRegionChangeComplete={onRegionChangeComplete}
                showsTraffic={showsTraffic}
                userInterfaceStyle="light"
                onPress={(e) => {
                    // Simplified: Just pass the coordinate. relying on marker handling to stop prop if needed,
                    // or just accepting that tapping near a marker might trigger this too.
                    onMapPress?.(e.nativeEvent.coordinate);
                }}
                onPoiClick={(e) => {
                    onPoiClick?.({
                        placeId: e.nativeEvent.placeId,
                        name: e.nativeEvent.name,
                        coordinate: e.nativeEvent.coordinate
                    });
                }}
            >
                {/* Only show custom tiles if we specifically wanted a custom map style, 
                    but for now, let's use the native map for standard to get POIs. 
                    If we strictly wanted the 'clean' look we had, we would use mapType='none' + UrlTile.
                    For authentic Google Maps feel, we should use mapType='standard' (which is default) and NO UrlTile. */}
                {/* <UrlTile
                    urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                    maximumZ={20}
                    flipY={false}
                    tileSize={256}
                    zIndex={1}
                /> */}

                {showOverall && overallOverlay?.imageUrl && (
                    <Overlay
                        bounds={overallOverlay.bounds}
                        image={{ uri: overallOverlay.imageUrl }}
                    />
                )}

                {showWaterlogging && waterloggingOverlay?.imageUrl && (
                    <Overlay
                        bounds={waterloggingOverlay.bounds}
                        image={{ uri: waterloggingOverlay.imageUrl }}
                    />
                )}

                {showWaterlogging && floodAlerts.length > 0 &&
                    floodAlerts
                        .filter((a: any) => typeof a?.lat === 'number' && typeof a?.lon === 'number')
                        .map((alert: any, idx: number) => (
                            <Marker
                                key={`alert-${alert.id ?? idx}`}
                                coordinate={{ latitude: alert.lat, longitude: alert.lon }}
                                title={alert.severity_max ? `Flood Alert (sev ${alert.severity_max})` : 'Flood Alert'}
                                description={alert.message ?? 'Flood risk reported'}
                                pinColor="#1A73E8"
                                zIndex={20}
                            />
                        ))}

                {places.map((place) => (
                    <Marker
                        key={place.id}
                        coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                        title={place.name}
                        description={place.category}
                        pinColor="#EA4335"
                        onPress={() => onPlaceSelect?.(place)}
                    />
                ))}

                {savedPlaces.map((place) => (
                    <Marker
                        key={`saved - ${place.id} `}
                        coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                        title={place.name}
                        description="Saved Place"
                        pinColor="gold"
                        zIndex={10}
                    />
                ))}

                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeColor="#4285F4"
                        strokeWidth={4}
                        zIndex={100}
                    />
                )}



                {selectedPlace && (
                    <Marker
                        coordinate={{
                            latitude: selectedPlace.latitude,
                            longitude: selectedPlace.longitude
                        }}
                        title={selectedPlace.name}
                        description={selectedPlace.category}
                        pinColor="red"
                    />
                )}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        height: '110%',
        bottom: -20,
    },
});
