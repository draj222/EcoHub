'use client';

import { useEffect, useState } from 'react';
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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface EnvironmentalData {
  timestamp: string;
  noaa: {
    waterTemperature: number;
    station: string;
    units: string;
  } | null;
  sofar: {
    waveHeight: number;
    wavePeriod: number;
    windSpeed: number;
    windDirection: number;
  } | null;
}

export default function EnvironmentalDataPage() {
  const [data, setData] = useState<EnvironmentalData | null>(null);
  const [temperatureHistory, setTemperatureHistory] = useState<{ time: string; value: number }[]>([]);
  const [waveHistory, setWaveHistory] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/environmental-data');
        const newData = await response.json();
        setData(newData);

        // Update history
        if (newData.noaa?.waterTemperature) {
          setTemperatureHistory(prev => [
            ...prev.slice(-11),
            { time: new Date().toLocaleTimeString(), value: newData.noaa.waterTemperature }
          ]);
        }

        if (newData.sofar?.waveHeight) {
          setWaveHistory(prev => [
            ...prev.slice(-11),
            { time: new Date().toLocaleTimeString(), value: newData.sofar.waveHeight }
          ]);
        }
      } catch (error) {
        console.error('Error fetching environmental data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const temperatureChartData = {
    labels: temperatureHistory.map(item => item.time),
    datasets: [
      {
        label: 'Water Temperature (°F)',
        data: temperatureHistory.map(item => item.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const waveChartData = {
    labels: waveHistory.map(item => item.time),
    datasets: [
      {
        label: 'Wave Height (m)',
        data: waveHistory.map(item => item.value),
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Real-Time Environmental Data</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* NOAA Data */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">NOAA Water Temperature</h2>
          {data?.noaa ? (
            <>
              <p className="text-4xl font-bold mb-2">
                {data.noaa.waterTemperature}°{data.noaa.units}
              </p>
              <p className="text-gray-600">Station: {data.noaa.station}</p>
              <div className="mt-4 h-64">
                <Line data={temperatureChartData} />
              </div>
            </>
          ) : (
            <p className="text-gray-500">No NOAA data available</p>
          )}
        </div>

        {/* Sofar Data */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sofar Ocean Data</h2>
          {data?.sofar ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Wave Height</p>
                  <p className="text-2xl font-bold">{data.sofar.waveHeight}m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Wave Period</p>
                  <p className="text-2xl font-bold">{data.sofar.wavePeriod}s</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Wind Speed</p>
                  <p className="text-2xl font-bold">{data.sofar.windSpeed}m/s</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Wind Direction</p>
                  <p className="text-2xl font-bold">{data.sofar.windDirection}°</p>
                </div>
              </div>
              <div className="mt-4 h-64">
                <Line data={waveChartData} />
              </div>
            </>
          ) : (
            <p className="text-gray-500">No Sofar data available</p>
          )}
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'Never'}
      </div>
    </div>
  );
} 