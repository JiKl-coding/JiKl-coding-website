import { NextRequest, NextResponse } from 'next/server'

const middleware = (request: NextRequest) => {
    const { pathname } = request.nextUrl
  
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/favicon.ico')
    ) {
      return NextResponse.next()
    }
  
    const pathnameIsMissingLocale = ['cs', 'en'].every(
      (locale) => !pathname.startsWith(`/${locale}`)
    )
  
    if (pathnameIsMissingLocale) {
      const cookie = request.cookies.get('NEXT_LOCALE')?.value
      const header = request.headers.get('accept-language')?.split(',')[0].split('-')[0]
      const locale = ['cs', 'en'].includes(cookie || '') ? cookie : header || 'cs'
      const url = new URL(`/${locale}${pathname}`, request.url)
      return NextResponse.redirect(url)
    }
  
    return NextResponse.next()
  }
  
  export default middleware

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|og-image.png).*)',
  ],
}
