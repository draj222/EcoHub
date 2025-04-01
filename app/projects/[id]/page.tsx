import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import { formatTags } from '@/app/lib/utils'
import { format } from 'date-fns'
import { FaCalendarAlt, FaTag, FaEdit } from 'react-icons/fa'
import CommentSection from '@/app/components/CommentSection'
import Header from '@/app/components/Header'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import ProjectLikeButton from '@/app/components/ProjectLikeButton'
import ProjectShareButton from '@/app/components/ProjectShareButton'

interface ProjectPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: true,
      },
    })

    if (!project) {
      return {
        title: 'Project Not Found',
      }
    }

    return {
      title: `${project.title} | EcoHub`,
      description: project.description,
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: 'Project | EcoHub',
    }
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;
    
    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      },
    })

    if (!project) {
      notFound()
    }

    // Check if the current user is the author
    const isAuthor = currentUserId === project.user.id;

    // Convert tags from string to array
    const tagArray = formatTags(project.tags);

    return (
      <main className="min-h-screen">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <nav className="text-sm mb-6 text-gray-500">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="hover:text-primary-500">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/projects" className="hover:text-primary-500">
                    Projects
                  </Link>
                </li>
                <li>/</li>
                <li className="text-gray-700 font-medium truncate max-w-[200px]">
                  {project.title}
                </li>
              </ol>
            </nav>

            {project.imageUrl && (
              <div className="relative w-full h-72 md:h-96 mb-8 rounded-xl overflow-hidden">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                />
                {project.category && (
                  <span className="absolute top-4 right-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm">
                    {project.category}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
              
              <div className="flex items-center gap-2">
                <ProjectLikeButton projectId={project.id} initialLikes={project._count.likes} />
                <ProjectShareButton projectId={project.id} projectTitle={project.title} />
                
                {isAuthor && (
                  <Link 
                    href={`/projects/${project.id}/edit`}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaEdit />
                    <span>Edit Project</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-8 text-sm text-gray-600">
              <div className="flex items-center space-x-3">
                <Link href={`/profile/${project.user.id}`} className="flex items-center space-x-2">
                  {project.user.image ? (
                    <div className="relative w-9 h-9 rounded-full overflow-hidden">
                      <Image
                        src={project.user.image}
                        alt={project.user.name || 'User'}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                        style={{ aspectRatio: "1/1" }}
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
                  )}
                  <span className="font-medium">{project.user.name}</span>
                </Link>
              </div>

              <div className="flex items-center space-x-1">
                <FaCalendarAlt className="text-gray-400" />
                <span>{format(new Date(project.createdAt), 'MMMM d, yyyy')}</span>
              </div>

              {tagArray.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <FaTag className="text-gray-400" />
                  {tagArray.map((tag) => (
                    <Link
                      key={tag}
                      href={`/projects?tag=${tag}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-3 py-1"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-gray-700 leading-relaxed mb-6">{project.description}</p>
              {project.content && <div>{project.content}</div>}
              {project.fileUrl && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-3">Attached File</h3>
                  <a
                    href={project.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Download Research Paper</span>
                  </a>
                </div>
              )}
            </div>

            <div id="comments">
              <CommentSection projectId={project.id} />
            </div>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error("Error loading project:", error);
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-8">We couldn't load this project. Please try again later.</p>
            <Link href="/" className="btn btn-primary">
              Go back home
            </Link>
          </div>
        </div>
      </main>
    )
  }
} 