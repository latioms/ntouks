import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  '/',
  '/login', 
  '/register',
  '/api/auth',
  '/api/roles/initialize'
]

// Routes qui nécessitent une authentification mais pas forcément un rôle
const authRequiredRoutes = [
  '/select-role'
]

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
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  try {
    // Vérifier la session utilisateur
    const session = await auth.api.getSession({
      headers: request.headers
    })

    // Si pas de session et route protégée, rediriger vers login
    if (!session?.user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // L'utilisateur est connecté, vérifier s'il a un rôle
    const response = await fetch(new URL('/api/user/role', request.url), {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    })

    let hasRole = false
    
    if (response.ok) {
      const data = await response.json()
      hasRole = !!data.role
    }

    // Si l'utilisateur n'a pas de rôle
    if (!hasRole) {
      // S'il n'est pas déjà sur la page de sélection de rôle, l'y rediriger
      if (pathname !== '/select-role') {
        return NextResponse.redirect(new URL('/select-role', request.url))
      }
      // S'il est déjà sur la page de sélection de rôle, laisser passer
      return NextResponse.next()
    }

    // L'utilisateur a un rôle
    // S'il est sur la page de sélection de rôle, le rediriger vers le dashboard
    if (pathname === '/select-role') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Vérifier les permissions spécifiques aux rôles (à implémenter selon les besoins)
    // Pour l'instant, on laisse passer toutes les routes pour les utilisateurs avec un rôle
    
    return NextResponse.next()

  } catch (error) {
    console.error('Erreur dans le middleware:', error)
    
    // En cas d'erreur, rediriger vers la page de connexion
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
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
