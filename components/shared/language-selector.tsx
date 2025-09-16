'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  dir: 'ltr' | 'rtl'
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', dir: 'rtl' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇵🇸', dir: 'rtl' },
]

export function LanguageSelector() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0])

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    // Update document direction for RTL languages
    document.documentElement.dir = language.dir
    document.documentElement.lang = language.code
    
    // In a real implementation, this would:
    // 1. Update the i18n context
    // 2. Navigate to the localized route
    // 3. Store the preference in localStorage/cookies
    console.log(`Language changed to: ${language.name}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          data-testid="language-selector-trigger"
          aria-label={`Current language: ${currentLanguage.name}. Click to change language`}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.nativeName}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-testid="language-selector-menu">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className={`cursor-pointer ${currentLanguage.code === language.code ? 'bg-muted' : ''}`}
            data-testid={`language-option-${language.code}`}
          >
            <span className="mr-2">{language.flag}</span>
            <div className="flex flex-col">
              <span>{language.nativeName}</span>
              <span className="text-xs text-muted-foreground">{language.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Hook for getting current language in components
export function useLanguage() {
  // In a real implementation, this would use i18n context
  return {
    currentLanguage: 'en',
    languages,
    isRTL: false,
  }
}

// RTL-aware utility classes
export const rtlClasses = {
  textAlign: (isRTL: boolean) => isRTL ? 'text-right' : 'text-left',
  marginStart: (isRTL: boolean) => isRTL ? 'mr-' : 'ml-',
  marginEnd: (isRTL: boolean) => isRTL ? 'ml-' : 'mr-',
  paddingStart: (isRTL: boolean) => isRTL ? 'pr-' : 'pl-',
  paddingEnd: (isRTL: boolean) => isRTL ? 'pl-' : 'pr-',
  borderStart: (isRTL: boolean) => isRTL ? 'border-r-' : 'border-l-',
  borderEnd: (isRTL: boolean) => isRTL ? 'border-l-' : 'border-r-',
}