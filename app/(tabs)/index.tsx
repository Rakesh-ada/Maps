import KolkataMap from '@/components/KolkataMap';
import MapControls from '@/components/MapControls';
import PlaceDetailSheet from '@/components/PlaceDetailSheet';
import RouteInfoSheet from '@/components/RouteInfoSheet';
import SearchBar from '@/components/SearchBar';
import StepBanner from '@/components/StepBanner';
import { Place } from '@/data/kolkataPlaces';
import { reverseGeocode, searchNominatimByViewbox } from '@/services/api/nominatim';
import { getSavedPlaces, removePlace, savePlace } from '@/services/storage/placesStore';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { MapType, Region } from 'react-native-maps';
import { getRoute } from '../../services/api/openRouteService';

import MapLayersSheet from '@/components/MapLayersSheet';

// Helper for distance
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d * 1000;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default function HomeScreen() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapType, setMapType] = useState<MapType>('standard');
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);

  // Navigation State
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number; steps?: any[] } | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentStepDistance, setCurrentStepDistance] = useState(0);

  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [heading, setHeading] = useState(0);
  const [isCentered, setIsCentered] = useState(false);
  const [isCompassMode, setIsCompassMode] = useState(false);
  const [isNavigationStarted, setIsNavigationStarted] = useState(false);

  // Layers State
  const [isLayersSheetVisible, setIsLayersSheetVisible] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showRoadCondition, setShowRoadCondition] = useState(false);
  const [showWaterlogging, setShowWaterlogging] = useState(false);
  const [showOverall, setShowOverall] = useState(false);

  const [travelMode, setTravelMode] = useState<'driving' | 'walking'>('driving');

  const selectedPlaceRef = useRef<Place | null>(null);
  const travelModeRef = useRef<'driving' | 'walking'>('driving');
  const isReroutingRef = useRef(false);
  const userLocationRef = useRef<Location.LocationObject | null>(null);
  const isCompassModeRef = useRef(false);
  const routeInfoRef = useRef<{ distance: number; duration: number; steps?: any[] } | null>(null);
  const currentStepIndexRef = useRef(0);

  // Sync refs for use in potential closures/intervals if needed, 
  // though watcher callback usually captures fresh state if defined inside useEffect with deps,
  // but Location.watchPositionAsync callback might be tricky. Using refs is safer.
  useEffect(() => {
    routeInfoRef.current = routeInfo;
  }, [routeInfo]);

  const routeCoordinatesRef = useRef<{ latitude: number; longitude: number }[]>([]);
  useEffect(() => {
    routeCoordinatesRef.current = routeCoordinates;
  }, [routeCoordinates]);

  useEffect(() => {
    currentStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  useEffect(() => {
    isCompassModeRef.current = isCompassMode;
  }, [isCompassMode]);

  useEffect(() => {
    selectedPlaceRef.current = selectedPlace;
  }, [selectedPlace]);

  useEffect(() => {
    travelModeRef.current = travelMode;
  }, [travelMode]);

  useEffect(() => {
    getSavedPlaces().then(setSavedPlaces);
  }, []);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let headingSubscription: Location.LocationSubscription | null = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      // Initial Location
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

      // Live Position Updates
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5, // Update every 5 meters
        },
        (newLocation) => {
          setUserLocation(newLocation);

          // Navigation Logic
          if (routeInfoRef.current && routeInfoRef.current.steps) {
            const steps = routeInfoRef.current.steps;
            const currentIndex = currentStepIndexRef.current;

            if (currentIndex < steps.length) {
              const currentStep = steps[currentIndex];
              // Note: OSRM steps don't always give end coordinates explicitly in the step object easily 
              // depending on format used in openRouteService.ts. 
              // But maneuver.location is usually the START of the step.
              // So we target the maneuver location of the NEXT step as the destination of THIS step.

              let targetLat, targetLon;

              if (currentIndex + 1 < steps.length) {
                // Target is start of next step
                const nextStep = steps[currentIndex + 1];
                // maneuver.location is [lon, lat]
                targetLat = nextStep.maneuver.location[1];
                targetLon = nextStep.maneuver.location[0];
              } else {
                // Last step? Target is route destination. 
                // For now, simpler: use current step geometry if we had it, or just 0 distance if done.
                // Let's assume last step is "Arrive".
                targetLat = currentStep.maneuver.location[1];
                targetLon = currentStep.maneuver.location[0];
              }

              if (targetLat && targetLon) {
                const dist = getDistanceFromLatLonInMeters(
                  newLocation.coords.latitude,
                  newLocation.coords.longitude,
                  targetLat,
                  targetLon
                );

                setCurrentStepDistance(dist);

                // Auto-advance if within 30 meters
                if (dist < 30 && currentIndex + 1 < steps.length) {
                  setCurrentStepIndex(currentIndex + 1);
                }
              }

              // Polyline Slicing (Shrink Line)
              if (routeCoordinatesRef.current.length > 0) {
                // Find closest point on polyline to user
                // Optimization: Search only first 50 points to avoid perf hit? 
                // Or just simple scan.
                let minDistance = Infinity;
                let closestIndex = -1;

                // Only scan a subset to prevent lag on long routes
                const pointsToScan = Math.min(routeCoordinatesRef.current.length, 50);

                for (let i = 0; i < pointsToScan; i++) {
                  const p = routeCoordinatesRef.current[i];
                  const d = getDistanceFromLatLonInMeters(
                    newLocation.coords.latitude,
                    newLocation.coords.longitude,
                    p.latitude,
                    p.longitude
                  );
                  if (d < minDistance) {
                    minDistance = d;
                    closestIndex = i;
                  }
                }

                if (closestIndex > 0 && minDistance < 100) {
                  // Slice!
                  const sliced = routeCoordinatesRef.current.slice(closestIndex);
                  setRouteCoordinates(sliced);
                } else if (minDistance > 50 && !isReroutingRef.current && closestIndex === -1 && selectedPlaceRef.current) {
                  // REROUTE LOGIC: OFF ROUTE (>50m away)
                  // trigger a silent reroute
                  isReroutingRef.current = true;
                  console.log("Rerouting...");

                  // Use local scope variables to avoid stale closures if possible but we use refs for inputs
                  // We'll call the service directly
                  const destination = selectedPlaceRef.current;
                  const mode = travelModeRef.current;

                  getRoute(
                    { latitude: newLocation.coords.latitude, longitude: newLocation.coords.longitude },
                    { latitude: destination.latitude, longitude: destination.longitude },
                    mode
                  ).then((newRoute: any) => {
                    if (newRoute) {
                      // Enhance steps again logic duplicated from fetchRoute - ideal to refactor but inline for now
                      const enhancedSteps = newRoute.steps.map((step: any) => {
                        const type = step.maneuver?.type;
                        const modifier = step.maneuver?.modifier;
                        const roadName = step.name;

                        let text = `${type} ${modifier || ''}`.trim();
                        if (roadName) text += ` onto ${roadName}`;
                        text = text.charAt(0).toUpperCase() + text.slice(1);
                        return { ...step, instruction: text || 'Continue' };
                      });

                      setRouteCoordinates(newRoute.coordinates);
                      setRouteInfo({
                        distance: newRoute.distance,
                        duration: newRoute.duration,
                        steps: enhancedSteps
                      });
                      // Reset step index to 0 for new route
                      setCurrentStepIndex(0);
                      setCurrentStepDistance(enhancedSteps[0]?.distance || 0);
                    }
                  }).catch((err: any) => {
                    console.log("Reroute failed", err);
                  }).finally(() => {
                    isReroutingRef.current = false;
                  });
                }
              }
            }
          }

          // Camera Follow
          if (isCompassModeRef.current && mapRef.current) {
            // We use heading watcher for rotation, but we need to keep center updated too
            // Actually, usually we want smooth animation. 
            // Let's rely on mapRef.current.animateCamera being called here or in heading watcher?
            // Calling it in both might conflict. 
            // Standard practice: Update "center" here.
            mapRef.current.animateCamera({
              center: newLocation.coords,
            }, { duration: 500 });
          }
        }
      );

      // Live Heading Updates
      headingSubscription = await Location.watchHeadingAsync((obj) => {
        setHeading(obj.magHeading);
        if (isCompassModeRef.current && mapRef.current && userLocationRef.current) {
          mapRef.current.animateCamera({
            heading: obj.magHeading,
            // center: userLocationRef.current.coords, // Updating center here too can be jerky if location is old
            pitch: 50,
          }, { duration: 500 });
        }
      });
    })();

    return () => {
      locationSubscription?.remove();
      headingSubscription?.remove();
    };
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
      const viewbox = `${minLon},${maxLat},${maxLon},${minLat}`;
      const data = await searchNominatimByViewbox('restaurant|cafe|hotel', viewbox);

      const newPlaces: Place[] = data.map((item) => ({
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
      // Use generalized route service (wraps OSRM/OSM logic)
      const routeData = await getRoute(
        { latitude: startLat, longitude: startLon },
        { latitude: endLat, longitude: endLon },
        mode
      );

      if (routeData) {
        setRouteCoordinates(routeData.coordinates);

        // Enhance steps with instruction text for UI
        const enhancedSteps = routeData.steps.map((step: any) => {
          const type = step.maneuver?.type;
          const modifier = step.maneuver?.modifier;
          const roadName = step.name;

          let text = `${type} ${modifier || ''}`.trim();
          if (roadName) text += ` onto ${roadName}`;

          // Capitalize first letter
          text = text.charAt(0).toUpperCase() + text.slice(1);

          return {
            ...step,
            instruction: text || 'Continue',
          };
        });

        setRouteInfo({
          distance: routeData.distance,
          duration: routeData.duration,
          steps: enhancedSteps,
        });
        setCurrentStepIndex(0);
        setCurrentStepDistance(enhancedSteps[0]?.distance || 0);

        if (mapRef.current) {
          mapRef.current.fitToCoordinates(routeData.coordinates, {
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
      // Reset step
      setCurrentStepIndex(0);

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
      // Use service for reverse geocoding
      const data = await reverseGeocode(poi.coordinate.latitude, poi.coordinate.longitude);

      if (!data) throw new Error("POI fetch returned null");

      // Clean the name: Remove secondary language (often separated by newline or parens)
      const cleanPlaceName = (originalName: string) => {
        if (!originalName) return originalName;
        // Split by newline and take the first line (often English)
        let name = originalName.split('\n')[0];
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
      const data = await reverseGeocode(coordinate.latitude, coordinate.longitude);

      if (!data) throw new Error("Reverse geocode returned null");

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

  const currentStep = routeInfo?.steps ? routeInfo.steps[currentStepIndex] : null;
  const nextStep = routeInfo?.steps ? routeInfo.steps[currentStepIndex + 1] : null;



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
          instruction={currentStep?.instruction || "Arrived"}
          distance={currentStepDistance}
          nextInstruction={nextStep?.instruction}
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


