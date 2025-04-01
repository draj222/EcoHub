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
      <div className="container mx-auto px-4 py-16 bg-white">
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