import KolkataMap from '@/components/KolkataMap';
import MapControls from '@/components/MapControls';
import PlaceDetailSheet from '@/components/PlaceDetailSheet';
import RouteInfoSheet from '@/components/RouteInfoSheet';
import SearchBar from '@/components/SearchBar';
import StepBanner from '@/components/StepBanner';
import { Place } from '@/data/kolkataPlaces';
import { getSavedPlaces, removePlace, savePlace } from '@/services/storage';
import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { MapType, Region } from 'react-native-maps';

import MapLayersSheet from '@/components/MapLayersSheet';

export default function HomeScreen() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapType, setMapType] = useState<MapType>('standard');
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number; steps?: any[] } | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [heading, setHeading] = useState(0);
  const [isCentered, setIsCentered] = useState(false);
  const [isCompassMode, setIsCompassMode] = useState(false);
  const [isNavigationStarted, setIsNavigationStarted] = useState(false);

  // Layers State
  // Layers State
  const [isLayersSheetVisible, setIsLayersSheetVisible] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showRoadCondition, setShowRoadCondition] = useState(false);
  const [showWaterlogging, setShowWaterlogging] = useState(false);
  const [showOverall, setShowOverall] = useState(false);

  const userLocationRef = useRef<Location.LocationObject | null>(null);
  const isCompassModeRef = useRef(false);

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  useEffect(() => {
    isCompassModeRef.current = isCompassMode;
  }, [isCompassMode]);

  useEffect(() => {
    getSavedPlaces().then(setSavedPlaces);
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      if (mapRef.current) {
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        mapRef.current.animateToRegion(newRegion, 1000);
      }

      await Location.watchHeadingAsync((obj) => {
        setHeading(obj.magHeading);
        if (isCompassModeRef.current && mapRef.current && userLocationRef.current) {
          mapRef.current.animateCamera({
            heading: obj.magHeading,
            center: userLocationRef.current.coords,
            pitch: 0,
          }, { duration: 500 });
        }
      });
    })();
  }, []);

  const onRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    if (userLocation) {
      const latDiff = Math.abs(newRegion.latitude - userLocation.coords.latitude);
      const lonDiff = Math.abs(newRegion.longitude - userLocation.coords.longitude);
      // If map center is within ~10 meters of user location, consider it centered
      if (latDiff < 0.0001 && lonDiff < 0.0001) {
        setIsCentered(true);
      } else {
        setIsCentered(false);
        if (isCompassMode) {
          setIsCompassMode(false);
        }
      }
    }
  };

  const onSearchArea = async () => {
    if (!region) return;
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    const minLat = latitude - latitudeDelta / 2;
    const maxLat = latitude + latitudeDelta / 2;
    const minLon = longitude - longitudeDelta / 2;
    const maxLon = longitude + longitudeDelta / 2;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=restaurant|cafe|hotel&format=json&limit=20&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1`,
        {
          headers: {
            'User-Agent': 'FreeMapApp/1.0'
          }
        }
      );
      const data = await response.json();
      const newPlaces: Place[] = data.map((item: any) => ({
        id: item.place_id ? item.place_id.toString() : Math.random().toString(),
        name: item.display_name ? item.display_name.split(',')[0] : 'Unknown',
        address: item.display_name || '',
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        category: item.type || 'Place'
      }));
      setPlaces(newPlaces);
    } catch (error) {
      console.error(error);
    }
  };

  // Travel Mode State
  const [travelMode, setTravelMode] = useState<'driving' | 'walking'>('driving');

  const fetchRoute = async (mode: 'driving' | 'walking') => {
    if (!selectedPlace) return;

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    let location = await Location.getCurrentPositionAsync({});

    const startLat = location.coords.latitude;
    const startLon = location.coords.longitude;
    const endLat = selectedPlace.latitude;
    const endLon = selectedPlace.longitude;

    try {
      // Use different endpoints for different modes
      // router.project-osrm.org demo server ONLY supports driving.
      // routing.openstreetmap.de supports foot.
      let url = '';
      if (mode === 'walking') {
        url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=polyline&steps=true`;
      } else {
        url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=polyline&steps=true`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const points = polyline.decode(route.geometry);
        const coords = points.map((point: any) => ({ latitude: point[0], longitude: point[1] }));
        setRouteCoordinates(coords);

        // Extract route information
        const steps = route.legs?.[0]?.steps?.map((step: any) => ({
          instruction: step.maneuver?.modifier ? `${step.maneuver.modifier} ${step.maneuver.type}` : step.maneuver?.type || 'Continue',
          distance: step.distance,
          duration: step.duration,
        })) || [];

        setRouteInfo({
          distance: route.distance,
          duration: route.duration,
          steps,
        });

        if (mapRef.current) {
          mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 50, right: 50, bottom: 250, left: 50 },
            animated: true,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onNavigate = () => {
    // Default to current mode (usually driving initially)
    fetchRoute(travelMode);
  };

  const onTravelModeChange = (mode: 'driving' | 'walking') => {
    setTravelMode(mode);
    fetchRoute(mode);
  };

  const startNavigation = () => {
    if (mapRef.current && userLocation) {
      setIsNavigationStarted(true);
      setIsCompassMode(true);
      mapRef.current.animateCamera({
        center: userLocation.coords,
        zoom: 18,
        pitch: 50,
        heading: heading,
      }, { duration: 1000 });
    }
  };

  const onToggleSave = async () => {
    if (!selectedPlace) return;
    const isSaved = savedPlaces.some(p => p.id === selectedPlace.id);
    if (isSaved) {
      const updated = await removePlace(selectedPlace.id);
      setSavedPlaces(updated);
    } else {
      const updated = await savePlace(selectedPlace);
      setSavedPlaces(updated);
    }
  };

  const onRecenter = async () => {
    // Only clear selection if NOT navigating
    if (!isNavigationStarted && !routeInfo) {
      setSelectedPlace(null);
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location);

    if (mapRef.current) {
      if (isNavigationStarted) {
        // If navigating, just re-snap to camera mode
        setIsCompassMode(true);
        mapRef.current.animateCamera({
          center: location.coords,
          zoom: 18,
          pitch: 50,
          heading: heading,
        }, { duration: 1000 });
        setIsCentered(true);
        return;
      }

      if (!isCentered) {
        // First click: Just center, North Up
        setIsCompassMode(false);
        mapRef.current.animateCamera({
          center: location.coords,
          heading: 0,
          pitch: 0,
          zoom: 15
        });
      } else if (!isCompassMode) {
        // Second click: Compass Mode
        setIsCompassMode(true);
        // Animation will be handled by watcher
      } else {
        // Third click: Back to North Up
        setIsCompassMode(false);
        mapRef.current.animateCamera({
          center: location.coords,
          heading: 0,
          pitch: 0,
          zoom: 15
        });
      }
    }
  }




  const onPoiClick = async (poi: { placeId: string; name: string; coordinate: { latitude: number; longitude: number } }) => {
    if (isNavigationStarted || routeInfo) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${poi.coordinate.latitude}&lon=${poi.coordinate.longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'FreeMapApp/1.0'
          }
        }
      );
      const data = await response.json();

      // Clean the name: Remove secondary language (often separated by newline or parens)
      const cleanPlaceName = (originalName: string) => {
        if (!originalName) return originalName;
        // Split by newline and take the first line (often English)
        let name = originalName.split('\n')[0];
        // Optionally remove text within parens if it looks like a translation (e.g. "Name (Local)")
        // name = name.replace(/\s*\(.*?\)\s*/g, ''); 
        return name.trim();
      };

      const place: Place = {
        id: poi.placeId,
        name: cleanPlaceName(poi.name), // Clean the name
        address: data.display_name || 'Address not available',
        latitude: poi.coordinate.latitude,
        longitude: poi.coordinate.longitude,
        category: 'Point of Interest'
      };
      setSelectedPlace(place);
    } catch (error) {
      console.error("POI address fetch failed", error);
      setSelectedPlace({
        id: poi.placeId,
        name: poi.name.split('\n')[0].trim(),
        address: `${poi.coordinate.latitude.toFixed(5)}, ${poi.coordinate.longitude.toFixed(5)}`,
        latitude: poi.coordinate.latitude,
        longitude: poi.coordinate.longitude,
        category: 'Point of Interest'
      });
    }
  };

  const onMapPress = async (coordinate: { latitude: number; longitude: number }) => {
    // If navigation is active, ignore map taps for selection
    if (isNavigationStarted || routeInfo) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinate.latitude}&lon=${coordinate.longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'FreeMapApp/1.0'
          }
        }
      );
      const data = await response.json();

      let name = 'Dropped Pin';
      if (data.address) {
        // Prioritize meaningful names
        name = data.address.amenity ||
          data.address.shop ||
          data.address.tourism ||
          data.address.leisure ||
          data.address.building ||
          data.address.office ||
          (data.address.road ? `${data.address.road}` : null) ||
          (data.address.suburb ? `Near ${data.address.suburb}` : null) ||
          (data.address.city ? `Near ${data.address.city}` : 'Dropped Pin');
      } else if (data.display_name) {
        name = data.display_name.split(',')[0];
      }

      const place: Place = {
        id: data.place_id ? data.place_id.toString() : Math.random().toString(),
        name: name,
        address: data.display_name || '',
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        category: 'Location'
      };

      setSelectedPlace(place);
    } catch (error) {
      console.error("Reverse geocoding failed", error);
      // Fallback if network fails
      setSelectedPlace({
        id: Math.random().toString(),
        name: 'Dropped Pin',
        address: `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        category: 'Location'
      });
    }
  };

  return (
    <View style={styles.container}>
      <KolkataMap
        selectedPlace={selectedPlace}
        places={places}
        savedPlaces={savedPlaces}
        mapRef={mapRef}
        mapType={mapType}
        onRegionChangeComplete={onRegionChangeComplete}
        routeCoordinates={routeCoordinates}
        onPlaceSelect={setSelectedPlace}
        onMapPress={onMapPress}
        onPoiClick={onPoiClick}
        isUserLocationCentered={isCentered}
        showsTraffic={showTraffic}
        showRoadCondition={showRoadCondition}
        showWaterlogging={showWaterlogging}
        showOverall={showOverall}
      />

      {!routeInfo ? (
        <SearchBar onLocationSelect={setSelectedPlace} userLocation={userLocation} />
      ) : isNavigationStarted ? (
        <StepBanner
          instruction={routeInfo.steps?.[0]?.instruction || "Continue on route"}
          distance={routeInfo.steps?.[0]?.distance || 0}
          onExit={() => { setRouteInfo(null); setRouteCoordinates([]); setIsNavigationStarted(false); }}
        />
      ) : null}

      <MapControls
        onOpenLayers={() => setIsLayersSheetVisible(true)}
        onRecenter={onRecenter}
        isUserLocationCentered={isCentered}
        onNavigate={selectedPlace && !routeInfo ? onNavigate : undefined}
        heading={heading}
        isCompassMode={isCompassMode}
        showLayers={!routeInfo}
        isNavigation={isNavigationStarted}
      />

      {!isNavigationStarted && (
        <RouteInfoSheet
          routeInfo={routeInfo}
          onClose={() => { setRouteInfo(null); setRouteCoordinates([]); }}
          onStartNavigation={startNavigation}
          travelMode={travelMode}
          onModeChange={onTravelModeChange}
        />
      )}

      {selectedPlace && !routeInfo && !isNavigationStarted && (
        <PlaceDetailSheet
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onNavigate={onNavigate}
        />
      )}

      <MapLayersSheet
        visible={isLayersSheetVisible}
        onClose={() => setIsLayersSheetVisible(false)}
        mapType={mapType}
        onMapTypeChange={setMapType}
        showTraffic={showTraffic}
        onToggleTraffic={() => setShowTraffic(prev => !prev)}
        showRoadCondition={showRoadCondition}
        onToggleRoadCondition={() => setShowRoadCondition(prev => !prev)}
        showWaterlogging={showWaterlogging}
        onToggleWaterlogging={() => setShowWaterlogging(prev => !prev)}
        showOverall={showOverall}
        onToggleOverall={() => setShowOverall(prev => !prev)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchAreaBtn: {
    position: 'absolute',
    top: 130,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchAreaText: {
    fontWeight: 'bold',
    color: '#1f1f1f',
  },
  actionButtons: {
    position: 'absolute',
    top: 130,
    alignSelf: 'center',
    flexDirection: 'row',
    zIndex: 10,
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: 'white'
  },
  actionBtnText: {
    fontWeight: 'bold',
  }
});


