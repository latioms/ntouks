import { NextRequest, NextResponse } from 'next/server'

// Routes qui nécessitent une authentification
const protectedRoutes = ['/dashboard', '/settings', '/mecano', '/station']

// Routes d'authentification (redirection si déjà connecté)
const authRoutes = ['/login', '/register']

// Routes spécifiques aux rôles
const roleBasedRoutes = {
  '/mecano': ['MECHANIC', 'ADMIN'],
  '/station': ['STATION_MANAGER', 'ADMIN'],
  '/dashboard': ['ADMIN', 'STATION_MANAGER', 'MECHANIC', 'CUSTOMER']
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if user is logged in by looking for session cookies
  const sessionCookie = request.cookies.get('better-auth.session_token')
  const isLoggedIn = !!sessionCookie?.value
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Si l'utilisateur est sur une route protégée sans être connecté
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si l'utilisateur est connecté et tente d'accéder aux pages d'auth
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Role-based access control (simplified for now)
  // Note: For full implementation, you'd need to fetch user role from database
  // This is a basic version that can be enhanced with proper role checking
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
