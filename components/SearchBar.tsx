import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Place } from '../data/kolkataPlaces';

interface SearchBarProps {
    onLocationSelect: (place: Place) => void;
    userLocation: Location.LocationObject | null;
}

export default function SearchBar({ onLocationSelect, userLocation }: SearchBarProps) {
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Place[]>([]);
    const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
    const debounceTimer = React.useRef<any>(null);

    // Weather Fetching Logic
    useEffect(() => {
        if (userLocation) {
            fetchWeather(userLocation.coords.latitude, userLocation.coords.longitude);
        }
    }, [userLocation]);

    const fetchWeather = async (lat: number, lon: number) => {
        try {
            // using open-meteo for free weather data
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
            );
            const data = await response.json();
            if (data.current_weather) {
                setWeather({
                    temp: data.current_weather.temperature,
                    code: data.current_weather.weathercode,
                });
            }
        } catch (error) {
            console.error("Weather fetch failed", error);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getFormattedDate = () => {
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const getWeatherIcon = (code: number) => {
        // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
        if (code === 0) return 'sun'; // Clear sky
        if (code >= 1 && code <= 3) return 'cloud'; // Partly cloudy
        if (code >= 45 && code <= 48) return 'menu'; // Fog (using menu as simplified fog/mist or cloud-drizzle) -> actually let's use cloud-drizzle or similar if available, or just cloud
        if (code >= 51 && code <= 67) return 'cloud-drizzle'; // Drizzle / Rain
        if (code >= 71 && code <= 77) return 'cloud-snow'; // Snow
        if (code >= 80 && code <= 82) return 'cloud-rain'; // Showers
        if (code >= 95) return 'cloud-lightning'; // Thunderstorm
        return 'sun';
    };

    const handleSearch = (text: string) => {
        setQuery(text);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (text.length > 2) {
            debounceTimer.current = setTimeout(async () => {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5`,
                        {
                            headers: {
                                'User-Agent': 'FreeMapApp/1.0'
                            }
                        }
                    );

                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                    const data = await response.json();

                    const mappedResults: Place[] = data.map((item: any) => ({
                        id: item.place_id ? item.place_id.toString() : Math.random().toString(),
                        name: item.display_name ? item.display_name.split(',')[0] : 'Unknown',
                        address: item.display_name || '',
                        latitude: parseFloat(item.lat),
                        longitude: parseFloat(item.lon),
                        category: 'Attraction'
                    }));
                    setResults(mappedResults);
                } catch (error) {
                    console.error("Search failed", error);
                }
            }, 500);
        } else {
            setResults([]);
        }
    };

    const handleSelect = (place: Place) => {
        setQuery(place.name);
        setResults([]);
        Keyboard.dismiss();
        onLocationSelect(place);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']}
                style={[StyleSheet.absoluteFill, { height: insets.top + 160 }]}
                pointerEvents="none"
            />
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.dateText}>{getFormattedDate()}</Text>
                    <Text style={styles.greetingText}>{getGreeting()}</Text>
                </View>
                {weather && (
                    <View style={styles.weatherContainer}>
                        <Feather name={getWeatherIcon(weather.code)} size={24} color="#5f6368" />
                        <Text style={styles.tempText}>{Math.round(weather.temp)}°</Text>
                    </View>
                )}
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="search" size={24} color="#5f6368" />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Search here"
                        placeholderTextColor="#5f6368"
                        value={query}
                        onChangeText={handleSearch}
                    />

                    <TouchableOpacity style={styles.profileButton} onPress={() => { setQuery(''); setResults([]); Keyboard.dismiss(); }}>
                        {query.length > 0 ? (
                            <MaterialIcons name="close" size={24} color="#5f6368" />
                        ) : (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>R</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {results.length > 0 && (
                <View style={styles.resultsList}>
                    <FlatList
                        data={results}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                                <View style={styles.resultIconContainer}>
                                    <Ionicons name="location-sharp" size={20} color="#5f6368" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.resultTitle}>{item.name}</Text>
                                    <Text style={styles.resultSubtitle}>{item.address}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        style={{ maxHeight: 400 }}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 10,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    dateText: {
        fontSize: 14,
        color: '#5f6368',
        fontWeight: '500',
        marginBottom: 4,
    },
    greetingText: {
        fontSize: 24,
        color: '#5f6368',
        fontWeight: 'bold',
    },
    weatherContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tempText: {
        fontSize: 16,
        color: '#5f6368',
        fontWeight: 'bold',
        marginTop: 2,
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 30,
        height: 50,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    menuButton: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#202124',
    },
    profileButton: {
        marginLeft: 10,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#8ab4f8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },

    resultsList: {
        marginHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginTop: 4,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    resultIconContainer: {
        backgroundColor: '#f1f3f4',
        padding: 8,
        borderRadius: 20,
        marginRight: 16,
    },
    resultTitle: {
        fontSize: 16,
        color: '#202124',
        fontWeight: '500',
    },
    resultSubtitle: {
        fontSize: 13,
        color: '#70757a',
        marginTop: 2,
    },
});
