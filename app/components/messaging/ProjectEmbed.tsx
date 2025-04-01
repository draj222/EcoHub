'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiExternalLink, FiThumbsUp, FiMessageSquare } from 'react-icons/fi';

interface ProjectEmbedProps {
  projectId: string;
  projectTitle: string;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
}

export default function ProjectEmbed({ projectId, projectTitle }: ProjectEmbedProps) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch project data');
        }
        
        const data = await response.json();
        setProject({
          id: data.id,
          title: data.title,
          description: data.description || '',
          imageUrl: data.imageUrl,
          likesCount: data._count?.likes || 0,
          commentsCount: data._count?.comments || 0
        });
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Could not load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-3 animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-gray-100 rounded-lg p-3">
        <p className="text-sm">{projectTitle}</p>
        <Link href={`/projects/${projectId}`} className="text-green-600 text-xs flex items-center mt-2">
          <FiExternalLink className="mr-1" /> View project
        </Link>
      </div>
    );
  }

  return (
    <Link 
      href={`/projects/${projectId}`}
      className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
    >
      {project.imageUrl && (
        <div className="relative h-32 w-full">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>
      )}
      <div className="p-3">
        <h4 className="font-medium text-gray-900">{project.title}</h4>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{project.description}</p>
        
        <div className="flex items-center mt-2 text-xs text-gray-500">
          <span className="flex items-center mr-3">
            <FiThumbsUp className="mr-1" /> {project.likesCount}
          </span>
          <span className="flex items-center">
            <FiMessageSquare className="mr-1" /> {project.commentsCount}
          </span>
        </div>
      </div>
    </Link>
  );
} 