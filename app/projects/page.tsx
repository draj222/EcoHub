'use client'

import { useState, useEffect } from "react"
import Header from "@/app/components/Header"
import ProjectFeed from "@/app/components/ProjectFeed"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { FiGrid, FiClipboard, FiBookOpen, FiFilter } from "react-icons/fi"

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get("filter") || "latest"
  const [activeFilter, setActiveFilter] = useState(initialFilter)

  // Update the URL when filter changes
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("filter", activeFilter)
    window.history.pushState({}, "", url.toString())
  }, [activeFilter])

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
          <Link 
            href="/projects/create"
            className="bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-500 hover:to-green-700 transition flex items-center"
          >
            <span className="mr-2">+</span> New Project
          </Link>
        </div>
        
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap">
              <button 
                onClick={() => handleFilterChange("latest")}
                className={`py-3 px-4 font-medium text-sm border-b-2 ${
                  activeFilter === "latest" 
                    ? "border-green-500 text-green-500" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiGrid className="inline mr-2" />
                Latest
              </button>
              <button 
                onClick={() => handleFilterChange("popular")}
                className={`py-3 px-4 font-medium text-sm border-b-2 ${
                  activeFilter === "popular" 
                    ? "border-green-500 text-green-500" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiFilter className="inline mr-2" />
                Popular
              </button>
              <button 
                onClick={() => handleFilterChange("projects")}
                className={`py-3 px-4 font-medium text-sm border-b-2 ${
                  activeFilter === "projects" 
                    ? "border-green-500 text-green-500" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiClipboard className="inline mr-2" />
                Projects
              </button>
              <button 
                onClick={() => handleFilterChange("research")}
                className={`py-3 px-4 font-medium text-sm border-b-2 ${
                  activeFilter === "research" 
                    ? "border-green-500 text-green-500" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FiBookOpen className="inline mr-2" />
                Research
              </button>
            </div>
          </div>
        </div>
        
        <ProjectFeed />
      </div>
    </div>
  )
} 