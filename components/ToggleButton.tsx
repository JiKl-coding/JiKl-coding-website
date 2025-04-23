'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

type Props = {
  locale: string
}

const ToggleButton = ({ locale }: Props) => {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

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

  return (
    <div className="flex flex-row items-center gap-2 text-sm">
        <button onClick={toggleLang} className="border w-20 px-4 py-1 rounded cursor-pointer font-bold hover:border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all duration-300 ease-in-out">
            {locale === 'cs' ? 'cze' : 'eng'}
        </button>
        <button onClick={toggleTheme} className="border w-20 px-4 py-1 rounded cursor-pointer font-bold hover:border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all duration-300 ease-in-out">
            {theme === 'dark' ? 'dark' : 'light'}
        </button>
    </div>
  )
}

export default ToggleButton
