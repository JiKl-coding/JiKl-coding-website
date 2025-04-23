'use client'

import { useParams } from 'next/navigation'

export default function Page() {
  const { locale } = useParams()

  return (
    <main className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold">
        {locale === 'cs' ? 'Vítej' : 'Welcome'}
      </h1>
    </main>
  )
}
