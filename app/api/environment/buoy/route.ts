import { NextResponse } from 'next/server';

// This is a mock API for buoy data
// In a real application, you would make requests to actual environmental APIs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'hawaii';
    const days = parseInt(searchParams.get('days') || '7');
    
    // Generate mock data
    const data = generateMockBuoyData(location, days);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching buoy data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch buoy data' },
      { status: 500 }
    );
  }
}

function generateMockBuoyData(location: string, days: number) {
  const currentDate = new Date();
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    // Generate different patterns based on location
    let waveHeight, waterTemp, windSpeed;
    
    if (location === 'hawaii') {
      waveHeight = 1.5 + Math.sin(i * 0.5) + Math.random() * 0.5;
      waterTemp = 26 + Math.sin(i * 0.2) + Math.random() * 0.5;
      windSpeed = 12 + Math.cos(i * 0.3) + Math.random() * 2;
    } else if (location === 'california') {
      waveHeight = 1.2 + Math.sin(i * 0.4) + Math.random() * 0.4;
      waterTemp = 18 + Math.sin(i * 0.3) + Math.random() * 0.5;
      windSpeed = 15 + Math.cos(i * 0.5) + Math.random() * 3;
    } else if (location === 'florida') {
      waveHeight = 0.8 + Math.sin(i * 0.3) + Math.random() * 0.3;
      waterTemp = 27 + Math.sin(i * 0.1) + Math.random() * 0.5;
      windSpeed = 10 + Math.cos(i * 0.4) + Math.random() * 2;
    } else {
      waveHeight = 1.0 + Math.sin(i * 0.3) + Math.random() * 0.5;
      waterTemp = 22 + Math.sin(i * 0.2) + Math.random() * 0.5;
      windSpeed = 12 + Math.cos(i * 0.4) + Math.random() * 2;
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      waveHeight: parseFloat(waveHeight.toFixed(1)),
      waterTemp: parseFloat(waterTemp.toFixed(1)),
      windSpeed: parseFloat(windSpeed.toFixed(1)),
    });
  }
  
  return data.reverse();
} 