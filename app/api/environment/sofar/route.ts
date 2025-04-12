import { NextResponse } from 'next/server';

// This is a mock API for SOFAR ocean data
// In a real application, you would make requests to actual SOFAR APIs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'hawaii';
    const days = parseInt(searchParams.get('days') || '7');
    
    // Generate mock data
    const data = generateMockSofarData(location, days);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching SOFAR data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SOFAR data' },
      { status: 500 }
    );
  }
}

function generateMockSofarData(location: string, days: number) {
  const currentDate = new Date();
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    // Generate different patterns based on location
    let oceanTemp, salinity, currentSpeed, pH;
    
    if (location === 'hawaii') {
      oceanTemp = 25.5 + Math.sin(i * 0.2) + Math.random() * 0.3;
      salinity = 35.2 + Math.sin(i * 0.1) * 0.2 + Math.random() * 0.1;
      currentSpeed = 0.5 + Math.sin(i * 0.3) * 0.3 + Math.random() * 0.2;
      pH = 8.1 + Math.sin(i * 0.05) * 0.1 + Math.random() * 0.05;
    } else if (location === 'california') {
      oceanTemp = 17.5 + Math.sin(i * 0.2) * 1.5 + Math.random() * 0.4;
      salinity = 33.8 + Math.sin(i * 0.1) * 0.3 + Math.random() * 0.1;
      currentSpeed = 0.7 + Math.sin(i * 0.3) * 0.4 + Math.random() * 0.2;
      pH = 8.0 + Math.sin(i * 0.05) * 0.1 + Math.random() * 0.05;
    } else if (location === 'florida') {
      oceanTemp = 28.0 + Math.sin(i * 0.2) * 1.0 + Math.random() * 0.3;
      salinity = 36.0 + Math.sin(i * 0.1) * 0.2 + Math.random() * 0.1;
      currentSpeed = 0.6 + Math.sin(i * 0.3) * 0.3 + Math.random() * 0.2;
      pH = 8.05 + Math.sin(i * 0.05) * 0.1 + Math.random() * 0.05;
    } else {
      oceanTemp = 23.0 + Math.sin(i * 0.2) * 1.2 + Math.random() * 0.3;
      salinity = 35.0 + Math.sin(i * 0.1) * 0.25 + Math.random() * 0.1;
      currentSpeed = 0.6 + Math.sin(i * 0.3) * 0.35 + Math.random() * 0.2;
      pH = 8.05 + Math.sin(i * 0.05) * 0.1 + Math.random() * 0.05;
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      oceanTemp: parseFloat(oceanTemp.toFixed(1)),
      salinity: parseFloat(salinity.toFixed(1)),
      currentSpeed: parseFloat(currentSpeed.toFixed(1)),
      pH: parseFloat(pH.toFixed(2)),
    });
  }
  
  return data.reverse();
} 