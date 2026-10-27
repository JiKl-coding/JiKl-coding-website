'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { translations } from '@/lib/i18n'
import HeaderToggle from './HeaderToggle'
import { useEffect, useState, useRef, useCallback } from 'react'

const Header = () => {
  const params = useParams()
  const locale = params.locale === 'en' ? 'en' : 'cs'
  const t = translations[locale]

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navItems = [
    { id: 'me', label: t.nav.me },
    { id: 'services', label: t.nav.services },
    { id: 'skills', label: t.nav.skills },
    { id: 'projects', label: t.nav.projects },
    { id: 'contact', label: t.nav.contact },
  ]

  const resetVisibilityTimer = useCallback(() => {
    setIsVisible(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (!isMenuOpen) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 3000)
    }
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

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
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
        <Link
          href={`/${locale}#hero`}
          onClick={() => setIsMenuOpen(false)}
        >
          JiKl-Coding
        </Link>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-center gap-4">
        <HeaderToggle locale={locale} />

        <nav className="flex gap-4 font-semibold text-2xl">
          {navItems.map(({ id, label }) => (
            <Link
              key={id}
              href={`/${locale}#${id}`}
              className="hover:underline"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile burger */}
      <button
        type="button"
        className="lg:hidden text-3xl"
        onClick={() => {
          setIsMenuOpen((open) => !open)
          setIsVisible(true)
        }}
        aria-label={
          locale === 'cs'
            ? isMenuOpen ? 'Zavřít menu' : 'Otevřít menu'
            : isMenuOpen ? 'Close menu' : 'Open menu'
        }
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
      >
        ☰
      </button>

      {/* Mobile menu */}
      {isMenuOpen && (
        <nav
          id="mobile-menu"
          className="absolute top-full left-0 w-full bg-[var(--background)] shadow-md shadow-gray-500/40 flex flex-col items-center py-4 lg:hidden z-40 font-semibold text-xl animate-slide-in"
        >
          <div className="flex flex-col items-center gap-4">
            <HeaderToggle locale={locale} />

            {navItems.map(({ id, label }) => (
              <Link
                key={id}
                href={`/${locale}#${id}`}
                className="hover:underline"
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header