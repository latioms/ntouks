import { NextRequest, NextResponse } from 'next/server'

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  '/',
  '/login', 
  '/register',
  '/api/auth',
  '/api/roles/initialize'
]

// Routes d'authentification (redirection si déjà connecté avec rôle)
const authRoutes = ['/login', '/register']

// Routes qui nécessitent un rôle assigné
const roleRequiredRoutes = [
  '/dashboard',
  '/admin', 
  '/create-station',
  '/select-station',
  '/assist'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.includes(pathname)
  
  if (isPublicRoute && !isAuthRoute) {
    return NextResponse.next()
  }

  try {
    // Vérifier la session avec les cookies directement au lieu d'utiliser auth.api
    const sessionCookie = request.cookies.get('better-auth.session_token')
    
    // Si pas de cookie de session
    if (!sessionCookie) {
      // Gestion des routes d'authentification
      if (isAuthRoute) {
        return NextResponse.next()
      }
      
      // Rediriger vers login pour les autres routes
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      console.log(`Middleware: Pas de session, redirection vers login`)
      return NextResponse.redirect(loginUrl)
    }

    // Si c'est une route d'auth et que l'utilisateur a une session
    if (isAuthRoute) {
      // Pour l'instant, rediriger vers select-role car on ne peut pas vérifier le rôle facilement
      console.log('Middleware: Session détectée sur page auth, redirection vers /select-role')
      return NextResponse.redirect(new URL('/select-role', request.url))
    }

    // Pour les autres routes protégées, laisser passer et gérer la vérification côté client
    return NextResponse.next()

  } catch (error) {
    console.error('Erreur dans le middleware:', error)
    
    // En cas d'erreur, laisser passer pour les routes d'auth
    if (isAuthRoute) {
      return NextResponse.next()
    }
    
    // Rediriger vers login pour les autres routes
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

function getRedirectPathForRole(roleName: string): string {
  const redirectPaths: Record<string, string> = {
    "admin": "/admin/dashboard",
    "station-manager": "/dashboard",
    "mechanic": "/dashboard"
  };
  
  return redirectPaths[roleName] || "/dashboard";
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - sauf certaines exceptions
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|api/roles|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
