import { NextRequest, NextResponse } from 'next/server';
import { 
  predictAirQuality, 
  predictWaterTemperature, 
  assessMarineHealth,
  type AirQualityData,
  type WaterQualityData,
  type PredictionTimeframe
} from '@/app/lib/ml-prediction';

// Mock data for testing - in a real app this would come from the database or real-time API
const MOCK_AIR_QUALITY: AirQualityData = {
  id: 'air-nyc',
  name: 'New York City',
  lat: 40.7128,
  lng: -74.0060,
  readings: {
    aqi: 62,
    pm25: 15.2,
    pm10: 28.5,
    o3: 31.4,
    no2: 22.1,
    timestamp: new Date().toISOString(),
  }
};

const MOCK_WATER_QUALITY: WaterQualityData = {
  id: 'spot-00124',
  name: 'Florida Reef Tract',
  lat: 25.12,
  lng: -81.78,
  readings: {
    waterTemp: 27.1,
    salinity: 35.2,
    pH: 8.1,
    dissolvedOxygen: 6.8,
    timestamp: new Date().toISOString(),
  }
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { predictionType, location, timeframe = '24h', environmentalData } = data;
    
    // Validate input
    if (!predictionType) {
      return NextResponse.json(
        { success: false, error: 'Prediction type is required' }, 
        { status: 400 }
      );
    }
    
    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location is required' }, 
        { status: 400 }
      );
    }
    
    // Validate timeframe
    const validTimeframes: PredictionTimeframe[] = ['24h', '7d', '30d'];
    if (timeframe && !validTimeframes.includes(timeframe as PredictionTimeframe)) {
      return NextResponse.json(
        { success: false, error: 'Timeframe must be 24h, 7d, or 30d' }, 
        { status: 400 }
      );
    }
    
    let result;
    
    // Make prediction based on type
    switch (predictionType) {
      case 'air-quality':
        // Use provided data or mock data
        const airData = environmentalData || MOCK_AIR_QUALITY;
        result = await predictAirQuality(
          location, 
          airData,
          timeframe as PredictionTimeframe
        );
        break;
        
      case 'water-temperature':
        // Use provided data or mock data
        const waterData = environmentalData || MOCK_WATER_QUALITY;
        result = await predictWaterTemperature(
          location,
          waterData,
          timeframe as PredictionTimeframe
        );
        break;
        
      case 'marine-health':
        // Use provided data or mock data
        const marineData = environmentalData || MOCK_WATER_QUALITY;
        result = await assessMarineHealth(location, marineData);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid prediction type' }, 
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      predictionType,
      location,
      timeframe,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error making environmental prediction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to make prediction' }, 
      { status: 500 }
    );
  }
} 