'use client'

import { useParams } from 'next/navigation'
import { translations } from '@/lib/i18n'
import HeaderToggle from './HeaderToggle'
import { useEffect, useState, useRef, useCallback } from 'react'

const Header = () => {
  const { locale } = useParams()
  const t = translations[locale as 'cs' | 'en'] ?? translations.cs

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const hideTimer = 3000

  const resetVisibilityTimer = useCallback(() => {
    setIsVisible(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      // Header se neschová, pokud je otevřené menu
      if (!isMenuOpen) {
        setIsVisible(false)
      }
    }, hideTimer)
  }, [isMenuOpen])

  useEffect(() => {
    const onInteraction = () => {
      resetVisibilityTimer()
    }

    document.addEventListener('scroll', onInteraction)
    document.addEventListener('click', onInteraction)

    resetVisibilityTimer()

    return () => {
      document.removeEventListener('scroll', onInteraction)
      document.removeEventListener('click', onInteraction)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [resetVisibilityTimer])

  return (
    <header
      className={`
        fixed top-0 left-0 z-50 w-full 
        px-8 xl:px-32 py-4 h-[100px] 
        flex justify-between items-center
        shadow-md shadow-gray-500/80 
        bg-[var(--background)]
        transition-transform duration-500 transform-gpu will-change-transform 
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <div className="text-3xl sm:text-4xl font-black hover:underline">
        <a href="#hero">JiKl-Coding</a>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-center gap-4">
        <HeaderToggle locale={locale as string} />
        <nav className="flex gap-4 font-semibold text-2xl">
          <a href="#me" className="hover:underline">{t.nav.me}</a>
          <a href="#skills" className="hover:underline">{t.nav.skills}</a>
          <a href="#projects" className="hover:underline">{t.nav.projects}</a>
          <a href="#contact" className="hover:underline">{t.nav.contact}</a>
        </nav>
      </div>

      {/* Mobile burger */}
      <button
        className="lg:hidden text-3xl"
        onClick={() => {
          const next = !isMenuOpen
          setIsMenuOpen(next)
          setIsVisible(true) // vždy zobrazit header při otevření
        }}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[var(--background)] shadow-md shadow-gray-500/40 flex flex-col items-center py-4 lg:hidden z-40 font-semibold text-xl animate-slide-in">
          <div className="flex flex-col items-center gap-4">
            <HeaderToggle locale={locale as string} />
            <a href="#me" onClick={() => setIsMenuOpen(false)}>{t.nav.me}</a>
            <a href="#skills" onClick={() => setIsMenuOpen(false)}>{t.nav.skills}</a>
            <a href="#projects" onClick={() => setIsMenuOpen(false)}>{t.nav.projects}</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)}>{t.nav.contact}</a>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
