'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface ClerkErrorBoundaryProps {
  children: ReactNode
}

export default function ClerkErrorBoundary({ children }: ClerkErrorBoundaryProps) {
  // Only check on client side to avoid build issues
  if (typeof window !== 'undefined') {
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    
    if (!clerkKey || clerkKey === '' || clerkKey.includes('placeholder')) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
          <Card className="bg-gray-800/50 border-gray-700 max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Configuration Required</h3>
              <p className="text-gray-400 mb-6">
                Clerk authentication is not configured properly. Please add your Clerk API keys to the .env.local file.
              </p>
              <div className="bg-gray-900/50 p-4 rounded-lg text-left">
                <p className="text-sm text-gray-300 mb-2">Add to .env.local:</p>
                <code className="text-xs text-green-400 block">
                  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
                  <br />
                  CLERK_SECRET_KEY=sk_test_...
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return <>{children}</>
}
