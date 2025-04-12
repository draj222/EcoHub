import { NextRequest, NextResponse } from 'next/server';

// List of data sources we can pull from
const DATA_SOURCES = {
  NOAA_BUOYS: 'noaa_buoys',
  SOFAR_OCEAN: 'sofar_ocean',
  AIR_QUALITY: 'air_quality',
};

// Mock data for development, would be replaced with actual API calls
const MOCK_DATA = {
  [DATA_SOURCES.NOAA_BUOYS]: [
    {
      id: 'buoy-41009',
      name: 'CANAVERAL 20 NM East of Cape Canaveral, FL',
      lat: 28.501,
      lng: -80.184,
      readings: {
        waterTemp: 25.6, // °C
        airTemp: 27.3, // °C
        windSpeed: 12.4, // knots
        windDirection: 'NE',
        waveHeight: 1.3, // meters
        timestamp: new Date().toISOString(),
      }
    },
    {
      id: 'buoy-42039',
      name: 'PENSACOLA 115 NM South of Pensacola, FL',
      lat: 28.794,
      lng: -86.016,
      readings: {
        waterTemp: 26.2, // °C
        airTemp: 28.1, // °C
        windSpeed: 8.2, // knots
        windDirection: 'SE',
        waveHeight: 0.9, // meters
        timestamp: new Date().toISOString(),
      }
    },
  ],
  [DATA_SOURCES.SOFAR_OCEAN]: [
    {
      id: 'spot-00124',
      name: 'Florida Reef Tract',
      lat: 25.12,
      lng: -81.78,
      readings: {
        waterTemp: 27.1, // °C
        salinity: 35.2, // PSU
        pH: 8.1,
        dissolvedOxygen: 6.8, // mg/L
        timestamp: new Date().toISOString(),
      }
    },
    {
      id: 'spot-00218',
      name: 'Caribbean Basin',
      lat: 17.45,
      lng: -67.23,
      readings: {
        waterTemp: 28.3, // °C
        salinity: 34.9, // PSU
        pH: 8.0,
        dissolvedOxygen: 7.1, // mg/L
        timestamp: new Date().toISOString(),
      }
    }
  ],
  [DATA_SOURCES.AIR_QUALITY]: [
    {
      id: 'air-nyc',
      name: 'New York City',
      lat: 40.7128,
      lng: -74.0060,
      readings: {
        aqi: 62,
        pm25: 15.2, // µg/m³
        pm10: 28.5, // µg/m³
        o3: 31.4, // ppb
        no2: 22.1, // ppb
        timestamp: new Date().toISOString(),
      }
    },
    {
      id: 'air-la',
      name: 'Los Angeles',
      lat: 34.0522,
      lng: -118.2437,
      readings: {
        aqi: 89,
        pm25: 23.7, // µg/m³
        pm10: 42.1, // µg/m³
        o3: 45.2, // ppb
        no2: 31.8, // ppb
        timestamp: new Date().toISOString(),
      }
    }
  ],
};

// In a real implementation, these would be API calls to environmental data providers
async function fetchNOAABuoyData() {
  // Would make actual API call here to NOAA buoy API
  // Example: const response = await fetch('https://api.noaa.gov/buoys?apiKey=YOUR_API_KEY');
  
  return MOCK_DATA[DATA_SOURCES.NOAA_BUOYS];
}

async function fetchSofarOceanData() {
  // Would make actual API call here to Sofar Ocean API
  // Example: const response = await fetch('https://api.sofarocean.com/v1/spotters?token=YOUR_API_TOKEN');
  
  return MOCK_DATA[DATA_SOURCES.SOFAR_OCEAN];
}

async function fetchAirQualityData() {
  // Would make actual API call here to air quality API (e.g., AirNow, IQAir)
  // Example: const response = await fetch('https://api.airnow.gov/data?api_key=YOUR_API_KEY');
  
  return MOCK_DATA[DATA_SOURCES.AIR_QUALITY];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source');
    
    let data = {};
    let sourceType = 'all';
    
    // Fetch data from the specified source or all sources
    if (source === DATA_SOURCES.NOAA_BUOYS) {
      data = await fetchNOAABuoyData();
      sourceType = 'noaa_buoys';
    } else if (source === DATA_SOURCES.SOFAR_OCEAN) {
      data = await fetchSofarOceanData();
      sourceType = 'sofar_ocean';
    } else if (source === DATA_SOURCES.AIR_QUALITY) {
      data = await fetchAirQualityData();
      sourceType = 'air_quality';
    } else {
      // Fetch from all sources if no specific source is requested
      const [noaaBuoys, sofarOcean, airQuality] = await Promise.all([
        fetchNOAABuoyData(),
        fetchSofarOceanData(),
        fetchAirQualityData()
      ]);
      
      data = {
        noaa_buoys: noaaBuoys,
        sofar_ocean: sofarOcean,
        air_quality: airQuality
      };
    }
    
    return NextResponse.json({
      success: true,
      source: sourceType,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching environmental data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch environmental data' },
      { status: 500 }
    );
  }
} 