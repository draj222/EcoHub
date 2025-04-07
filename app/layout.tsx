import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import AuthProvider from './providers/AuthProvider'
import EcoBot from "./components/EcoBot"

// Add dynamic export
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EcoHub - Connect and Collaborate on Green Initiatives',
  description: 'A platform for sharing and collaborating on environmental projects and connecting with like-minded eco-enthusiasts',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <EcoBot />
        </AuthProvider>
      </body>
    </html>
  )
} 