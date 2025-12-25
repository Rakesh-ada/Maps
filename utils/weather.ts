export interface WeatherData {
    temp: number;
    condition: string;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    city: string;
    feelsLike: number;
    tempMin: number;
    tempMax: number;
    dt: number;
}

export interface ForecastData {
    dt: number;
    temp: number;
    icon: string;
    condition: string;
}

export interface DailyForecast {
    date: string;
    day: string;
    minTemp: number;
    maxTemp: number;
    icon: string;
    condition: string;
    feelsLike: number;
}

const API_KEY = '5e37b2c89a8fe2e9d1c64a7a0a5269a1'; // Provided by User

export const fetchCurrentWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        console.log('Fetching Current Weather:', url);
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (data.cod !== 200) {
            console.error('Weather API Error:', data.message);
            return null;
        }

        return {
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            pressure: data.main.pressure,
            visibility: data.visibility / 1000, // Convert to km
            city: data.name,
            feelsLike: Math.round(data.main.feels_like),
            tempMin: Math.round(data.main.temp_min),
            tempMax: Math.round(data.main.temp_max),
            dt: data.dt,
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        return null;
    }
};

export const fetchHourlyForecast = async (lat: number, lon: number): Promise<ForecastData[]> => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        console.log('Fetching Hourly Forecast:', url);
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (data.cod !== '200') {
            return [];
        }

        // Return first 8 items (24 hours approx) for horizontal scroll
        return data.list.slice(0, 5).map((item: any) => ({
            dt: item.dt,
            temp: Math.round(item.main.temp),
            icon: item.weather[0].icon,
            condition: item.weather[0].main,
        }));
    } catch (error) {
        console.error('Error fetching hourly forecast:', error);
        return [];
    }
};

export const fetchDailyForecast = async (lat: number, lon: number): Promise<DailyForecast[]> => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        console.log('Fetching Daily Forecast:', url);
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (data.cod !== '200') {
            return [];
        }

        // Process logic to find daily min/max
        const dailyMap: { [key: string]: { min: number, max: number, icon: string, condition: string, dt: number, feelsLike: number } } = {};

        data.list.forEach((item: any) => {
            const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
            if (!dailyMap[date]) {
                dailyMap[date] = {
                    min: item.main.temp_min,
                    max: item.main.temp_max,
                    icon: item.weather[0].icon,
                    condition: item.weather[0].main,
                    dt: item.dt,
                    feelsLike: item.main.feels_like
                };
            } else {
                dailyMap[date].min = Math.min(dailyMap[date].min, item.main.temp_min);
                dailyMap[date].max = Math.max(dailyMap[date].max, item.main.temp_max);
                // Try to pick icon from mid-day
                if (item.dt_txt.includes('12:00:00')) {
                    dailyMap[date].icon = item.weather[0].icon;
                    dailyMap[date].condition = item.weather[0].main;
                    dailyMap[date].feelsLike = item.main.feels_like; // Update feels like to mid-day
                }
            }
        });

        // Convert map to array and take next 5 days
        return Object.keys(dailyMap).map(date => {
            const d = new Date(date);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
            return {
                date: date,
                day: dayName,
                minTemp: Math.round(dailyMap[date].min),
                maxTemp: Math.round(dailyMap[date].max),
                icon: dailyMap[date].icon,
                condition: dailyMap[date].condition,
                feelsLike: Math.round(dailyMap[date].feelsLike)
            };
        }).slice(0, 5); // Limit to 5 days

    } catch (error) {
        console.error('Error fetching daily forecast:', error);
        return [];
    }
};
