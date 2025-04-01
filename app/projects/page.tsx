'use client'

export const dynamic = 'force-dynamic';

import { Suspense } from "react"
import Header from "@/app/components/Header"
import StaticProjectsPage from "@/app/components/StaticProjectsPage"

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <Suspense fallback={<div className="container mx-auto p-12 flex justify-center">Loading projects...</div>}>
        <StaticProjectsPage />
      </Suspense>
    </div>
  )
} 