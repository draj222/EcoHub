'use client';

import React from 'react'
import Link from 'next/link'
import { FiTrendingUp, FiWind, FiDroplet } from 'react-icons/fi'
import { WiDaySunny } from 'react-icons/wi'

const DashboardPreview = () => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-green-800">Latest Environmental Data</h3>
        <Link href="/environmental-dashboard" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
          View full dashboard <FiTrendingUp className="ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center text-yellow-500 mb-2">
            <WiDaySunny className="text-2xl mr-2" />
            <span className="font-medium">Air Quality</span>
          </div>
          <p className="text-gray-600">AQI: 42 - Good</p>
          <p className="text-xs text-gray-500 mt-2">Los Angeles, CA</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center text-blue-500 mb-2">
            <FiDroplet className="text-xl mr-2" />
            <span className="font-medium">Water Data</span>
          </div>
          <p className="text-gray-600">Temp: 18.2°C</p>
          <p className="text-xs text-gray-500 mt-2">Pacific Coast</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center text-green-500 mb-2">
            <FiWind className="text-xl mr-2" />
            <span className="font-medium">Climate Trends</span>
          </div>
          <p className="text-gray-600">↓ 5% CO2 emissions</p>
          <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPreview 