import { NextResponse } from 'next/server';

// This is a mock API for air quality data
// In a real application, you would make requests to actual air quality APIs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'hawaii';
    const days = parseInt(searchParams.get('days') || '7');
    
    // Generate mock data
    const data = generateMockAirQualityData(location, days);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch air quality data' },
      { status: 500 }
    );
  }
}

function generateMockAirQualityData(location: string, days: number) {
  const currentDate = new Date();
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    // Generate different patterns based on location
    let aqi, pm25, ozone;
    
    if (location === 'hawaii') {
      aqi = 30 + Math.sin(i * 0.3) * 10 + Math.random() * 5;
      pm25 = 5 + Math.sin(i * 0.4) * 2 + Math.random() * 1;
      ozone = 40 + Math.cos(i * 0.2) * 8 + Math.random() * 3;
    } else if (location === 'california') {
      aqi = 60 + Math.sin(i * 0.4) * 20 + Math.random() * 10;
      pm25 = 15 + Math.sin(i * 0.3) * 5 + Math.random() * 2;
      ozone = 70 + Math.cos(i * 0.3) * 10 + Math.random() * 5;
    } else if (location === 'florida') {
      aqi = 45 + Math.sin(i * 0.5) * 15 + Math.random() * 8;
      pm25 = 10 + Math.sin(i * 0.2) * 3 + Math.random() * 1.5;
      ozone = 55 + Math.cos(i * 0.4) * 9 + Math.random() * 4;
    } else {
      aqi = 50 + Math.sin(i * 0.3) * 15 + Math.random() * 8;
      pm25 = 12 + Math.sin(i * 0.3) * 4 + Math.random() * 1.5;
      ozone = 60 + Math.cos(i * 0.3) * 10 + Math.random() * 5;
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      aqi: Math.round(aqi),
      pm25: parseFloat(pm25.toFixed(1)),
      ozone: Math.round(ozone),
      // Add a qualitative assessment
      quality: getAirQualityCategory(Math.round(aqi))
    });
  }
  
  return data.reverse();
}

function getAirQualityCategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
} 