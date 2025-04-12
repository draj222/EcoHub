'use client';

import { useState, useEffect } from 'react';
import {
  GeoLocation,
  BuoyReading,
  SofarReading,
  AirQualityReading,
  PredictionResults,
  fetchBuoyData,
  fetchSofarData,
  fetchAirQualityData,
  getPredictions,
  PREDEFINED_LOCATIONS
} from '../lib/api/environmental-data';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { FiDroplet, FiWind, FiThermometer, FiBarChart2 } from 'react-icons/fi';
import { WiHumidity } from 'react-icons/wi';
import { TbGauge, TbCurrentLocation } from 'react-icons/tb';
import { IoWaterOutline } from 'react-icons/io5';
import { MdOutlineAir, MdWaterDrop } from 'react-icons/md';
import { RiPlantLine } from 'react-icons/ri';
import { FiCloudRain, FiActivity, FiTrendingUp } from 'react-icons/fi';

type Location = 'hawaii' | 'california' | 'florida';

interface BuoyData {
  date: string;
  waveHeight: number;
  waterTemp: number;
  windSpeed: number;
}

interface SofarData {
  date: string;
  oceanTemp: number;
  salinity: number;
  currentSpeed: number;
  pH: number;
}

interface AirQualityData {
  date: string;
  aqi: number;
  pm25: number;
  ozone: number;
  quality: string;
}

interface PredictionData {
  date: string;
  temperature: number;
  precipitation: number;
  co2Level: number;
  seaLevel: number;
}

const EnvironmentalDashboard = () => {
  const [location, setLocation] = useState<Location>('hawaii');
  const [buoyData, setBuoyData] = useState<BuoyData[]>([]);
  const [sofarData, setSofarData] = useState<SofarData[]>([]);
  const [airQualityData, setAirQualityData] = useState<AirQualityData[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [buoyRes, sofarRes, airQualityRes, predictionsRes] = await Promise.all([
          fetch(`/api/environment/buoy?location=${location}&days=${days}`),
          fetch(`/api/environment/sofar?location=${location}&days=${days}`),
          fetch(`/api/environment/air-quality?location=${location}&days=${days}`),
          fetch(`/api/environment/predictions?location=${location}&days=${days}`)
        ]);

        const buoyJson = await buoyRes.json();
        const sofarJson = await sofarRes.json();
        const airQualityJson = await airQualityRes.json();
        const predictionsJson = await predictionsRes.json();

        if (buoyJson.success) setBuoyData(buoyJson.data);
        if (sofarJson.success) setSofarData(sofarJson.data);
        if (airQualityJson.success) setAirQualityData(airQualityJson.data);
        if (predictionsJson.success) setPredictions(predictionsJson.data);
      } catch (error) {
        console.error("Error fetching environmental data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location, days]);

  const formatBuoyData = (data: BuoyData[]) => {
    return data.map(item => ({
      ...item,
      date: item.date.split('T')[0]
    }));
  };

  const formatSofarData = (data: SofarData[]) => {
    return data.map(item => ({
      ...item,
      date: item.date.split('T')[0]
    }));
  };

  const formatAirQualityData = (data: AirQualityData[]) => {
    return data.map(item => ({
      ...item,
      date: item.date.split('T')[0]
    }));
  };

  const formatPredictionData = (data: PredictionData[]) => {
    return data.map(item => ({
      ...item,
      date: item.date.split('T')[0]
    }));
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-500';
    if (aqi <= 150) return 'text-orange-500';
    if (aqi <= 200) return 'text-red-500';
    if (aqi <= 300) return 'text-purple-500';
    return 'text-rose-700';
  };

  const capitalizeLocation = (loc: string) => {
    return loc.charAt(0).toUpperCase() + loc.slice(1);
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setLocation('hawaii')}
          className={`px-4 py-2 rounded-full ${
            location === 'hawaii' ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}
        >
          Hawaii
        </button>
        <button
          onClick={() => setLocation('california')}
          className={`px-4 py-2 rounded-full ${
            location === 'california' ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}
        >
          California
        </button>
        <button
          onClick={() => setLocation('florida')}
          className={`px-4 py-2 rounded-full ${
            location === 'florida' ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}
        >
          Florida
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setDays(7)}
          className={`px-4 py-2 rounded-full ${
            days === 7 ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => setDays(14)}
          className={`px-4 py-2 rounded-full ${
            days === 14 ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          14 Days
        </button>
        <button
          onClick={() => setDays(30)}
          className={`px-4 py-2 rounded-full ${
            days === 30 ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          30 Days
        </button>
      </div>

      {loading ? (
        <div className="w-full flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Ocean Data Section */}
          <div className="bg-white rounded-lg shadow-md p-4 col-span-1 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <IoWaterOutline className="mr-2 text-blue-500" size={24} />
              Ocean Data for {capitalizeLocation(location)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Buoy Data Card */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Buoy Measurements</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiDroplet className="text-blue-500 mr-2" size={20} />
                      <span>Wave Height</span>
                    </div>
                    <span className="font-medium">
                      {buoyData.length > 0 ? `${buoyData[buoyData.length-1].waveHeight} m` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiThermometer className="text-red-500 mr-2" size={20} />
                      <span>Water Temperature</span>
                    </div>
                    <span className="font-medium">
                      {buoyData.length > 0 ? `${buoyData[buoyData.length-1].waterTemp}°C` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiWind className="text-gray-500 mr-2" size={20} />
                      <span>Wind Speed</span>
                    </div>
                    <span className="font-medium">
                      {buoyData.length > 0 ? `${buoyData[buoyData.length-1].windSpeed} kn` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SOFAR Data Card */}
              <div className="bg-cyan-50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">SOFAR Ocean Data</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiThermometer className="text-red-500 mr-2" size={20} />
                      <span>Ocean Temperature</span>
                    </div>
                    <span className="font-medium">
                      {sofarData.length > 0 ? `${sofarData[sofarData.length-1].oceanTemp}°C` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MdWaterDrop className="text-blue-500 mr-2" size={20} />
                      <span>Salinity</span>
                    </div>
                    <span className="font-medium">
                      {sofarData.length > 0 ? `${sofarData[sofarData.length-1].salinity} PSU` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TbCurrentLocation className="text-cyan-500 mr-2" size={20} />
                      <span>Current Speed</span>
                    </div>
                    <span className="font-medium">
                      {sofarData.length > 0 ? `${sofarData[sofarData.length-1].currentSpeed} m/s` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TbGauge className="text-green-500 mr-2" size={20} />
                      <span>pH Level</span>
                    </div>
                    <span className="font-medium">
                      {sofarData.length > 0 ? sofarData[sofarData.length-1].pH : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wave Height Chart */}
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h3 className="text-lg font-medium mb-3">Wave Height Trend</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatBuoyData(buoyData)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="waveHeight" 
                        stroke="#3b82f6" 
                        name="Wave Height (m)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Air Quality Section */}
          <div className="bg-white rounded-lg shadow-md p-4 col-span-1 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MdOutlineAir className="mr-2 text-sky-500" size={24} />
              Air Quality for {capitalizeLocation(location)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* AQI Card */}
              <div className="bg-sky-50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Current Air Quality</h3>
                {airQualityData.length > 0 && (
                  <div className="text-center mb-4">
                    <div className={`text-5xl font-bold ${getAQIColor(airQualityData[airQualityData.length-1].aqi)}`}>
                      {airQualityData[airQualityData.length-1].aqi}
                    </div>
                    <div className="text-lg mt-2 font-medium">
                      {airQualityData[airQualityData.length-1].quality}
                    </div>
                  </div>
                )}
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiActivity className="text-purple-500 mr-2" size={20} />
                      <span>PM2.5</span>
                    </div>
                    <span className="font-medium">
                      {airQualityData.length > 0 ? `${airQualityData[airQualityData.length-1].pm25} µg/m³` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MdOutlineAir className="text-blue-500 mr-2" size={20} />
                      <span>Ozone</span>
                    </div>
                    <span className="font-medium">
                      {airQualityData.length > 0 ? `${airQualityData[airQualityData.length-1].ozone} ppb` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* AQI Chart */}
              <div className="bg-white rounded-lg p-4 border border-sky-100 md:col-span-2">
                <h3 className="text-lg font-medium mb-3">Air Quality Index Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatAirQualityData(airQualityData)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="aqi" 
                        stroke="#8b5cf6" 
                        name="AQI"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pm25" 
                        stroke="#06b6d4" 
                        name="PM2.5 (µg/m³)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ozone" 
                        stroke="#0ea5e9" 
                        name="Ozone (ppb)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Predictions Section */}
          <div className="bg-white rounded-lg shadow-md p-4 col-span-1 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiTrendingUp className="mr-2 text-green-500" size={24} />
              Environmental Predictions for {capitalizeLocation(location)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prediction Cards */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Key Predictions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiThermometer className="text-red-500 mr-2" size={20} />
                      <span>Temperature Trend</span>
                    </div>
                    <span className="font-medium">
                      {predictions.length > 0 ? 
                        `${predictions[0].temperature}°C → ${predictions[predictions.length-1].temperature}°C` : 
                        'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiCloudRain className="text-blue-500 mr-2" size={20} />
                      <span>Precipitation Change</span>
                    </div>
                    <span className="font-medium">
                      {predictions.length > 0 ? 
                        `${(predictions[predictions.length-1].precipitation - predictions[0].precipitation).toFixed(1)}mm` : 
                        'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <RiPlantLine className="text-green-500 mr-2" size={20} />
                      <span>CO2 Level</span>
                    </div>
                    <span className="font-medium">
                      {predictions.length > 0 ? 
                        `${predictions[0].co2Level} → ${predictions[predictions.length-1].co2Level} ppm` : 
                        'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <WiHumidity className="text-cyan-500 mr-2" size={20} />
                      <span>Sea Level Change</span>
                    </div>
                    <span className="font-medium">
                      {predictions.length > 0 ? 
                        `+${predictions[predictions.length-1].seaLevel.toFixed(2)} cm` : 
                        'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prediction Chart */}
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h3 className="text-lg font-medium mb-3">CO2 Level Projection</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatPredictionData(predictions)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="co2Level" 
                        stroke="#22c55e" 
                        name="CO2 (ppm)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentalDashboard; 