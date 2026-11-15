import { NextRequest, NextResponse } from 'next/server'

const LOCALES = ['cs', 'en'] as const
const DEFAULT_LOCALE = 'cs'

const isLocale = (value: string | undefined): value is (typeof LOCALES)[number] =>
  !!value && (LOCALES as readonly string[]).includes(value)

const proxy = (request: NextRequest) => {
    const { pathname } = request.nextUrl

    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/favicon.ico')
    ) {
      return NextResponse.next()
    }

    const pathnameIsMissingLocale = LOCALES.every(
      (locale) => pathname !== `/${locale}` && !pathname.startsWith(`/${locale}/`)
    )

    if (pathnameIsMissingLocale) {
      const cookie = request.cookies.get('NEXT_LOCALE')?.value
      const header = request.headers.get('accept-language')?.split(',')[0].split('-')[0].trim().toLowerCase()
      const locale = isLocale(cookie) ? cookie : isLocale(header) ? header : DEFAULT_LOCALE
      const url = new URL(`/${locale}${pathname}`, request.url)
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  export default proxy

  export const config = {
    matcher: [
      '/((?!_next|api|favicon.ico|robots.txt|sitemap.*\\.xml|og-image.png).*)',
    ],
  }
