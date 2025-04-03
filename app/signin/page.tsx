'use client'

import { useState, Suspense, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import SignInMessage from '@/app/components/SignInMessage'
import { FaEnvelope, FaLock, FaExclamationTriangle } from 'react-icons/fa'

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [detailedError, setDetailedError] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugMode, setDebugMode] = useState(false)

  // Parse error from URL if present
  useEffect(() => {
    const errorParam = searchParams?.get('error')
    if (errorParam) {
      setError('Authentication error: ' + errorParam)
      setDetailedError('Check console logs for more details')
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setDetailedError('')
    setLoading(true)

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password')
      setLoading(false)
      return
    }

    try {
      console.log('Attempting to sign in with credentials...')
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      console.log('Sign in result:', result)

      if (result?.error) {
        setError('Sign-in failed')
        setDetailedError(result.error)
        setLoading(false)
        return
      }

      // Redirect to home page after successful login
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Sign in error:', err)
      setError('An error occurred during sign in')
      setDetailedError(String(err))
      setLoading(false)
    }
  }

  const runDiagnostics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/debug')
      const data = await response.json()
      console.log('Diagnostics result:', data)
      setDetailedError(JSON.stringify(data, null, 2))
      setLoading(false)
    } catch (error) {
      console.error('Diagnostics error:', error)
      setDetailedError(String(error))
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary-600 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to continue to EcoHub</p>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
              <SignInMessage />
            </Suspense>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <div className="flex items-center mb-1">
                  <FaExclamationTriangle className="mr-2" />
                  <span className="font-medium">{error}</span>
                </div>
                {detailedError && debugMode && (
                  <pre className="text-xs mt-2 bg-red-50 p-2 rounded overflow-auto max-h-40">
                    {detailedError}
                  </pre>
                )}
                <div className="mt-2 text-xs flex justify-between items-center">
                  <button 
                    onClick={() => setDebugMode(!debugMode)}
                    className="text-red-700 hover:text-red-800 underline"
                  >
                    {debugMode ? 'Hide details' : 'Show details'}
                  </button>
                  <button 
                    onClick={runDiagnostics}
                    className="text-red-700 hover:text-red-800 underline"
                  >
                    Run diagnostics
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-sm text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full btn btn-primary py-3"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700"
                >
                  <svg className="h-5 w-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  Google
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 