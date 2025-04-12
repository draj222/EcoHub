import { NextResponse } from 'next/server';

// NOAA API endpoints
const NOAA_API_BASE = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';
const SOFAR_API_BASE = 'https://api.sofarocean.com/api';

// Cache responses for 5 minutes to avoid rate limiting
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let lastFetchTime = 0;
let cachedData: any = null;

async function fetchNOAAData() {
  try {
    const response = await fetch(
      `${NOAA_API_BASE}?product=water_temperature&application=NOS.COOPS.TAC.WL&station=9414290&time_zone=GMT&units=english&interval=6&format=json&date=latest`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`NOAA API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching NOAA data:', error);
    return null;
  }
}

async function fetchSofarData() {
  try {
    if (!process.env.SOFAR_API_KEY) {
      console.error('Sofar API key not found');
      return null;
    }

    const response = await fetch(
      `${SOFAR_API_BASE}/spots/latest`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SOFAR_API_KEY}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Sofar API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Sofar data:', error);
    return null;
  }
}

export async function GET() {
  try {
    const now = Date.now();
    
    // Return cached data if it's still valid
    if (cachedData && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Fetch new data
    const [noaaData, sofarData] = await Promise.all([
      fetchNOAAData(),
      fetchSofarData()
    ]);

    // Process and combine the data
    const processedData = {
      timestamp: new Date().toISOString(),
      noaa: noaaData ? {
        waterTemperature: noaaData.data?.[0]?.v,
        station: noaaData.metadata?.station,
        units: noaaData.metadata?.units
      } : null,
      sofar: sofarData ? {
        waveHeight: sofarData.waveHeight,
        wavePeriod: sofarData.wavePeriod,
        windSpeed: sofarData.windSpeed,
        windDirection: sofarData.windDirection
      } : null
    };

    // Update cache
    cachedData = processedData;
    lastFetchTime = now;

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error processing environmental data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch environmental data' },
      { status: 500 }
    );
  }
} 