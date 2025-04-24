'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

type Props = {
  locale: string
}

const ToggleButton = ({ locale }: Props) => {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)
  const [hoverLang, setHoverLang] = useState(false)
  const [hoverTheme, setHoverTheme] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleLang = () => {
    const newLocale = locale === 'cs' ? 'en' : 'cs'
    localStorage.setItem('lang', newLocale)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/`

    const path = pathname.replace(/^\/(cs|en)/, '')
    router.push(`/${newLocale}${path}`)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', newTheme)
    document.cookie = `THEME=${newTheme}; path=/`
    setTheme(newTheme)
  }

  if (!mounted) return null

  return (
    <div className="flex flex-row items-center gap-2 text-sm">
      <button
        onClick={toggleLang}
        onMouseEnter={() => setHoverLang(true)}
        onMouseLeave={() => setHoverLang(false)}
        className="relative overflow-hidden w-20 px-4 py-1 border rounded cursor-pointer font-bold text-[var(--foreground)] transition-all duration-300 ease-in-out
                  before:absolute before:inset-0 before:translate-x-[-100%] before:bg-[var(--foreground)]
                  hover:before:translate-x-0 before:transition-transform before:duration-300
                  hover:text-[var(--background)]"
      >
        <span className="relative z-10">
          {hoverLang
            ? locale === 'cs' ? 'eng' : 'cze'
            : locale === 'cs' ? 'cze' : 'eng'}
        </span>
      </button>

      <button
        onClick={toggleTheme}
        onMouseEnter={() => setHoverTheme(true)}
        onMouseLeave={() => setHoverTheme(false)}
        className="relative overflow-hidden w-20 px-4 py-1 border rounded cursor-pointer font-bold text-[var(--foreground)] transition-all duration-300 ease-in-out
                  before:absolute before:inset-0 before:translate-x-[-100%] before:bg-[var(--foreground)]
                  hover:before:translate-x-0 before:transition-transform before:duration-300
                  hover:text-[var(--background)]"
      >
        <span className="relative z-10">
          {hoverTheme
            ? theme === 'dark' ? 'light' : 'dark'
            : theme}
        </span>
      </button>
    </div>
  )
}

export default ToggleButton
