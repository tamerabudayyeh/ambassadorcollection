import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeaturedPropertyCardProps {
  id: string
  name: string
  location: string
  image: string
  stars: number
  price: number
  className?: string
}

export function FeaturedPropertyCard({
  id,
  name,
  location,
  image,
  stars,
  price,
  className
}: FeaturedPropertyCardProps) {
  return (
    <div 
      className={cn(
        "group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <div className="relative h-60 w-full overflow-hidden">
        <Link href={`/hotels/${id}`}>
          <Image 
            src={image} 
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-serif tracking-tight truncate">{name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{stars}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground flex items-center mb-4">
          <MapPinIcon className="h-4 w-4 mr-1" />
          {location}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-semibold">${price}</span>
            <span className="text-muted-foreground text-sm"> / night</span>
          </div>
          <Link 
            href={`/hotels/${id}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}