'use client'

import HeroSection from '@/components/HeroSection'
import SkillsSection from '@/components/SkillsSection'

export default function Page() {

  return (
    <main className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen gap-24 px-1 mt-12">

      <HeroSection />
      <SkillsSection />

    </main>
  )
}
