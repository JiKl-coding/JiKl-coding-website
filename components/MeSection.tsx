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
  className="max-w-7xl mx-auto px-6 py-8 text-center md:text-center"
>
  <h2
    className={`text-3xl sm:text-4xl font-bold mb-6 underline transition-all duration-1000 ease-out will-change-transform ${
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
</section>

  )
}

export default MeSection
