'use client'

import { Suspense } from "react"
import Header from "@/app/components/Header"
import ProjectFeed from "@/app/components/ProjectFeed"
import ProjectFilters from "@/app/components/ProjectFilters"
import Link from "next/link"

export default function ProjectsPage() {
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
        
        <Suspense fallback={<div>Loading filters...</div>}>
          <ProjectFilters />
        </Suspense>
        
        <ProjectFeed />
      </div>
    </div>
  )
} 