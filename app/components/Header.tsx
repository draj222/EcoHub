'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiPlus } from 'react-icons/fi'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [profileImageKey, setProfileImageKey] = useState(Date.now())
  const pathname = usePathname()
  
  // Refresh the component when session changes
  useEffect(() => {
    // Force image refresh when session changes
    setProfileImageKey(Date.now())
  }, [session?.user?.image])
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
    if (profileMenuOpen) setProfileMenuOpen(false)
  }
  
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen)
  }
  
  const handleSignOut = () => {
    signOut()
  }

  // Determine if the user has a valid profile image
  const hasUserImage = session?.user?.image && 
    session.user.image.trim() !== '';

  // Get the image source with type safety
  const userImageSrc = hasUserImage && session?.user?.image ? session.user.image : '';
  const isBase64Image = userImageSrc.startsWith('data:image');
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-green-600 tracking-tight">EcoHub</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-green-600">Home</Link>
            <Link href="/projects" className="text-gray-600 hover:text-green-600">Projects</Link>
            <Link href="/community" className="text-gray-600 hover:text-green-600">Volunteer</Link>
            {session && (
              <Link href="/messages" className="text-gray-600 hover:text-green-600">Messages</Link>
            )}
            <Link href="/about" className="text-gray-600 hover:text-green-600">About</Link>
          </nav>
          
          {/* Auth Buttons or Profile */}
          <div className="flex items-center">
            {session ? (
              <div className="relative ml-3">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center focus:outline-none"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-green-100">
                    {hasUserImage ? (
                      <Image
                        key={profileImageKey}
                        src={userImageSrc}
                        alt={session.user.name || "User"}
                        fill
                        className="object-cover"
                        style={{ aspectRatio: "1/1" }}
                        priority
                        unoptimized={isBase64Image}
                      />
                    ) : (
                      <div className="bg-green-100 w-full h-full flex items-center justify-center">
                        <FiUser className="text-green-500" />
                      </div>
                    )}
                  </div>
                </button>
                
                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <FiUser className="inline mr-2" />
                      Profile
                    </Link>
                    <Link
                      href="/projects/create"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <FiPlus className="inline mr-2" />
                      New Project
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <FiSettings className="inline mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="inline mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/signin"
                  className="bg-white border border-green-600 text-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                >
                  Sign up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="ml-4 md:hidden text-gray-600 hover:text-green-600 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-green-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/projects" 
                className="text-gray-600 hover:text-green-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Projects
              </Link>
              <Link 
                href="/community" 
                className="text-gray-600 hover:text-green-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Volunteer
              </Link>
              {session && (
                <Link 
                  href="/messages" 
                  className="text-gray-600 hover:text-green-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
              )}
              <Link 
                href="/about" 
                className="text-gray-600 hover:text-green-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              
              {!session && (
                <div className="pt-2 border-t border-gray-100">
                  <Link
                    href="/signin"
                    className="inline-block w-full text-center bg-white border border-green-600 text-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-block w-full text-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 