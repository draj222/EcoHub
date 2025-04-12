'use client';

import React, { useState, useEffect } from 'react';
import { FiDroplet, FiThermometer, FiWind, FiActivity } from 'react-icons/fi';
import { MdWaves, MdOutlineWaterDrop, MdAir } from 'react-icons/md';
import { TbWorldLongitude, TbWorldLatitude } from 'react-icons/tb';
import { PREDEFINED_LOCATIONS } from '@/app/lib/api/environmental-data';
import type { GeoLocation, BuoyReading, SofarReading, AirQualityReading } from '@/app/lib/api/environmental-data';
import type { WaterQualityPrediction, AirQualityPrediction, TimeFrame } from '@/app/lib/ml-prediction';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EnvironmentalMonitorProps {
  className?: string;
}

interface LocationData {
  buoyData: BuoyReading | null;
  sofarData: SofarReading | null;
  airData: AirQualityReading | null;
  waterPrediction: WaterQualityPrediction | null;
  airPrediction: AirQualityPrediction | null;
  loading: boolean;
  error: string | null;
}

const EnvironmentalMonitor: React.FC<EnvironmentalMonitorProps> = ({ className }) => {
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation>(PREDEFINED_LOCATIONS[0]);
  const [timeframe, setTimeframe] = useState<TimeFrame>('24h');
  const [data, setData] = useState<LocationData>({
    buoyData: null,
    sofarData: null,
    airData: null,
    waterPrediction: null,
    airPrediction: null,
    loading: false,
    error: null
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        // Fetch environmental data
        const buoyResponse = await fetch(`/api/environmental/buoy?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`);
        const sofarResponse = await fetch(`/api/environmental/sofar?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`);
        const airResponse = await fetch(`/api/environmental/air-quality?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`);
        
        if (!buoyResponse.ok || !sofarResponse.ok || !airResponse.ok) {
          throw new Error('Failed to fetch environmental data');
        }
        
        const buoyData = await buoyResponse.json();
        const sofarData = await sofarResponse.json();
        const airData = await airResponse.json();
        
        // Fetch predictions
        const waterPredResponse = await fetch(
          `/api/predictions/water?timeframe=${timeframe}&waterTemp=${buoyData.waterTemp}&salinity=${buoyData.salinity}&pH=${buoyData.pH}&dissolvedOxygen=${buoyData.dissolvedOxygen}&timestamp=${buoyData.timestamp}`
        );
        
        const airPredResponse = await fetch(
          `/api/predictions/air?timeframe=${timeframe}&aqi=${airData.aqi}&pm25=${airData.pm25}&pm10=${airData.pm10}&o3=${airData.o3}&no2=${airData.no2}&co=${airData.co}&so2=${airData.so2}&timestamp=${airData.timestamp}`
        );
        
        if (!waterPredResponse.ok || !airPredResponse.ok) {
          throw new Error('Failed to fetch prediction data');
        }
        
        const waterPrediction = await waterPredResponse.json();
        const airPrediction = await airPredResponse.json();
        
        setData({
          buoyData,
          sofarData,
          airData,
          waterPrediction,
          airPrediction,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching environmental data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        }));
      }
    };
    
    fetchData();
  }, [selectedLocation, timeframe]);
  
  const renderAirQualityLabel = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-green-500' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-500' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-500' };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-500' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-500' };
    return { label: 'Hazardous', color: 'text-pink-800' };
  };
  
  const renderWaterTempData = () => {
    if (!data.buoyData || !data.waterPrediction) return null;
    
    const labels = ['Now'];
    const current = [data.buoyData.waterTemp];
    
    // Add future time labels based on timeframe
    switch (timeframe) {
      case '24h':
        labels.push('6h', '12h', '18h', '24h');
        break;
      case '72h':
        labels.push('24h', '48h', '72h');
        break;
      case '7d':
        labels.push('2d', '3d', '5d', '7d');
        break;
      case '30d':
        labels.push('10d', '20d', '30d');
        break;
    }
    
    // Generate prediction line with gradual change to prediction
    const predictedData = [...current];
    const intervals = labels.length - 1;
    const step = (data.waterPrediction.predictedTemp - data.buoyData.waterTemp) / intervals;
    
    for (let i = 1; i <= intervals; i++) {
      predictedData.push(data.buoyData.waterTemp + (step * i));
    }
    
    // Create chart data
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Water Temperature (°C)',
          data: predictedData,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.3,
          fill: {
            target: 'origin',
            above: 'rgba(53, 162, 235, 0.1)'
          }
        }
      ]
    };
    
    const chartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    };
    
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <FiThermometer className="text-blue-500 text-xl" />
          <h3 className="font-semibold text-gray-800">Water Temperature</h3>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="text-3xl font-bold text-blue-600">
            {data.buoyData.waterTemp}°C
            <span className="text-sm ml-2 font-normal text-gray-500">Current</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-xl font-medium text-gray-700">
              {data.waterPrediction.predictedTemp}°C
              <span className="text-xs ml-1 font-normal text-gray-500">Predicted</span>
            </div>
            <div className={`text-sm font-medium ${
              data.waterPrediction.tempTrend === 'rising' ? 'text-red-500' : 
              data.waterPrediction.tempTrend === 'falling' ? 'text-blue-500' : 'text-gray-500'
            }`}>
              {data.waterPrediction.tempTrend === 'rising' ? '↑ Rising' : 
              data.waterPrediction.tempTrend === 'falling' ? '↓ Falling' : '→ Stable'}
            </div>
          </div>
        </div>
        
        <div className="h-[120px]">
          <Line data={chartData} options={chartOptions} />
        </div>
        
        <div className="mt-2 text-xs text-gray-500 flex justify-between">
          <span>Confidence: {(data.waterPrediction.confidence * 100).toFixed(0)}%</span>
          <span>Timeframe: {timeframe}</span>
        </div>
      </div>
    );
  };
  
  const renderAirQualityData = () => {
    if (!data.airData || !data.airPrediction) return null;
    
    const currentAqi = data.airData.aqi;
    const predictedAqi = data.airPrediction.predictedAQI;
    const { label: currentLabel, color: currentColor } = renderAirQualityLabel(currentAqi);
    const { label: predictedLabel, color: predictedColor } = renderAirQualityLabel(predictedAqi);
    
    const labels = ['Now'];
    const aqiData = [currentAqi];
    
    // Add future time labels based on timeframe
    switch (timeframe) {
      case '24h':
        labels.push('6h', '12h', '18h', '24h');
        break;
      case '72h':
        labels.push('24h', '48h', '72h');
        break;
      case '7d':
        labels.push('2d', '3d', '5d', '7d');
        break;
      case '30d':
        labels.push('10d', '20d', '30d');
        break;
    }
    
    // Generate prediction line with gradual change to prediction
    const intervals = labels.length - 1;
    const step = (predictedAqi - currentAqi) / intervals;
    
    for (let i = 1; i <= intervals; i++) {
      aqiData.push(currentAqi + (step * i));
    }
    
    // Create chart data
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Air Quality Index',
          data: aqiData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.3,
          fill: {
            target: 'origin',
            above: 'rgba(255, 99, 132, 0.1)'
          }
        }
      ]
    };
    
    const chartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    };
    
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <MdAir className="text-purple-500 text-xl" />
          <h3 className="font-semibold text-gray-800">Air Quality</h3>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-3xl font-bold text-purple-600">
              {currentAqi}
              <span className="text-sm ml-2 font-normal text-gray-500">AQI</span>
            </div>
            <div className={`text-sm font-medium ${currentColor}`}>
              {currentLabel}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-xl font-medium text-gray-700">
              {predictedAqi}
              <span className="text-xs ml-1 font-normal text-gray-500">Predicted</span>
            </div>
            <div className={`text-sm font-medium ${predictedColor}`}>
              {predictedLabel}
            </div>
            <div className={`text-xs font-medium ${
              data.airPrediction.trend === 'improving' ? 'text-green-500' : 
              data.airPrediction.trend === 'worsening' ? 'text-red-500' : 'text-gray-500'
            }`}>
              {data.airPrediction.trend === 'improving' ? '↓ Improving' : 
              data.airPrediction.trend === 'worsening' ? '↑ Worsening' : '→ Stable'}
            </div>
          </div>
        </div>
        
        <div className="h-[120px]">
          <Line data={chartData} options={chartOptions} />
        </div>
        
        <div className="mt-2 text-xs text-gray-500 flex justify-between">
          <span>Confidence: {(data.airPrediction.confidence * 100).toFixed(0)}%</span>
          <span>Timeframe: {timeframe}</span>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-xl shadow-lg ${className}`}>
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold text-teal-700">Environmental Monitoring</h2>
        
        {/* Location selector */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-1 flex-col">
            <label htmlFor="location-select" className="text-sm font-medium text-gray-700 mb-1">
              Select Location
            </label>
            <select
              id="location-select"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              value={PREDEFINED_LOCATIONS.findIndex(l => l.name === selectedLocation.name)}
              onChange={(e) => setSelectedLocation(PREDEFINED_LOCATIONS[parseInt(e.target.value)])}
            >
              {PREDEFINED_LOCATIONS.map((location, index) => (
                <option key={location.name} value={index}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-1 flex-col">
            <label htmlFor="timeframe-select" className="text-sm font-medium text-gray-700 mb-1">
              Prediction Timeframe
            </label>
            <select
              id="timeframe-select"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as TimeFrame)}
            >
              <option value="24h">Next 24 Hours</option>
              <option value="72h">Next 72 Hours</option>
              <option value="7d">Next 7 Days</option>
              <option value="30d">Next 30 Days</option>
            </select>
          </div>
        </div>
        
        {/* Display coordinates */}
        <div className="flex items-center justify-center gap-4 bg-white/60 py-2 px-4 rounded-md">
          <div className="flex items-center">
            <TbWorldLatitude className="text-gray-500 mr-1" />
            <span className="text-sm text-gray-700">{selectedLocation.lat.toFixed(4)}°</span>
          </div>
          <div className="flex items-center">
            <TbWorldLongitude className="text-gray-500 mr-1" />
            <span className="text-sm text-gray-700">{selectedLocation.lng.toFixed(4)}°</span>
          </div>
        </div>
        
        {/* Loading state */}
        {data.loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        )}
        
        {/* Error state */}
        {data.error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
            <p>{data.error}</p>
            <button 
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
              onClick={() => setData(prev => ({ ...prev, error: null }))}
            >
              Dismiss
            </button>
          </div>
        )}
        
        {/* Data display */}
        {!data.loading && !data.error && data.buoyData && data.airData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderWaterTempData()}
              {renderAirQualityData()}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {/* Wave Data */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <MdWaves className="text-blue-500 text-xl" />
                  <h3 className="font-semibold text-gray-800">Wave Conditions</h3>
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Wave Height:</span>
                    <span className="font-medium">{data.buoyData.waveHeight} m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Wave Period:</span>
                    <span className="font-medium">{data.buoyData.wavePeriod} sec</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Significant Wave Height:</span>
                    <span className="font-medium">{data.sofarData.significantWaveHeight} m</span>
                  </div>
                </div>
              </div>
              
              {/* Weather Data */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <FiWind className="text-teal-500 text-xl" />
                  <h3 className="font-semibold text-gray-800">Weather</h3>
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Wind Speed:</span>
                    <span className="font-medium">{data.buoyData.windSpeed} m/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Wind Direction:</span>
                    <span className="font-medium">{data.buoyData.windDirection}°</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pressure:</span>
                    <span className="font-medium">{data.buoyData.pressure} hPa</span>
                  </div>
                </div>
              </div>
              
              {/* Water Quality */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <FiDroplet className="text-cyan-500 text-xl" />
                  <h3 className="font-semibold text-gray-800">Water Quality</h3>
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Salinity:</span>
                    <span className="font-medium">{data.buoyData.salinity} PSU</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">pH:</span>
                    <span className="font-medium">{data.buoyData.pH}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Dissolved Oxygen:</span>
                    <span className="font-medium">{data.buoyData.dissolvedOxygen} mg/L</span>
                  </div>
                </div>
              </div>
              
              {/* PM2.5 and PM10 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <MdOutlineWaterDrop className="text-purple-500 text-xl" />
                  <h3 className="font-semibold text-gray-800">Particulate Matter</h3>
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">PM2.5:</span>
                    <span className="font-medium">{data.airData.pm25} μg/m³</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">PM10:</span>
                    <span className="font-medium">{data.airData.pm10} μg/m³</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Predicted PM2.5:</span>
                    <span className="font-medium">{data.airPrediction.predictedPM25} μg/m³</span>
                  </div>
                </div>
              </div>
              
              {/* Gases */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <FiActivity className="text-yellow-500 text-xl" />
                  <h3 className="font-semibold text-gray-800">Air Pollutants</h3>
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ozone (O₃):</span>
                    <span className="font-medium">{data.airData.o3} ppm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nitrogen Dioxide (NO₂):</span>
                    <span className="font-medium">{data.airData.no2} ppm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sulfur Dioxide (SO₂):</span>
                    <span className="font-medium">{data.airData.so2} ppm</span>
                  </div>
                </div>
              </div>
              
              {/* Current Data */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <MdWaves className="text-green-500 text-xl rotate-90" />
                  <h3 className="font-semibold text-gray-800">Ocean Currents</h3>
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Speed:</span>
                    <span className="font-medium">{data.sofarData.currentSpeed} m/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Direction:</span>
                    <span className="font-medium">{data.sofarData.currentDirection}°</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium text-sm">
                      {new Date(data.sofarData.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-gray-600">
              <p className="mb-1">Data is refreshed every 30 minutes. Predictions are based on our ML model and historical trends.</p>
              <p>Confidence decreases with longer prediction timeframes. Use for reference only.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnvironmentalMonitor; 