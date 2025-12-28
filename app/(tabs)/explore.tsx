import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { DailyForecast, fetchCurrentWeather, fetchDailyForecast, fetchHourlyForecast, ForecastData, WeatherData } from '../../utils/weather';

const { width } = Dimensions.get('window');

// Custom Icons
const ICONS = {
  wind: (color: string) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={color}>
      <Path d="M10.5 17H4V15H10.5C12.433 15 14 16.567 14 18.5C14 20.433 12.433 22 10.5 22C8.99957 22 7.71966 21.0559 7.22196 19.7293L9.09513 19.0268C9.30843 19.5954 9.85696 20 10.5 20C11.3284 20 12 19.3284 12 18.5C12 17.6716 11.3284 17 10.5 17ZM5 11H18.5C20.433 11 22 12.567 22 14.5C22 16.433 20.433 18 18.5 18C16.9996 18 15.7197 17.0559 15.222 15.7293L17.0951 15.0268C17.3084 15.5954 17.857 16 18.5 16C19.3284 16 20 15.3284 20 14.5C20 13.6716 19.3284 13 18.5 13H5C3.34315 13 2 11.6569 2 10C2 8.34315 3.34315 7 5 7H13.5C14.3284 7 15 6.32843 15 5.5C15 4.67157 14.3284 4 13.5 4C12.857 4 12.3084 4.40463 12.0951 4.97317L10.222 4.27073C10.7197 2.94414 11.9996 2 13.5 2C15.433 2 17 3.567 17 5.5C17 7.433 15.433 9 13.5 9H5C4.44772 9 4 9.44772 4 10C4 10.5523 4.44772 11 5 11Z" />
    </Svg>
  ),
  visibility: (color: string) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={color}>
      <Path d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z" />
    </Svg>
  ),
  pressure: (color: string) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM15.8329 7.33748C16.0697 7.17128 16.3916 7.19926 16.5962 7.40381C16.8002 7.60784 16.8267 7.92955 16.6587 8.16418C14.479 11.2095 13.2796 12.8417 13.0607 13.0607C12.4749 13.6464 11.5251 13.6464 10.9393 13.0607C10.3536 12.4749 10.3536 11.5251 10.9393 10.9393C11.3126 10.5661 12.9438 9.36549 15.8329 7.33748ZM17.5 11C18.0523 11 18.5 11.4477 18.5 12C18.5 12.5523 18.0523 13 17.5 13C16.9477 13 16.5 12.5523 16.5 12C16.5 11.4477 16.9477 11 17.5 11ZM6.5 11C7.05228 11 7.5 11.4477 7.5 12C7.5 12.5523 7.05228 13 6.5 13C5.94772 13 5.5 12.5523 5.5 12C5.5 11.4477 5.94772 11 6.5 11ZM8.81802 7.40381C9.20854 7.79433 9.20854 8.4275 8.81802 8.81802C8.4275 9.20854 7.79433 9.20854 7.40381 8.81802C7.01328 8.4275 7.01328 7.79433 7.40381 7.40381C7.79433 7.01328 8.4275 7.01328 8.81802 7.40381ZM12 5.5C12.5523 5.5 13 5.94772 13 6.5C13 7.05228 12.5523 7.5 12 7.5C11.4477 7.5 11 7.05228 11 6.5C11 5.94772 11.4477 5.5 12 5.5Z" />
    </Svg>
  ),
  humidity: (color: string) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 3.09735L7.05025 8.04709C4.31658 10.7808 4.31658 15.2129 7.05025 17.9466C9.78392 20.6803 14.2161 20.6803 16.9497 17.9466C19.6834 15.2129 19.6834 10.7808 16.9497 8.0471L12 3.09735ZM12 0.268921L18.364 6.63288C21.8787 10.1476 21.8787 15.8461 18.364 19.3608C14.8492 22.8755 9.15076 22.8755 5.63604 19.3608C2.12132 15.8461 2.12132 10.1476 5.63604 6.63288L12 0.268921ZM12 17.9968V7.99684C14.7614 7.99684 17 10.2354 17 12.9968C17 15.7583 14.7614 17.9968 12 17.9968Z" />
    </Svg>
  )
};

// Formatting helpers
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { hour: 'numeric' }); // 1 PM format
};

// Module-level cache to persist data across tab switches
let cachedWeather: WeatherData | null = null;
let cachedForecast: ForecastData[] = [];
let cachedDaily: DailyForecast[] = [];

export default function WeatherScreen() {
  const [weather, setWeather] = useState<WeatherData | null>(cachedWeather);
  const [forecast, setForecast] = useState<ForecastData[]>(cachedForecast);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>(cachedDaily);
  const [loading, setLoading] = useState(!cachedWeather);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setErrorMsg(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const [currentData, hourlyData, dailyData] = await Promise.all([
        fetchCurrentWeather(latitude, longitude),
        fetchHourlyForecast(latitude, longitude),
        fetchDailyForecast(latitude, longitude)
      ]);

      if (!currentData) {
        setErrorMsg('Failed to load weather data');
        setLoading(false);
        return;
      }

      setWeather(currentData);
      setForecast(hourlyData);
      setDailyForecast(dailyData);

      // Update cache
      cachedWeather = currentData;
      cachedForecast = hourlyData;
      cachedDaily = dailyData;
    } catch (error) {
      const msg = error instanceof Error && error.message ? error.message : 'Failed to load weather data';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3fa2f7" />
      </View>
    );
  }

  if (errorMsg || !weather) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{errorMsg || 'Weather data unavailable'}</Text>
        <Text onPress={loadWeatherData} style={{ marginTop: 20, color: '#3fa2f7', fontSize: 16, fontWeight: 'bold' }}>
          Tap to Retry
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} bounces={true} showsVerticalScrollIndicator={false}>
      {/* Minimal Top Card */}
      <View style={styles.cardContainer}>
        <View style={styles.mainCard}>
          {/* Top Row: Location & Icon */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.cityName}>{weather.city}, IN</Text>
            </View>
            {/* Use Ionicons for main weather icon for now, unless user creates custom one. 
                 Or use the OpenWeatherMap icon as Image. 
                 User prompt says: "Sunny icon for now or dynamic? Let's use dynamic". 
                 Previous code used Ionicons 'sunny'. Let's stick to that or logic. 
                 Wait, previous code had Image commented out? No, line 46 has Ionicons. 
                 Let's stick to simple Ionicons for top right as placeholder or use weather.icon logic 
             */}
            <Ionicons name="sunny" size={24} color="#FDB813" />
          </View>

          {/* Temp Row */}
          <View style={styles.tempRow}>
            <Text style={styles.mainTemp}>{weather.temp}°</Text>
            <View style={styles.conditionContainer}>
              <Text style={styles.conditionText}>{weather.condition}</Text>
              <Text style={styles.highLowText}>H:{weather.tempMax}° L:{weather.tempMin}°</Text>
            </View>
          </View>

          {/* Forecast Row inside card */}
          <View style={styles.forecastRow}>
            <View style={styles.forecastContainer}>
              {forecast.map((item, index) => (
                <View key={item.dt} style={styles.forecastItem}>
                  <Text style={styles.forecastTimeText}>{formatTime(item.dt)}</Text>
                  <Image
                    source={{ uri: `https://openweathermap.org/img/wn/${item.icon}.png` }}
                    style={styles.forecastIconSmall}
                  />
                  <Text style={styles.forecastTempText}>{item.temp}°</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Details Section (Below card) */}
      <View style={styles.detailsSection}>
        <View style={styles.grid}>
          <DetailItem icon="humidity" label="Humidity" value={`${weather.humidity}%`} color="#4285F4" />
          <DetailItem icon="pressure" label="Pressure" value={`${weather.pressure} hPa`} color="#FBBC05" />
          <DetailItem icon="wind" label="Wind" value={`${weather.windSpeed} m/s`} color="#34A853" />
          <DetailItem icon="visibility" label="Visibility" value={`${weather.visibility} km`} color="#EA4335" />
        </View>
      </View>

      {/* Daily Forecast Section */}
      <View style={styles.dailySection}>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dailyScrollContent}>
          {dailyForecast.map((day, index) => {
            const cardColor = getCardColor(day.condition);
            return (
              <View key={index} style={[styles.dailyCard, { backgroundColor: cardColor, shadowColor: cardColor }]}>
                {/* Icon removed */}
                <Text style={styles.dailyCardTemp}>{day.maxTemp}°</Text>
                <View style={styles.feelsLikePill}>
                  <Text style={styles.feelsLikeText}>Feels like: {day.feelsLike}°</Text>
                </View>
                <Text style={styles.dailyCardDay}>{day.day}</Text>
                <Text style={styles.dailyCardCondition}>{day.condition}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const DetailItem = ({ icon, label, value, color }: { icon: keyof typeof ICONS, label: string, value: string, color: string }) => (
  <View style={styles.detailCard}>
    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
      {ICONS[icon](color)}
    </View>
    <Text style={styles.detailValue}>{value}</Text>
    <Text style={styles.detailLabel}>{label}</Text>
  </View>
);

const getCardColor = (condition: string) => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('clear')) return '#FFD166'; // Sunny/Gold
  if (lowerCondition.includes('cloud')) return '#48CAE4'; // Cloudy/Blue
  if (lowerCondition.includes('rain')) return '#5390D9'; // Rain/Darker Blue
  if (lowerCondition.includes('snow')) return '#ADE8F4'; // Snow/Light Blue
  if (lowerCondition.includes('thunder')) return '#485563'; // Storm/Grey
  return '#90E0EF'; // Default Light Blue
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 35,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#EA4335',
  },
  cardContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  mainCard: {
    backgroundColor: '#3fa2f7', // Similar light blue to reference image
    borderRadius: 30,
    padding: 24,
    paddingBottom: 16, // Space for forecast
    shadowColor: "#3fa2f7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align bottom of temp with text
    marginBottom: 30,
  },
  mainTemp: {
    fontSize: 72,
    fontWeight: '400', // Thinner font like in image
    color: 'white',
    lineHeight: 80,
  },
  conditionContainer: {
    marginLeft: 'auto', // Push to right
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  conditionText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    marginBottom: 4,
  },
  highLowText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  forecastRow: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  forecastItem: {
    alignItems: 'center',
    // margin removed to let space-between handle it
  },
  forecastTimeText: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
    fontWeight: '500',
  },
  forecastIconSmall: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  forecastTempText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  detailsSection: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailCard: {
    width: (width - 48) / 2,
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 18,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#202124',
  },
  detailLabel: {
    fontSize: 13,
    color: '#5f6368',
    marginTop: 3,
  },
  dailySection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  dailyScrollContent: {
    paddingHorizontal: 16,
  },
  dailyCard: {
    width: (width - 32 - 24) / 3, // (Screen Width - OuterPadding*2 - Gap*2) / 3 cards
    padding: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  dailyCardIcon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  dailyCardTemp: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  feelsLikePill: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  feelsLikeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  dailyCardDay: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  dailyCardCondition: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
});
