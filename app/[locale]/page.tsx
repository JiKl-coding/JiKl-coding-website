'use client'

import HeroSection from '@/components/HeroSection'
import ProjectCard from '@/components/ProjectCard'
import SkillsSection from '@/components/SkillsSection'
import { useParams } from 'next/navigation'
import { translations } from '@/lib/i18n'

import jindrich from "@/public/projects/jindrichvosecky.webp"
import troja from "@/public/projects/trojafotbal.webp"
import cookbook from "@/public/projects/belamicookbook.webp"

import ContactForm from '@/components/ContactForm'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JiKl-Coding | Tvořím weby i aplikace',
  description: 'Jsem Jirka – programátor, sportovec a stoik. Vyvíjím podnikové aplikace v Progress OpenEdge a moderní weby v Next.js, Reactu a Tailwindu.',
  keywords: [
    'Jiří Klatovský', 'Jirka Klatovský', 'Trojafotbal', 'Belamicookbook', 'Jindrichvosecky',
    'webový vývoj', 'React', 'Next.js', 'Tailwind', 'TypeScript', 'Supabase', 'JiKl-Coding'
  ],
  openGraph: {
    title: 'JiKl-Coding | Tvořím weby i aplikace',
    description: 'Moderní weby a podnikové aplikace od Jiřího Klatovského.',
    url: 'https://jikl-coding.com',
    siteName: 'JiKl-Coding',
    locale: 'cs_CZ',
    type: 'website',
    images: [
      {
        url: 'https://jikl-coding.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JiKl-Coding - portfolio Jiřího Klatovského',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JiKl-Coding | Tvořím weby i aplikace',
    description: 'Tvorba moderních webových řešení a aplikací.',
    images: ['https://jikl-coding.com/og-image.png'],
  },
  authors: [
    { name: 'Jiří Klatovský – JiKl-Coding', url: 'https://jikl-coding.com' },
  ],
  creator: 'Jiří Klatovský – JiKl-Coding',
  publisher: 'Jiří Klatovský – JiKl-Coding',
}

export default function Page() {
  const { locale } = useParams()
  const t = translations[locale as 'cs' | 'en'] ?? translations.cs

  const projects = [
    {
      label: 'trojafotbal.cz',
      image: troja,
      href: 'https://www.trojafotbal.cz',
      description: t.projects.troja.description,
      stackDesc: t.projects.troja.stack,
    },
    {
      label: 'jindrichvosecky.com',
      image: jindrich,
      href: 'https://www.jindrichvosecky.com',
      layout: false,
      description: t.projects.jindrich.description,
      stackDesc: t.projects.jindrich.stack,
    },
    {
      label: 'belamicookbook.cz',
      image: cookbook,
      href: 'https://www.belamicookbook.cz',
      description: t.projects.cookbook.description,
      stackDesc: t.projects.cookbook.stack,
    }
  ]

  return (
    <main className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen gap-64 px-1 mt-12">
      <HeroSection />
      <SkillsSection />
      <section id="projects" className="w-full scroll-mt-[120px] flex flex-col gap-24 justify-center items-center">
      <h2 className="text-3xl sm:text-4xl font-bold underline text-center uppercase">
        {t.nav.projects}
      </h2>
        {projects.map((p) => (
          <ProjectCard key={p.label} {...p} />
        ))}
      </section>
      <ContactForm />
    </main>
  )
}
