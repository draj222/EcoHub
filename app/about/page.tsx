'use client'

import React from 'react'
import Header from '@/app/components/Header'
import Image from 'next/image'
import Link from 'next/link'
import { FiUsers, FiLayers, FiMessageSquare, FiHeart, FiGlobe, FiBook, FiMail } from 'react-icons/fi'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About EcoHub</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connecting environmentally conscious individuals to share ideas, projects, and create meaningful change together.
            </p>
          </div>
          
          {/* Mission Statement */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-12 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
                <p className="text-gray-600 mb-6">
                  EcoHub is dedicated to creating a collaborative community where environmental enthusiasts, 
                  researchers, activists, and curious minds can connect, share knowledge, and work together 
                  on innovative solutions to address our planet's most pressing challenges.
                </p>
                <p className="text-gray-600">
                  We believe that by fostering open communication and sharing of ideas, we can accelerate 
                  progress toward a more sustainable future and inspire collective action on environmental issues.
                </p>
              </div>
              <div className="relative h-64 md:h-full rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000"
                  alt="Nature landscape with lush green forest and mountains"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Platform Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">3,500+</div>
              <div className="text-gray-600 text-sm">Community Members</div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">750+</div>
              <div className="text-gray-600 text-sm">Projects Shared</div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">40+</div>
              <div className="text-gray-600 text-sm">Forum Topics</div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">15k+</div>
              <div className="text-gray-600 text-sm">Messages Exchanged</div>
            </div>
          </div>
          
          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Platform Features</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <FiLayers className="text-green-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Project Sharing</h3>
                </div>
                <p className="text-gray-600">
                  Share your environmental projects, research papers, and innovations with our community.
                  Receive feedback, gather support, and inspire others.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <FiUsers className="text-green-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Community Forums</h3>
                </div>
                <p className="text-gray-600">
                  Engage in topic-specific forums to discuss environmental issues, share insights,
                  and collaborate with others who share your interests.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <FiMessageSquare className="text-green-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Direct Messaging</h3>
                </div>
                <p className="text-gray-600">
                  Connect one-on-one with fellow environmentalists through our secure messaging system.
                  Build meaningful relationships and collaborative partnerships.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <FiHeart className="text-green-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Interactive Engagement</h3>
                </div>
                <p className="text-gray-600">
                  Like, comment, and follow projects and users that inspire you. Stay updated on the
                  latest developments in your areas of interest.
                </p>
              </div>
            </div>
          </div>
          
          {/* Values Section */}
          <div className="bg-green-50 rounded-xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Our Values</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
                  <FiGlobe className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Sustainability</h3>
                  <p className="text-gray-600">
                    We're committed to promoting sustainable practices and solutions that minimize environmental impact
                    and preserve natural resources for future generations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
                  <FiUsers className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Collaboration</h3>
                  <p className="text-gray-600">
                    We believe that the most effective solutions emerge when diverse perspectives come together
                    in a spirit of cooperation and mutual respect.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
                  <FiBook className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Knowledge Sharing</h3>
                  <p className="text-gray-600">
                    We encourage the open exchange of information, research, and ideas to accelerate learning
                    and innovation in environmental science and sustainability.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Meet the Creator</h2>
            
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 relative h-64 md:h-auto bg-gradient-to-br from-green-500 to-green-700">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-white/20 backdrop-blur-sm">
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl font-bold text-white">DT</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-white mt-4">Dheeraj Tallapragada</h3>
                      <p className="text-green-100 mt-1">Founder & Developer</p>
                    </div>
                  </div>
                </div>
                <div className="md:w-2/3 p-8">
                  <div className="prose max-w-none">
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Computer Science major at the University of Washington, Seattle, passionate about the intersection between machine learning and environmental sustainability.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      Dedicated to advocating for environmental change through technology, Dheeraj created EcoHub to connect like-minded individuals and facilitate collaboration on sustainable solutions to our world's most pressing environmental challenges.
                    </p>
                    <div className="mt-6 space-y-3">
                      <Link
                        href="https://www.linkedin.com/in/dheeraj-tallapragada-685371232/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer w-full justify-center"
                      >
                        <FiUsers className="mr-2" /> Connect on LinkedIn
                      </Link>
                      <a
                        href="mailto:tsaidheeraj@gmail.com" 
                        className="inline-flex items-center px-4 py-2 bg-white text-green-600 border border-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors cursor-pointer w-full justify-center"
                      >
                        <FiMail className="mr-2" /> Email Me
                      </a>
                      <Link
                        href="https://hidheeraj.com" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 border border-gray-300 font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer w-full justify-center"
                      >
                        <FiGlobe className="mr-2" /> Check Out My Website
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Join Us CTA */}
          <div className="text-center bg-white rounded-xl shadow-md p-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Our Community Today</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Whether you're a seasoned environmental professional, a passionate activist, or simply curious about
              sustainable living, there's a place for you in the EcoHub community.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/signup" 
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Sign Up Now
              </Link>
              <Link 
                href="/projects" 
                className="px-6 py-3 bg-white text-green-600 font-medium rounded-lg border border-green-600 hover:bg-green-50 transition-colors"
              >
                Explore Projects
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 