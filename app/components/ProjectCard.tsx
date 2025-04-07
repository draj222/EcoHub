'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FiUser, FiHeart, FiMessageSquare } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { Project } from '@/app/interfaces'
import { estimateCarbonImpact } from '@/app/lib/ml-utils'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(project.likesCount || 0)
  const [carbonImpact, setCarbonImpact] = useState<number | null>(null)

  const handleLike = async () => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/projects/${project.id}/like`, {
      //   method: 'POST',
      // })
      
      // For now, just toggle the state
      if (liked) {
        setLikesCount(likesCount - 1)
      } else {
        setLikesCount(likesCount + 1)
      }
      setLiked(!liked)
    } catch (error) {
      console.error('Error liking project:', error)
    }
  }

  useEffect(() => {
    // Calculate carbon impact when the project loads
    const calculateImpact = async () => {
      const impact = await estimateCarbonImpact(
        project.description || '',
        project.category || 'Other'
      )
      setCarbonImpact(impact)
    }
    
    calculateImpact()
  }, [project])

  // Determine if the user has a valid profile image
  const hasUserImage = project.user?.image && 
    !project.user.image.includes('api.dicebear.com') && 
    project.user.image.trim() !== '';

  // Get the image source with type safety
  const userImageSrc = hasUserImage && project.user?.image ? project.user.image : '';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={project.imageUrl || "/placeholder-project.jpg"}
          alt={project.title}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">
          {project.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {project.description}
        </p>
        
        {carbonImpact !== null && (
          <div className="mt-2 text-xs flex items-center">
            <div className={`font-medium ${carbonImpact < 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {carbonImpact < 0 ? 'Est. Positive Impact' : 'Est. Neutral Impact'}: 
              <span className="ml-1">{Math.abs(carbonImpact)} CO₂e</span>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.isArray(project.tags) && project.tags.map((tag: string, index: number) => (
            <span
              key={index}
              className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex items-center">
            <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
              {hasUserImage ? (
                <Image
                  src={userImageSrc}
                  alt={project.user?.name || "User"}
                  fill
                  className="object-cover"
                  style={{ aspectRatio: "1/1" }}
                  priority
                />
              ) : (
                <div className="bg-green-100 w-full h-full flex items-center justify-center">
                  <FiUser className="text-green-500" />
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {project.user?.name || "Anonymous"}
            </span>
          </div>
          
          <div className="flex items-center text-gray-500 space-x-2">
            <div className="flex items-center">
              <FiHeart className="mr-1" />
              <span className="text-sm">{project.likesCount || 0}</span>
            </div>
            <div className="flex items-center">
              <FiMessageSquare className="mr-1" />
              <span className="text-sm">{project.commentsCount || 0}</span>
            </div>
          </div>
        </div>
        
        <Link 
          href={`/projects/${project.id}`}
          className="mt-4 block text-center bg-gradient-to-r from-green-400 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-500 hover:to-green-700 transition"
        >
          View Project
        </Link>
      </div>
    </div>
  )
} 