import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { constructMetadata, getViewport } from '@/components/shared/seo'

export const metadata = constructMetadata({
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found. Return to the Ambassador Collection homepage to explore our luxury hotel offerings.',
})

export const viewport = getViewport()

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" role="main" aria-labelledby="not-found-title">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-gray-200 mb-4" aria-hidden="true">404</h1>
          <h2 id="not-found-title" className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you are looking for could not be found. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        
        <nav aria-label="Recovery options" className="space-y-4">
          <Button asChild className="w-full" data-testid="not-found-home-button">
            <Link href="/" aria-describedby="home-description">
              Return to Homepage
            </Link>
          </Button>
          <span id="home-description" className="sr-only">Go back to the main page of Ambassador Collection</span>
          
          <Button asChild variant="outline" className="w-full" data-testid="not-found-hotels-button">
            <Link href="/hotels" aria-describedby="hotels-description">
              Browse Hotels
            </Link>
          </Button>
          <span id="hotels-description" className="sr-only">View our collection of luxury hotels</span>
          
          <Button asChild variant="ghost" className="w-full" data-testid="not-found-contact-button">
            <Link href="/contact" aria-describedby="contact-description">
              Contact Us
            </Link>
          </Button>
          <span id="contact-description" className="sr-only">Get in touch with our support team</span>
        </nav>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact our team at{' '}
            <a 
              href="mailto:info@ambassadorcollection.com" 
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="not-found-email-link"
              aria-label="Send email to Ambassador Collection support"
            >
              info@ambassadorcollection.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}