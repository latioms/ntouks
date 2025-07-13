import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  "/",
  "/login",
  "/register", 
  "/about",
  "/contact",
  "/assist"
];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Autoriser les routes publiques
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Pour l'instant, autoriser toutes les routes privées
  // TODO: Implémenter la vérification de session et de rôles
  return NextResponse.next();
}

function getDashboardUrl(roleName: string, user: any): string {
  switch (roleName) {
    case "ADMIN":
      return "/admin/dashboard";
    case "STATION_MANAGER":
      return "/station/dashboard";
    case "MECHANIC":
      // Vérifier si le mécanicien a une station assignée
      if (user.mechanic?.station) {
        return "/mecano/dashboard";
      } else {
        return "/select-station";
      }
    default:
      return "/";
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
