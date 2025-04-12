import { NextResponse } from 'next/server';

// This is a mock API for environmental predictions
// In a real application, you would make requests to actual prediction APIs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'hawaii';
    const days = parseInt(searchParams.get('days') || '7');
    
    // Generate mock data
    const data = generateMockPredictionData(location, days);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching prediction data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prediction data' },
      { status: 500 }
    );
  }
}

function generateMockPredictionData(location: string, days: number) {
  const currentDate = new Date();
  const data = [];
  const trends = getLocationTrends(location);
  
  // Start from tomorrow for predictions
  for (let i = 1; i <= days; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + i);
    
    // Generate predictions with trend factors
    const dayFactor = i / days; // Factor increases as we go further in the future
    
    data.push({
      date: date.toISOString().split('T')[0],
      temperature: calculateWithTrend(trends.baseTemp, trends.tempTrend, dayFactor, 0.5),
      precipitation: calculateWithTrend(trends.basePrecip, trends.precipTrend, dayFactor, 0.3),
      co2Level: calculateWithTrend(trends.baseCO2, trends.co2Trend, dayFactor, 0.2),
      seaLevel: calculateWithTrend(trends.baseSeaLevel, trends.seaLevelTrend, dayFactor, 0.1),
    });
  }
  
  return data;
}

function calculateWithTrend(baseValue: number, trend: number, factor: number, randomFactor: number): number {
  // Apply trend and add some randomness
  const value = baseValue + (trend * factor) + (Math.random() * randomFactor * 2 - randomFactor);
  return parseFloat(value.toFixed(2));
}

function getLocationTrends(location: string) {
  // Different base values and trends for different locations
  switch (location) {
    case 'hawaii':
      return {
        baseTemp: 26,
        tempTrend: 0.3,
        basePrecip: 30,
        precipTrend: 5,
        baseCO2: 410,
        co2Trend: 1.5,
        baseSeaLevel: 0,
        seaLevelTrend: 0.5
      };
    case 'california':
      return {
        baseTemp: 22,
        tempTrend: 0.5,
        basePrecip: 15,
        precipTrend: -2,
        baseCO2: 420,
        co2Trend: 2,
        baseSeaLevel: 0,
        seaLevelTrend: 0.6
      };
    case 'florida':
      return {
        baseTemp: 28,
        tempTrend: 0.4,
        basePrecip: 40,
        precipTrend: 8,
        baseCO2: 415,
        co2Trend: 1.8,
        baseSeaLevel: 0,
        seaLevelTrend: 0.7
      };
    default:
      return {
        baseTemp: 25,
        tempTrend: 0.4,
        basePrecip: 25,
        precipTrend: 4,
        baseCO2: 415,
        co2Trend: 1.7,
        baseSeaLevel: 0,
        seaLevelTrend: 0.6
      };
  }
} 