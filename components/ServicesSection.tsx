'use client'

import { useParams } from 'next/navigation'
import { translations } from '@/lib/i18n'
import { useEffect, useRef, useState } from 'react'

const ServicesSection = () => {
  const { locale } = useParams()
  const t = translations[locale as 'cs' | 'en']?.services ?? translations.cs.services

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
      id="services"
      ref={sectionRef}
      className="max-w-7xl mx-auto px-6 py-12 scroll-mt-[120px]"
    >
      <h2
        className={`uppercase text-3xl sm:text-4xl font-bold mb-6 text-center underline transition-all duration-1000 ease-out will-change-transform ${
          visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
        }`}
      >
        {t.subtitle}
      </h2>

      <ul className="grid md:grid-cols-2 gap-4 text-sm sm:text-lg text-muted-foreground">
        {t.items.map((item, idx) => (
          <li
            key={idx}
            className={`flex gap-2 items-start p-3 border border-border rounded-xl bg-card shadow-md shadow-gray-500/40 transition-all duration-1000 ease-out ${
              visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
          >
            <span className="text-xl">{item.slice(0, 2)}</span>
            <span>{item.slice(3)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-center text-muted-foreground text-sm max-w-2xl mx-auto">
        {t.contactNote}
      </p>

      {/* Contact button */}
      <div className="mt-8 flex justify-center">
        <a
          href="#contact"
          className="relative overflow-hidden px-6 py-2 border border-[var(--background)] rounded cursor-pointer font-bold bg-[var(--foreground)] text-[var(--background)] transition-all duration-300 ease-in-out
                     before:absolute before:inset-0 before:translate-y-full before:bg-[var(--background)]
                     hover:before:translate-y-0 before:transition-transform before:duration-300
                     hover:text-[var(--foreground)] hover:border-[var(--foreground)]"
        >
          <span className="relative z-10">
            {locale === 'en' ? 'Get a consultation' : 'Domluvit konzultaci'}
          </span>
        </a>
      </div>

    </section>
    
  )
}

export default ServicesSection
