/**
 * Weather Data Service
 * 
 * Fetches weather data from APIs and generates synthetic data for demo.
 * Supports: OpenWeatherMap, IMD-style data
 */

import axios from 'axios';
import { config } from './config';

export interface WeatherDataPoint {
  date: Date;
  rainfallMm: number;
  temperatureC: number;
  humidity: number;
  soilMoisture: number;
  windSpeed: number;
  normalRainfall: number;
  normalTemperature: number;
  source: string;
}

// Indian weather stations (sample)
export const WEATHER_STATIONS = [
  { id: 'IMD-001', name: 'New Delhi', lat: 28.6139, lng: 77.2090, district: 'Central Delhi', state: 'Delhi' },
  { id: 'IMD-002', name: 'Ludhiana', lat: 30.9010, lng: 75.8573, district: 'Ludhiana', state: 'Punjab' },
  { id: 'IMD-003', name: 'Hyderabad', lat: 17.3850, lng: 78.4867, district: 'Hyderabad', state: 'Telangana' },
  { id: 'IMD-004', name: 'Patna', lat: 25.6093, lng: 85.1376, district: 'Patna', state: 'Bihar' },
  { id: 'IMD-005', name: 'Jaipur', lat: 26.9124, lng: 75.7873, district: 'Jaipur', state: 'Rajasthan' },
  { id: 'IMD-006', name: 'Chennai', lat: 13.0827, lng: 80.2707, district: 'Chennai', state: 'Tamil Nadu' },
  { id: 'IMD-007', name: 'Lucknow', lat: 26.8467, lng: 80.9462, district: 'Lucknow', state: 'Uttar Pradesh' },
  { id: 'IMD-008', name: 'Indore', lat: 22.7196, lng: 75.8577, district: 'Indore', state: 'Madhya Pradesh' },
  { id: 'IMD-009', name: 'Nagpur', lat: 21.1458, lng: 79.0882, district: 'Nagpur', state: 'Maharashtra' },
  { id: 'IMD-010', name: 'Rajkot', lat: 22.3039, lng: 70.8022, district: 'Rajkot', state: 'Gujarat' },
];

// Seasonal normal rainfall patterns (mm per month)
// Based on IMD historical averages for kharif (Jun-Oct) and rabi (Nov-Mar)
const SEASONAL_NORMALS: Record<string, Record<number, number>> = {
  kharif: {  // Monsoon crop season
    1: 15, 2: 10, 3: 12, 4: 18, 5: 35, 6: 165,
    7: 290, 8: 285, 9: 175, 10: 65, 11: 18, 12: 12
  },
  rabi: {    // Winter crop season
    1: 20, 2: 25, 3: 20, 4: 15, 5: 30, 6: 120,
    7: 250, 8: 240, 9: 150, 10: 50, 11: 15, 12: 10
  },
};

/**
 * Get normal rainfall for a given month and season
 */
export function getNormalRainfall(month: number, season: string): number {
  const normals = SEASONAL_NORMALS[season] || SEASONAL_NORMALS.kharif;
  return normals[month] || 20;
}

/**
 * Get normal temperature for Indian climate
 */
export function getNormalTemperature(month: number, lat: number): number {
  // Simplified model based on latitude and month
  const tropicalBase = 28; // base for tropical India
  const seasonEffect = Math.cos(((month - 1) / 12) * 2 * Math.PI) * 5;
  const latitudeEffect = (lat - 20) * -0.15; // cooler as you go north
  return tropicalBase + seasonEffect + latitudeEffect;
}

/**
 * Generate synthetic weather data for demo purposes
 * Simulates different scenarios: normal, deficit, severe deficit
 */
export function generateSyntheticWeather(
  date: Date,
  lat: number,
  lng: number,
  scenario: 'normal' | 'mild_deficit' | 'severe_deficit' | 'extreme_deficit' = 'normal',
  season: string = 'kharif'
): WeatherDataPoint {
  const month = date.getMonth() + 1;
  const normalRainfall = getNormalRainfall(month, season);
  const normalTemp = getNormalTemperature(month, lat);

  let rainfallFactor: number;
  let tempModifier: number;

  switch (scenario) {
    case 'severe_deficit':
      rainfallFactor = 0.35 + Math.random() * 0.15; // 35-50% of normal
      tempModifier = 3 + Math.random() * 2; // 3-5°C above normal
      break;
    case 'extreme_deficit':
      rainfallFactor = 0.10 + Math.random() * 0.15; // 10-25% of normal
      tempModifier = 5 + Math.random() * 3; // 5-8°C above normal
      break;
    case 'mild_deficit':
      rainfallFactor = 0.60 + Math.random() * 0.15; // 60-75% of normal
      tempModifier = 1 + Math.random() * 1.5; // 1-2.5°C above normal
      break;
    default: // normal
      rainfallFactor = 0.85 + Math.random() * 0.30; // 85-115% of normal
      tempModifier = (Math.random() - 0.5) * 3; // ±1.5°C
  }

  const rainfallMm = Math.max(0, normalRainfall * rainfallFactor + (Math.random() - 0.5) * 10);
  const temperatureC = normalTemp + tempModifier;
  const humidity = scenario === 'normal' ? 65 + Math.random() * 20 : 40 + Math.random() * 20;

  // Soil moisture correlated with rainfall
  const baseSoilMoisture = scenario === 'normal' ? 65 : scenario === 'mild_deficit' ? 50 : scenario === 'severe_deficit' ? 35 : 20;
  const soilMoisture = baseSoilMoisture + (Math.random() - 0.5) * 15;

  return {
    date,
    rainfallMm: Math.round(rainfallMm * 10) / 10,
    temperatureC: Math.round(temperatureC * 10) / 10,
    humidity: Math.round(humidity),
    soilMoisture: Math.round(Math.max(5, Math.min(95, soilMoisture))),
    windSpeed: Math.round((8 + Math.random() * 15) * 10) / 10,
    normalRainfall,
    normalTemperature: Math.round(normalTemp * 10) / 10,
    source: 'synthetic',
  };
}

/**
 * Generate a time series of weather data for a plot
 */
export function generateWeatherTimeSeries(
  startDate: Date,
  days: number,
  lat: number,
  lng: number,
  scenario: 'normal' | 'mild_deficit' | 'severe_deficit' | 'extreme_deficit' = 'normal',
  season: string = 'kharif'
): WeatherDataPoint[] {
  const data: WeatherDataPoint[] = [];

  // Allow scenario to shift partway through to simulate developing drought
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // For deficit scenarios, start normal and transition to deficit
    let effectiveScenario = scenario;
    if (scenario !== 'normal' && i < days * 0.3) {
      effectiveScenario = 'normal';
    } else if (scenario !== 'normal' && i < days * 0.6) {
      effectiveScenario = 'mild_deficit';
    }

    data.push(generateSyntheticWeather(date, lat, lng, effectiveScenario, season));
  }

  return data;
}

/**
 * Find nearest weather station to given coordinates
 */
export function findNearestStation(lat: number, lng: number) {
  let nearest = WEATHER_STATIONS[0];
  let minDist = Infinity;

  for (const station of WEATHER_STATIONS) {
    const dist = Math.sqrt(
      Math.pow(station.lat - lat, 2) + Math.pow(station.lng - lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = station;
    }
  }

  return {
    ...nearest,
    distance: Math.round(minDist * 111), // rough km conversion
  };
}

/**
 * Fetch real weather data from OpenWeatherMap (if API key available)
 */
export async function fetchOpenWeatherData(
  lat: number,
  lng: number
): Promise<WeatherDataPoint | null> {
  if (config.openWeatherApiKey === 'demo') {
    return null; // Use synthetic data
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${config.openWeatherApiKey}&units=metric`
    );

    const data = response.data;
    const now = new Date();

    return {
      date: now,
      rainfallMm: data.rain?.['1h'] || 0,
      temperatureC: data.main.temp,
      humidity: data.main.humidity,
      soilMoisture: data.main.humidity * 0.7, // rough estimate
      windSpeed: data.wind?.speed || 0,
      normalRainfall: getNormalRainfall(now.getMonth() + 1, 'kharif'),
      normalTemperature: getNormalTemperature(now.getMonth() + 1, lat),
      source: 'openweather',
    };
  } catch (error) {
    console.error('OpenWeather API error:', error);
    return null;
  }
}
