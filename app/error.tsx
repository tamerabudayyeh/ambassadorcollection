'use client'

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <div className="text-6xl font-light text-muted-foreground mb-4">500</div>
          <h1 className="text-2xl font-serif mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-8">
            We're experiencing some technical difficulties. Our team has been notified and we're working to fix this issue.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={reset}
            className="w-full"
            data-testid="error-retry-button"
          >
            Try again
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/'}
            data-testid="error-home-button"
          >
            Go to Homepage
          </Button>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Need immediate assistance?
            </p>
            <div className="flex gap-2 justify-center">
              <a 
                href="tel:+972-2-123-4567"
                className="text-sm text-primary hover:underline"
                data-testid="error-phone-link"
              >
                Call us
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href="mailto:support@ambassadorcollection.com"
                className="text-sm text-primary hover:underline"
                data-testid="error-email-link"
              >
                Email support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}