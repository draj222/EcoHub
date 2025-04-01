"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/app/components/Header";
import Link from "next/link";
import Image from "next/image";
import { 
  FiMapPin, 
  FiCalendar, 
  FiUsers, 
  FiPlus, 
  FiFilter,
  FiSearch,
  FiMessageSquare,
  FiChevronRight
} from "react-icons/fi";
import { format } from 'date-fns';
import { getImageUrl } from '../utils/imageUtils';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate?: string;
  category: string;
  skillsRequired?: string;
  maxParticipants?: number;
  imageUrl?: string;
  organizer: {
    id: string;
    name: string;
    image: string | null;
  };
  _count: {
    participants: number;
    comments: number;
  };
}

const CATEGORIES = [
  "All",
  "Cleanup",
  "Conservation",
  "Education",
  "Advocacy",
  "Research"
];

export default function CommunityPage() {
  const { data: session } = useSession();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  
  useEffect(() => {
    fetchOpportunities();
  }, [activeCategory, searchTerm, upcomingOnly]);
  
  const fetchOpportunities = async () => {
    try {
      setIsLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (activeCategory !== "All") {
        params.append('category', activeCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (upcomingOnly) {
        params.append('upcoming', 'true');
      }
      
      const response = await fetch(`/api/community/opportunities?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }
      
      const data = await response.json();
      setOpportunities(data.opportunities);
    } catch (err) {
      console.error("Error fetching opportunities:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 mb-10 text-white shadow-lg">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Volunteer Opportunities</h1>
          <p className="text-lg mb-6 max-w-2xl">
            Join environmental conservation efforts in your community. Find and participate in
            volunteer opportunities that make a real impact.
          </p>
          
          {session && (
            <Link
              href="/community/create"
              className="inline-flex items-center bg-white text-green-600 hover:bg-green-50 py-2 px-4 rounded-lg shadow-sm transition"
            >
              <FiPlus className="mr-2" />
              Create Opportunity
            </Link>
          )}
        </div>
        
        {/* Search and Filter Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search opportunities..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <FiSearch className="absolute left-3 top-2.5 text-gray-500" />
                <button type="submit" className="sr-only">Search</button>
              </form>
            </div>
            
            {/* Upcoming Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="upcomingFilter"
                checked={upcomingOnly}
                onChange={() => setUpcomingOnly(!upcomingOnly)}
                className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
              />
              <label htmlFor="upcomingFilter" className="text-gray-700">
                Show upcoming only
              </label>
            </div>
          </div>
          
          {/* Categories */}
          <div className="mt-4 flex overflow-x-auto pb-2">
            <div className="flex space-x-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    activeCategory === category
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } transition`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Opportunities List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <Link
                key={opportunity.id}
                href={`/community/${opportunity.id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {opportunity.imageUrl ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={getImageUrl(opportunity.imageUrl)}
                      alt={opportunity.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      {opportunity.category}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">{opportunity.category}</span>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {opportunity.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {opportunity.description}
                  </p>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <FiMapPin className="mr-1" />
                    <span className="line-clamp-1">{opportunity.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <FiCalendar className="mr-1" />
                    <span>
                      {format(new Date(opportunity.startDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-500 text-sm">
                      <FiUsers className="mr-1" />
                      <span>
                        {opportunity._count.participants} 
                        {opportunity.maxParticipants && ` / ${opportunity.maxParticipants}`} participants
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-sm">
                      <FiMessageSquare className="mr-1" />
                      <span>{opportunity._count.comments}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No volunteer opportunities found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || activeCategory !== "All"
                ? "Try changing your search or filter criteria."
                : "Be the first to create a volunteer opportunity!"}
            </p>
            
            {session && (
              <Link
                href="/community/create"
                className="inline-flex items-center text-white bg-green-600 hover:bg-green-700 py-2 px-4 rounded-lg shadow-sm transition"
              >
                <FiPlus className="mr-2" />
                Create Opportunity
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 