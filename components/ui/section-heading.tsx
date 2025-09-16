import React from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  center?: boolean
  className?: string
}

export function SectionHeading({ 
  title, 
  subtitle, 
  center = false,
  className
}: SectionHeadingProps) {
  return (
    <div className={cn(
      'space-y-2 mb-8',
      center && 'text-center',
      className
    )}>
      <h2 className="text-3xl md:text-4xl font-serif tracking-tight">{title}</h2>
      {subtitle && (
        <p className="text-muted-foreground max-w-3xl">
          {subtitle}
        </p>
      )}
    </div>
  )
}