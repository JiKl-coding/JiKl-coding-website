'use client'

import heroPhoto from '@/public/jikl.webp'
import { translations } from '@/lib/i18n'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import MeSection from "@/components/MeSection"

const HeroSection = () => {
  const { locale } = useParams()
  const t = translations[locale as 'cs' | 'en'] ?? translations.cs

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <>
      {/* Hero */}
      <section
        id="hero"
        className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden text-white my-6"
      >
        {/* Background */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-fixed rounded-sm overflow-hidden max-w-6xl mx-auto"
          style={{
            backgroundImage: `url(${heroPhoto.src})`,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Foreground Text */}
        <div
          className={`text-center px-4 max-w-4xl transform transition-all duration-2000 ease-out ${
            visible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}
        >
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 drop-shadow-xl">
            {t.hero.title}
          </h1>
          <p className="text-lg sm:text-2xl text-gray-200 drop-shadow-md">
            {t.hero.description}
          </p>
        </div>
      </section>

      <div className="bg-background">
        <MeSection />
      </div>
    </>
  )
}

export default HeroSection
