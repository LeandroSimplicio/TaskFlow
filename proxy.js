import { NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/projects']
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/api/auth/callback']

export function proxy(request) {
  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  const isPublic = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  if (isProtected) {
    const token = request.cookies.get('insforge_access_token')?.value
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (isPublic && pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
