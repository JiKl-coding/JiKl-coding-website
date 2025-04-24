'use client'

import { useParams } from 'next/navigation'
import { translations } from '@/lib/i18n'
import { useEffect, useRef, useState } from 'react'

const MeSection = () => {
  const { locale } = useParams()
  const t = translations[locale as 'cs' | 'en'] ?? translations.cs

  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.2 }
    )

    const current = sectionRef.current
    if (current) observer.observe(current)

    return () => {
      if (current) observer.unobserve(current)
    }
  }, [])

  return (
    <section
      id="me"
      ref={sectionRef}
      className="max-w-7xl mx-auto px-6 py-8 text-center scroll-mt-[120px]"
    >
      <h2
        className={`uppercase text-3xl sm:text-4xl font-bold mb-6 underline transition-all duration-1000 ease-out will-change-transform ${
          visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
        }`}
      >
        {t.about.title}
      </h2>
      <p
        className={`sm:text-xl text-md text-muted-foreground leading-relaxed transition-all duration-1000 ease-out will-change-transform ${
          visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
        }`}
      >
        {t.about.description}
      </p>

      {/* Contact button */}
      <div className="mt-8 flex justify-center">
        <a
          href="#contact"
          className="relative overflow-hidden px-6 py-2 border rounded cursor-pointer font-bold text-[var(--foreground)] transition-all duration-300 ease-in-out
                     before:absolute before:inset-0 before:translate-y-full before:bg-[var(--foreground)]
                     hover:before:translate-y-0 before:transition-transform before:duration-300
                     hover:text-[var(--background)]"
        >
          <span className="relative z-10">
            {locale === 'en' ? 'Text me' : 'Napiš mi'}
          </span>
        </a>
      </div>
    </section>
  )
}

export default MeSection
