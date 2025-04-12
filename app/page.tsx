import Header from '@/app/components/Header'
import { FiBook, FiUsers, FiShare2, FiTrendingUp } from 'react-icons/fi'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-green-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700">
              Share your environmental
            </span> 
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
              projects and research papers
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-600">
            Connect with like-minded individuals. Share your environmental projects, research
            papers, and initiatives to make greater impact.
          </p>
          <div className="flex justify-center">
            <a 
              href="/projects" 
              className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition shadow-lg"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 md:py-24 container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Features that <span className="text-green-600">empower</span> environmental action
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <FiBook className="text-green-600 text-xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Research Papers</h3>
            <p className="text-gray-600">
              Share your research findings and read papers from other researchers to stay informed.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <FiUsers className="text-purple-600 text-xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-gray-600">
              Connect with environmentalists, researchers, and activists who share your passion.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <FiShare2 className="text-blue-600 text-xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Projects</h3>
            <p className="text-gray-600">
              Showcase your environmental projects and initiatives to gain support and participation.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <FiTrendingUp className="text-amber-600 text-xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Environmental Dashboard</h3>
            <p className="text-gray-600">
              Monitor environmental data, track trends, and access predictions for informed decision-making.
            </p>
          </div>
        </div>
      </div>

      {/* Environmental Dashboard Showcase */}
      <div className="py-12 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Environmental Dashboard
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Access real-time environmental data, track air quality, ocean conditions, and climate predictions in an interactive dashboard.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-gray-600">Ocean data including wave heights, water temperature, and salinity levels</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-gray-600">Air quality monitoring with AQI, PM2.5, and ozone measurements</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-gray-600">Climate predictions and trend analysis for future planning</p>
                </li>
              </ul>
              <a 
                href="/environmental-dashboard" 
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Explore Dashboard
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </a>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-teal-500 p-1">
                  <div className="bg-white rounded-lg p-4">
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <h3 className="text-xl font-semibold mb-3">Interactive Environmental Data</h3>
                      <p className="text-gray-600 mb-4">Visualize data from various sources in real-time</p>
                      <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-300 to-green-300 flex items-center justify-center">
                          <FiTrendingUp className="text-white text-3xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">What You Can Do on EcoHub</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-green-50 rounded-lg p-6 text-center shadow-md hover:shadow-lg transition">
              <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiBook className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Share Research</h3>
              <p className="text-gray-600">Publish your environmental research papers and get valuable feedback from the community.</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 text-center shadow-md hover:shadow-lg transition">
              <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiUsers className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Connect</h3>
              <p className="text-gray-600">Find and collaborate with other environmentalists, researchers, and enthusiasts.</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 text-center shadow-md hover:shadow-lg transition">
              <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiShare2 className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Showcase Projects</h3>
              <p className="text-gray-600">Highlight your environmental projects and initiatives to gain visibility and support.</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 text-center shadow-md hover:shadow-lg transition">
              <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Make Impact</h3>
              <p className="text-gray-600">Create meaningful change by connecting your work with a global community of changemakers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 