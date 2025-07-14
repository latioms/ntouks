import { PrismaClient } from "@/app/generated/prisma"

const prisma = new PrismaClient()

export async function getUserWithRole(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true
    }
  })
}

export async function getUserFromSessionToken(sessionToken: string) {
  try {
    return await prisma.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          include: {
            role: true
          }
        }
      }
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur depuis le token:", error)
    return null
  }
}

export function getRedirectPath(roleName: string): string {
  switch (roleName) {
    case 'ADMIN':
      return '/admin/dashboard'
    case 'STATION_MANAGER':
      return '/dashboard' // Station dashboard (route group)
    case 'MECHANIC':
      return '/dashboard' // Mechanic dashboard (route group)
    case 'USER':
      return '/assist' // Customer assistance page
    default:
      return '/dashboard' // Default fallback
  }
}