'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/app/components/Header'
import { FiDroplet, FiWind, FiThermometer, FiActivity, FiAlertTriangle, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { PredictionTimeframe } from '@/app/lib/ml-prediction'

// Type definitions for our data
type EnvironmentalDataSource = 'noaa_buoys' | 'sofar_ocean' | 'air_quality';
type PredictionType = 'air-quality' | 'water-temperature' | 'marine-health';

interface BuoyReading {
  waterTemp: number;
  airTemp: number;
  windSpeed: number;
  windDirection: string;
  waveHeight: number;
  timestamp: string;
}

interface SofarReading {
  waterTemp: number;
  salinity: number;
  pH: number;
  dissolvedOxygen: number;
  timestamp: string;
}

interface AirQualityReading {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  timestamp: string;
}

interface EnvironmentalDataPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  readings: BuoyReading | SofarReading | AirQualityReading;
}

interface PredictionResult {
  current: number;
  prediction: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timeframe: PredictionTimeframe;
  units: string;
}

interface MarineHealthResult {
  healthScore: number;
  risk: 'low' | 'moderate' | 'high';
  factors: string[];
  recommendations: string[];
}

export default function EnvironmentalDataPage() {
  const router = useRouter();
  const [dataSource, setDataSource] = useState<EnvironmentalDataSource>('noaa_buoys');
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for predictions
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<PredictionTimeframe>('24h');
  const [predictionType, setPredictionType] = useState<PredictionType>('air-quality');
  const [prediction, setPrediction] = useState<PredictionResult | MarineHealthResult | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  
  // Fetch environmental data on component mount and when data source changes
  useEffect(() => {
    fetchEnvironmentalData(dataSource);
  }, [dataSource]);
  
  // Fetch environmental data from our API
  const fetchEnvironmentalData = async (source: EnvironmentalDataSource) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/environmental-data?source=${source}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEnvironmentalData(data.data);
        
        // Auto-select the first location if available
        if (data.data && data.data.length > 0) {
          setSelectedLocation(data.data[0].id);
        }
      } else {
        setError(data.error || 'Failed to fetch environmental data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Make a prediction using our ML API
  const makePrediction = async () => {
    if (!selectedLocation) {
      setError('Please select a location');
      return;
    }
    
    setPredictionLoading(true);
    setError(null);
    
    try {
      // Find the selected location data
      const locationData = environmentalData.find(d => d.id === selectedLocation);
      
      if (!locationData) {
        throw new Error('Selected location not found');
      }
      
      const response = await fetch('/api/environmental-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          predictionType,
          location: locationData.name,
          timeframe: selectedTimeframe,
          environmentalData: locationData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get prediction: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPrediction(data.result);
      } else {
        setError(data.error || 'Failed to make prediction');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setPredictionLoading(false);
    }
  };
  
  // Render a data card based on the type of reading
  const renderDataCard = (data: EnvironmentalDataPoint) => {
    switch (dataSource) {
      case 'noaa_buoys':
        const buoyReading = data.readings as BuoyReading;
        return (
          <div key={data.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg">{data.name}</h3>
            <p className="text-xs text-gray-500 mb-3">Buoy ID: {data.id}</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center">
                <FiThermometer className="text-blue-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-600">Water Temp</p>
                  <p className="font-medium">{buoyReading.waterTemp}°C</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FiThermometer className="text-red-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-600">Air Temp</p>
                  <p className="font-medium">{buoyReading.airTemp}°C</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FiWind className="text-gray-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-600">Wind</p>
                  <p className="font-medium">{buoyReading.windSpeed} knots {buoyReading.windDirection}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FiDroplet className="text-blue-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-600">Wave Height</p>
                  <p className="font-medium">{buoyReading.waveHeight} m</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Last updated: {new Date(buoyReading.timestamp).toLocaleString()}
              </p>
              <button 
                className="mt-2 w-full py-1 bg-green-50 text-green-700 rounded text-sm hover:bg-green-100"
                onClick={() => {
                  setSelectedLocation(data.id);
                  setPredictionType('water-temperature');
                  makePrediction();
                }}
              >
                Predict changes
              </button>
            </div>
          </div>
        );
        
      case 'sofar_ocean':
        const sofarReading = data.readings as SofarReading;
        return (
          <div key={data.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg">{data.name}</h3>
            <p className="text-xs text-gray-500 mb-3">Spotter ID: {data.id}</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center">
                <FiThermometer className="text-blue-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-600">Water Temp</p>
                  <p className="font-medium">{sofarReading.waterTemp}°C</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FiDroplet className="text-blue-400 mr-2" />
                <div>
                  <p className="text-xs text-gray-600">Salinity</p>
                  <p className="font-medium">{sofarReading.salinity} PSU</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FiActivity className="text-purple-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-600">pH</p>
                  <p className="font-medium">{sofarReading.pH}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FiWind className="text-teal-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-600">Dissolved O₂</p>
                  <p className="font-medium">{sofarReading.dissolvedOxygen} mg/L</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Last updated: {new Date(sofarReading.timestamp).toLocaleString()}
              </p>
              <button 
                className="mt-2 w-full py-1 bg-green-50 text-green-700 rounded text-sm hover:bg-green-100"
                onClick={() => {
                  setSelectedLocation(data.id);
                  setPredictionType('marine-health');
                  makePrediction();
                }}
              >
                Assess health
              </button>
            </div>
          </div>
        );
        
      case 'air_quality':
        const airReading = data.readings as AirQualityReading;
        
        // Determine AQI color based on value
        let aqiColor = 'text-green-500';
        if (airReading.aqi > 100) aqiColor = 'text-red-500';
        else if (airReading.aqi > 50) aqiColor = 'text-yellow-500';
        
        return (
          <div key={data.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg">{data.name}</h3>
            <p className="text-xs text-gray-500 mb-3">Station ID: {data.id}</p>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">Air Quality Index:</span>
              <span className={`text-2xl font-bold ${aqiColor}`}>{airReading.aqi}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-400 mr-2"></div>
                <div>
                  <p className="text-xs text-gray-600">PM2.5</p>
                  <p className="font-medium">{airReading.pm25} µg/m³</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-600 mr-2"></div>
                <div>
                  <p className="text-xs text-gray-600">PM10</p>
                  <p className="font-medium">{airReading.pm10} µg/m³</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-purple-400 mr-2"></div>
                <div>
                  <p className="text-xs text-gray-600">Ozone</p>
                  <p className="font-medium">{airReading.o3} ppb</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-orange-400 mr-2"></div>
                <div>
                  <p className="text-xs text-gray-600">NO₂</p>
                  <p className="font-medium">{airReading.no2} ppb</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Last updated: {new Date(airReading.timestamp).toLocaleString()}
              </p>
              <button 
                className="mt-2 w-full py-1 bg-green-50 text-green-700 rounded text-sm hover:bg-green-100"
                onClick={() => {
                  setSelectedLocation(data.id);
                  setPredictionType('air-quality');
                  makePrediction();
                }}
              >
                Predict air quality
              </button>
            </div>
          </div>
        );
        
      default:
        return <div>Unknown data source</div>;
    }
  };
  
  // Render prediction results
  const renderPrediction = () => {
    if (!prediction) return null;
    
    // Render numerical prediction (air quality or water temperature)
    if ('current' in prediction) {
      const pred = prediction as PredictionResult;
      const trendIcon = pred.trend === 'increasing' 
        ? <FiArrowUp className="text-red-500" /> 
        : pred.trend === 'decreasing' 
          ? <FiArrowDown className="text-green-500" /> 
          : null;
          
      const confidenceColor = pred.confidence > 0.8 
        ? 'text-green-600' 
        : pred.confidence > 0.6 
          ? 'text-yellow-600' 
          : 'text-red-600';
          
      return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="font-semibold text-lg mb-3">Prediction Results</h3>
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600">Current value:</p>
              <p className="text-xl font-bold">{pred.current} {pred.units}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Predicted ({pred.timeframe}):</p>
              <div className="flex items-center">
                <p className="text-xl font-bold mr-1">{pred.prediction} {pred.units}</p>
                {trendIcon}
              </div>
            </div>
          </div>
          
          <div className="mb-2">
            <p className="text-sm text-gray-600 mb-1">Confidence level:</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  pred.confidence > 0.8 
                    ? 'bg-green-500' 
                    : pred.confidence > 0.6 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`} 
                style={{width: `${pred.confidence * 100}%`}}
              ></div>
            </div>
            <p className={`text-right text-xs ${confidenceColor} mt-1`}>
              {Math.round(pred.confidence * 100)}% confident
            </p>
          </div>
          
          <p className="text-sm mt-4">
            Prediction made using machine learning based on historical data patterns.
          </p>
        </div>
      );
    }
    
    // Render marine health assessment
    const health = prediction as MarineHealthResult;
    const healthColor = 
      health.risk === 'low' 
        ? 'text-green-600' 
        : health.risk === 'moderate' 
          ? 'text-yellow-600' 
          : 'text-red-600';
          
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="font-semibold text-lg mb-3">Marine Health Assessment</h3>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600">Health score:</p>
            <p className="text-xl font-bold">{health.healthScore}/100</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Risk level:</p>
            <p className={`text-xl font-bold ${healthColor}`}>{health.risk.toUpperCase()}</p>
          </div>
        </div>
        
        {health.factors.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Key factors:</p>
            <ul className="list-disc pl-5 text-sm">
              {health.factors.map((factor, i) => (
                <li key={i} className="mb-1">{factor}</li>
              ))}
            </ul>
          </div>
        )}
        
        {health.recommendations.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Recommendations:</p>
            <ul className="list-disc pl-5 text-sm">
              {health.recommendations.map((rec, i) => (
                <li key={i} className="mb-1">{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">Environmental Monitoring</h1>
        <p className="text-gray-600 mb-6">
          Real-time environmental data and ML-powered predictions for marine and air quality.
        </p>
        
        {/* Data source selector */}
        <div className="flex mb-6 overflow-x-auto pb-2">
          <button
            className={`px-4 py-2 rounded-md mr-3 font-medium ${
              dataSource === 'noaa_buoys' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            onClick={() => setDataSource('noaa_buoys')}
          >
            NOAA Smart Buoys
          </button>
          <button
            className={`px-4 py-2 rounded-md mr-3 font-medium ${
              dataSource === 'sofar_ocean' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            onClick={() => setDataSource('sofar_ocean')}
          >
            Sofar Ocean Spotters
          </button>
          <button
            className={`px-4 py-2 rounded-md mr-3 font-medium ${
              dataSource === 'air_quality' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            onClick={() => setDataSource('air_quality')}
          >
            Air Quality
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {/* ML prediction section */}
        {prediction && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">ML Analysis</h2>
            {renderPrediction()}
          </div>
        )}
        
        {/* Real-time data section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Real-time Data</h2>
            
            {/* Time selector for prediction timeframe */}
            <div className="flex space-x-2">
              <select
                className="border rounded p-1 text-sm"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as PredictionTimeframe)}
              >
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : environmentalData.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No data available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {environmentalData.map(data => renderDataCard(data))}
            </div>
          )}
        </div>
        
        <div className="mt-12 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About This Data</h2>
          <p className="text-sm text-gray-600 mb-4">
            The environmental data presented here is collected from various monitoring stations 
            and analyzed using machine learning to predict trends and assess ecological health.
          </p>
          
          <h3 className="text-md font-medium mb-1">Data Sources</h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
            <li>NOAA Smart Buoys - Ocean and atmospheric monitoring stations</li>
            <li>Sofar Ocean Spotters - Floating sensors for tracking ocean conditions</li>
            <li>Air Quality Monitoring Stations - Urban and rural air quality measurement</li>
          </ul>
          
          <p className="text-sm text-gray-600">
            Our ML models analyze current conditions and historical patterns to provide
            predictions on future changes and assess environmental health. These predictions
            can help guide conservation efforts and environmental decision-making.
          </p>
        </div>
      </main>
    </>
  );
} 