'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function SignInMessage() {
  const searchParams = useSearchParams()
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Show success message if redirected from signup
    const registered = searchParams.get('registered')
    if (registered === 'true') {
      setSuccessMessage('Account created successfully! Please sign in.')
    }
  }, [searchParams])

  if (!successMessage) return null

  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      {successMessage}
    </div>
  )
} 