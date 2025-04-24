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
    <main className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen gap-32 px-1 mt-12">
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
