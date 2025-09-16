import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LocationHighlightProps {
  name: string
  image: string
  description: string
  index: number
}

export function LocationHighlight({ 
  name, 
  image, 
  description,
  index
}: LocationHighlightProps) {
  return (
    <div 
      className={cn(
        "flex flex-col md:flex-row items-center group",
        index % 2 === 1 && "md:flex-row-reverse"
      )}
      data-aos="fade-up"
      data-aos-delay={index * 100}
    >
      <div className="w-full md:w-1/2 relative overflow-hidden rounded-lg">
        <Image 
          src={image} 
          alt={name}
          width={600}
          height={400}
          className="w-full h-64 md:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      </div>
      
      <div className={cn(
        "w-full md:w-1/2 p-6 md:p-12",
        index % 2 === 0 ? "md:pl-16" : "md:pr-16"
      )}>
        <h3 className="text-2xl md:text-3xl font-serif mb-4">{name}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        <Link
          href="/hotels"
          className="inline-flex items-center text-primary font-medium hover:underline"
        >
          Discover our hotels in {name}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M14 5l7 7m0 0l-7 7m7-7H3" 
            />
          </svg>
        </Link>
      </div>
    </div>
  )
}