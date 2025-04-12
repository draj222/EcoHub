/**
 * Environmental Data API and Types
 * This module provides interfaces and functions to access environmental data
 * from various sources, including NOAA buoys, Sofar Ocean, air quality stations,
 * and ML-powered predictions.
 */

// Geographic location type
export interface GeoLocation {
  name: string;
  lat: number;
  lng: number;
  description?: string;
}

// Predefined monitoring locations
export const PREDEFINED_LOCATIONS: GeoLocation[] = [
  {
    name: 'Santa Monica Bay',
    lat: 33.95,
    lng: -118.5,
    description: 'Coastal waters off Santa Monica, CA'
  },
  {
    name: 'Monterey Bay',
    lat: 36.8,
    lng: -122.0,
    description: 'Marine sanctuary in Monterey, CA'
  },
  {
    name: 'San Francisco Bay',
    lat: 37.8,
    lng: -122.5,
    description: 'Entrance to San Francisco Bay'
  },
  {
    name: 'Point Reyes',
    lat: 38.0,
    lng: -123.0,
    description: 'Point Reyes National Seashore'
  }
];

// NOAA Buoy data type
export interface BuoyReading {
  timestamp: string;
  waterTemp: number;
  airTemp: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  stationId: string;
}

// Sofar Ocean data type
export interface SofarReading {
  timestamp: string;
  significantWaveHeight: number;
  peakPeriod: number;
  meanDirection: number;
  seaSurfaceTemperature?: number;
  deviceId: string;
}

// Air quality data type
export interface AirQualityReading {
  timestamp: string;
  aqi: number;
  category: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  stationId: string;
}

// ML prediction types
export interface Prediction<T> {
  date: string;
  predicted: T;
  confidence?: number;
}

export interface PredictionResults {
  waterTemp: Prediction<number>[];
  airQuality: Prediction<number>[];
  waveHeight: Prediction<number>[];
  confidenceScore: number;
  modelVersion: string;
  generatedAt: string;
}

/**
 * Fetches buoy data for a specific location and timeframe
 * @param location Geographic location
 * @param days Number of days of historical data to fetch (default: 7)
 * @returns Promise with array of buoy readings
 */
export async function fetchBuoyData(location: GeoLocation, days: number = 7): Promise<BuoyReading[]> {
  // In a real app, this would make an API call to a real data source
  // For demo purposes, we're generating mock data
  const now = new Date();
  const readings: BuoyReading[] = [];
  
  for (let i = 0; i < days * 24; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    
    // Generate some realistic looking data with daily variations
    const hourOfDay = timestamp.getHours();
    const baseTemp = 15 + (Math.sin(timestamp.getDate() / 5) * 2); // Base temperature varies by day
    const dailyVariation = Math.sin(hourOfDay / 24 * 2 * Math.PI) * 1.5; // Daily temperature cycle
    
    readings.push({
      timestamp: timestamp.toISOString(),
      waterTemp: baseTemp + Math.random() * 0.5,
      airTemp: baseTemp + dailyVariation + Math.random() * 2 - 1,
      windSpeed: 5 + Math.random() * 10,
      windDirection: 180 + Math.sin(timestamp.getTime() / 10000000) * 90,
      pressure: 1013 + Math.sin(timestamp.getTime() / 20000000) * 10,
      stationId: `NOAA-${Math.floor(location.lat)}-${Math.floor(location.lng)}`
    });
  }
  
  return readings.reverse(); // Return in chronological order
}

/**
 * Fetches Sofar Ocean data for a specific location and timeframe
 * @param location Geographic location
 * @param days Number of days of historical data to fetch (default: 7)
 * @returns Promise with array of Sofar Ocean readings
 */
export async function fetchSofarData(location: GeoLocation, days: number = 7): Promise<SofarReading[]> {
  // Mock data generation for demo purposes
  const now = new Date();
  const readings: SofarReading[] = [];
  
  for (let i = 0; i < days * 24; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    
    // Generate wave data with some meaningful patterns
    const timeOfYear = Math.sin((timestamp.getMonth() / 12) * 2 * Math.PI); // Seasonal variation
    const baseWaveHeight = 1.0 + timeOfYear * 0.5; // Higher waves in winter
    
    readings.push({
      timestamp: timestamp.toISOString(),
      significantWaveHeight: baseWaveHeight + Math.random() * 0.8,
      peakPeriod: 8 + Math.random() * 4,
      meanDirection: 240 + Math.random() * 30,
      seaSurfaceTemperature: 15 + Math.sin(timestamp.getDate() / 5) * 2 + Math.random(),
      deviceId: `SPOTTER-${Math.floor(location.lat * 10)}-${Math.floor(location.lng * 10)}`
    });
  }
  
  return readings.reverse(); // Return in chronological order
}

/**
 * Fetches air quality data for a specific location and timeframe
 * @param location Geographic location
 * @param days Number of days of historical data to fetch (default: 7)
 * @returns Promise with array of air quality readings
 */
export async function fetchAirQualityData(location: GeoLocation, days: number = 7): Promise<AirQualityReading[]> {
  // Mock data generation for demo purposes
  const now = new Date();
  const readings: AirQualityReading[] = [];
  
  for (let i = 0; i < days * 24; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    
    // Generate AQI with urban/time of day patterns
    const hourOfDay = timestamp.getHours();
    const isWeekend = timestamp.getDay() === 0 || timestamp.getDay() === 6;
    const trafficFactor = (hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 16 && hourOfDay <= 18) ? 20 : 0;
    const weekendFactor = isWeekend ? -10 : 0;
    
    // Base AQI varies by location (urban areas have higher pollution)
    const baseAqi = Math.abs(location.lng) > 120 ? 40 : 25;
    const aqi = Math.round(baseAqi + trafficFactor + weekendFactor + Math.random() * 15);
    
    // Determine category
    let category: string;
    if (aqi <= 50) category = 'Good';
    else if (aqi <= 100) category = 'Moderate';
    else if (aqi <= 150) category = 'Unhealthy for Sensitive Groups';
    else if (aqi <= 200) category = 'Unhealthy';
    else if (aqi <= 300) category = 'Very Unhealthy';
    else category = 'Hazardous';
    
    readings.push({
      timestamp: timestamp.toISOString(),
      aqi,
      category,
      pm25: Math.round((aqi / 2) + Math.random() * 5),
      pm10: Math.round((aqi / 1.5) + Math.random() * 10),
      o3: Math.round((aqi / 3) + Math.random() * 15),
      no2: Math.round((aqi / 4) + Math.random() * 8),
      stationId: `EPA-${Math.floor(location.lat)}-${Math.floor(location.lng)}`
    });
  }
  
  return readings.reverse(); // Return in chronological order
}

/**
 * Gets ML-based predictions for environmental conditions
 * @param location Geographic location
 * @returns Promise with prediction results
 */
export async function getPredictions(location: GeoLocation): Promise<PredictionResults> {
  // In a real app, this would call an ML model API
  // For demo purposes, we're generating mock predictions
  const now = new Date();
  const predictions: PredictionResults = {
    waterTemp: [],
    airQuality: [],
    waveHeight: [],
    confidenceScore: 0.85 + Math.random() * 0.1,
    modelVersion: "v1.2.0",
    generatedAt: now.toISOString()
  };
  
  // Generate 7 days of forecasts
  for (let i = 1; i <= 7; i++) {
    const forecastDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    
    // Water temperature predictions - follow seasonal patterns
    const dayOfYear = forecastDate.getMonth() * 30 + forecastDate.getDate();
    const yearCycle = Math.sin((dayOfYear / 365) * 2 * Math.PI);
    const baseTemp = 15 + yearCycle * 5; // Base temperature varies by season
    
    predictions.waterTemp.push({
      date: forecastDate.toISOString(),
      predicted: baseTemp + Math.random() * 1 - 0.5,
      confidence: 0.9 - (i * 0.05) // Confidence decreases for further predictions
    });
    
    // Air quality predictions
    const isWeekend = forecastDate.getDay() === 0 || forecastDate.getDay() === 6;
    const weekendFactor = isWeekend ? -8 : 0;
    const baseAqi = Math.abs(location.lng) > 120 ? 45 : 30;
    
    predictions.airQuality.push({
      date: forecastDate.toISOString(),
      predicted: Math.round(baseAqi + weekendFactor + Math.random() * 15 - 5),
      confidence: 0.85 - (i * 0.07)
    });
    
    // Wave height predictions
    const seasonWaveFactor = 1.0 + yearCycle * 0.5; // Higher waves in winter
    predictions.waveHeight.push({
      date: forecastDate.toISOString(),
      predicted: seasonWaveFactor + Math.random() * 0.8 - 0.3,
      confidence: 0.8 - (i * 0.06)
    });
  }
  
  return predictions;
}

/**
 * Helper function to find the nearest monitoring location
 */
export function findNearestLocation(lat: number, lng: number): GeoLocation {
  // Simple version - would be replaced with actual distance calculation
  return PREDEFINED_LOCATIONS[0];
}

/**
 * Format a timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
} 