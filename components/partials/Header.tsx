'use client'

import { useParams } from 'next/navigation'
import { translations } from '@/lib/i18n'
import HeaderToggle from './HeaderToggle'
import { useState } from 'react'

const Header = () => {
  const { locale } = useParams()
  const t = translations[locale as 'cs' | 'en'] ?? translations.cs
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 px-8 xl:px-32 flex justify-between items-center py-4 h-[100px] shadow-md shadow-gray-500/80 bg-[var(--background)]">
        <div className="text-3xl sm:text-4xl font-black"><a href="#hero">JiKl-Coding</a></div>

        {/* Desktop only: nav + toggle */}
        <div className="hidden lg:flex items-center gap-4">
            <HeaderToggle locale={locale as string} />
            <nav className="flex gap-4 font-semibold text-2xl">
            <a href="#me" className="hover:underline">{t.me}</a>
            <a href="#skills" className="hover:underline">{t.skills}</a>
            <a href="#projects" className="hover:underline">{t.projects}</a>
            <a href="#contact" className="hover:underline">{t.contact}</a>
            </nav>
        </div>

        {/* Mobile burger button */}
        <button
            className="lg:hidden text-3xl"
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
        >
            ☰
        </button>

        {/* Mobile menu */}
        {isMenuOpen && (
            <div
                className="absolute top-full left-0 w-full bg-[var(--background)] shadow-md shadow-gray-500/40 flex flex-col items-center py-4 lg:hidden z-40 font-semibold text-xl
                        transform transition-transform duration-300 translate-x-0 animate-slide-in"
            >
                <div className="flex flex-col items-center gap-4">
                    <HeaderToggle locale={locale as string} />
                    <a href="#me" onClick={() => setIsMenuOpen(false)}>{t.me}</a>
                    <a href="#skills" onClick={() => setIsMenuOpen(false)}>{t.skills}</a>
                    <a href="#projects" onClick={() => setIsMenuOpen(false)}>{t.projects}</a>
                    <a href="#contact" onClick={() => setIsMenuOpen(false)}>{t.contact}</a>
                </div>
            </div>
        )}
    </header>

  )
}

export default Header
