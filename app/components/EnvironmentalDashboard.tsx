'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FiMapPin, FiDroplet, FiWind, FiSun, FiTrendingUp } from 'react-icons/fi';

interface BuoyData {
  timestamp: string;
  waveHeight: number;
  waterTemp: number;
  windSpeed: number;
}

interface SofarData {
  timestamp: string;
  salinity: number;
  oxygen: number;
  ph: number;
}

interface AirQualityData {
  timestamp: string;
  aqi: number;
  pm25: number;
  ozone: number;
}

interface PredictionData {
  timestamp: string;
  prediction: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

const EnvironmentalDashboard = () => {
  const [location, setLocation] = useState<string>('california');
  const [buoyData, setBuoyData] = useState<BuoyData[]>([]);
  const [sofarData, setSofarData] = useState<SofarData[]>([]);
  const [airQualityData, setAirQualityData] = useState<AirQualityData[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [days, setDays] = useState<number>(7);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Mock data instead of actual API calls
        const mockBuoyData = generateMockBuoyData(days);
        const mockSofarData = generateMockSofarData(days);
        const mockAirQualityData = generateMockAirQualityData(days);
        const mockPredictions = generateMockPredictions(days);
        
        setBuoyData(mockBuoyData);
        setSofarData(mockSofarData);
        setAirQualityData(mockAirQualityData);
        setPredictions(mockPredictions);
      } catch (error) {
        console.error('Error fetching environmental data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location, days]);

  // Helper function to generate mock data
  const generateMockBuoyData = (days: number): BuoyData[] => {
    return Array.from({ length: days }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - index - 1));
      
      return {
        timestamp: date.toISOString().split('T')[0],
        waveHeight: parseFloat((Math.random() * 3 + 1).toFixed(1)),
        waterTemp: parseFloat((Math.random() * 5 + 15).toFixed(1)),
        windSpeed: parseFloat((Math.random() * 15 + 5).toFixed(1))
      };
    });
  };

  const generateMockSofarData = (days: number): SofarData[] => {
    return Array.from({ length: days }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - index - 1));
      
      return {
        timestamp: date.toISOString().split('T')[0],
        salinity: parseFloat((Math.random() * 5 + 30).toFixed(1)),
        oxygen: parseFloat((Math.random() * 2 + 6).toFixed(1)),
        ph: parseFloat((Math.random() * 1 + 7).toFixed(1))
      };
    });
  };

  const generateMockAirQualityData = (days: number): AirQualityData[] => {
    return Array.from({ length: days }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - index - 1));
      
      return {
        timestamp: date.toISOString().split('T')[0],
        aqi: Math.floor(Math.random() * 100 + 20),
        pm25: parseFloat((Math.random() * 15 + 5).toFixed(1)),
        ozone: parseFloat((Math.random() * 0.05 + 0.02).toFixed(3))
      };
    });
  };

  const generateMockPredictions = (days: number): PredictionData[] => {
    const trends: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable'];
    const predictions = [
      "Rising sea levels expected",
      "Potential temperature increase",
      "Reduced air quality forecast",
      "Increased marine biodiversity",
      "Coral reef recovery projected"
    ];
    
    return Array.from({ length: Math.min(5, days) }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index + 1);
      
      return {
        timestamp: date.toISOString().split('T')[0],
        prediction: predictions[index % predictions.length],
        confidence: parseFloat((Math.random() * 30 + 70).toFixed(1)),
        trend: trends[Math.floor(Math.random() * trends.length)]
      };
    });
  };

  const getAqiDescription = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getAqiColor = (aqi: number): string => {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-500';
    if (aqi <= 150) return 'text-orange-500';
    if (aqi <= 200) return 'text-red-500';
    if (aqi <= 300) return 'text-purple-500';
    return 'text-red-800';
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Environmental Dashboard</h2>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex space-x-2">
            <button 
              onClick={() => setLocation('california')}
              className={`px-4 py-2 rounded-md flex items-center ${
                location === 'california' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiMapPin className="mr-2" /> California Coast
            </button>
            <button 
              onClick={() => setLocation('florida')}
              className={`px-4 py-2 rounded-md flex items-center ${
                location === 'florida' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiMapPin className="mr-2" /> Florida Coast
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setDays(7)}
              className={`px-4 py-2 rounded-md ${
                days === 7 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              7 Days
            </button>
            <button 
              onClick={() => setDays(14)}
              className={`px-4 py-2 rounded-md ${
                days === 14 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              14 Days
            </button>
            <button 
              onClick={() => setDays(30)}
              className={`px-4 py-2 rounded-md ${
                days === 30 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          {/* Data Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Current Ocean Conditions */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 shadow">
              <div className="flex items-center text-blue-600 mb-3">
                <FiDroplet className="text-xl mr-2" />
                <h3 className="font-semibold">Ocean Conditions</h3>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Wave Height</p>
                  <p className="text-xl font-semibold">{buoyData[buoyData.length - 1]?.waveHeight || '-'} m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Water Temperature</p>
                  <p className="text-xl font-semibold">{buoyData[buoyData.length - 1]?.waterTemp || '-'}°C</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Wind Speed</p>
                  <p className="text-xl font-semibold">{buoyData[buoyData.length - 1]?.windSpeed || '-'} knots</p>
                </div>
              </div>
            </div>
            
            {/* SOFAR Ocean Data */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-5 shadow">
              <div className="flex items-center text-teal-600 mb-3">
                <FiDroplet className="text-xl mr-2" />
                <h3 className="font-semibold">Ocean Chemistry</h3>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Salinity</p>
                  <p className="text-xl font-semibold">{sofarData[sofarData.length - 1]?.salinity || '-'} PSU</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dissolved Oxygen</p>
                  <p className="text-xl font-semibold">{sofarData[sofarData.length - 1]?.oxygen || '-'} mg/L</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">pH Level</p>
                  <p className="text-xl font-semibold">{sofarData[sofarData.length - 1]?.ph || '-'}</p>
                </div>
              </div>
            </div>
            
            {/* Air Quality */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-5 shadow">
              <div className="flex items-center text-yellow-600 mb-3">
                <FiWind className="text-xl mr-2" />
                <h3 className="font-semibold">Air Quality</h3>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Air Quality Index</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold">{airQualityData[airQualityData.length - 1]?.aqi || '-'}</p>
                    <p className={`ml-2 text-sm ${getAqiColor(airQualityData[airQualityData.length - 1]?.aqi || 0)}`}>
                      {getAqiDescription(airQualityData[airQualityData.length - 1]?.aqi || 0)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">PM2.5</p>
                  <p className="text-xl font-semibold">{airQualityData[airQualityData.length - 1]?.pm25 || '-'} μg/m³</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ozone</p>
                  <p className="text-xl font-semibold">{airQualityData[airQualityData.length - 1]?.ozone || '-'} ppm</p>
                </div>
              </div>
            </div>
            
            {/* Predictions */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 shadow">
              <div className="flex items-center text-purple-600 mb-3">
                <FiTrendingUp className="text-xl mr-2" />
                <h3 className="font-semibold">Predictions</h3>
              </div>
              
              <div className="space-y-3">
                {predictions.slice(0, 3).map((prediction, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center ${
                      prediction.trend === 'up' 
                        ? 'bg-red-100 text-red-500' 
                        : prediction.trend === 'down' 
                        ? 'bg-green-100 text-green-500' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {prediction.trend === 'up' ? '↑' : prediction.trend === 'down' ? '↓' : '→'}
                    </div>
                    <div>
                      <p className="text-sm">{prediction.prediction}</p>
                      <p className="text-xs text-gray-500">
                        {prediction.timestamp} · {prediction.confidence}% confidence
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ocean Data Chart */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold mb-4">Ocean Conditions Trends</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={buoyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="waveHeight" name="Wave Height (m)" stroke="#3B82F6" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="waterTemp" name="Water Temp (°C)" stroke="#10B981" />
                    <Line type="monotone" dataKey="windSpeed" name="Wind Speed (knots)" stroke="#6366F1" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Air Quality Chart */}
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold mb-4">Air Quality Trends</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={airQualityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="aqi" name="AQI" stroke="#F59E0B" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="pm25" name="PM2.5 (μg/m³)" stroke="#EF4444" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Additional Charts */}
          <div className="mt-8">
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold mb-4">Ocean Chemistry Trends</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sofarData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="salinity" name="Salinity (PSU)" stroke="#0EA5E9" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="oxygen" name="Dissolved Oxygen (mg/L)" stroke="#14B8A6" />
                    <Line type="monotone" dataKey="ph" name="pH Level" stroke="#8B5CF6" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>Data sources: NOAA Buoy Data, SOFAR Ocean, EPA AirNow, and predictive models for {location.charAt(0).toUpperCase() + location.slice(1)} region.</p>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default EnvironmentalDashboard; 