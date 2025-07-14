import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserWithRole } from "@/lib/user"

export async function GET(request: NextRequest) {
  try {
    // Obtenir la session
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Récupérer l'utilisateur avec son rôle
    const userWithRole = await getUserWithRole(session.user.id)

    if (!userWithRole) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: userWithRole.id,
        name: userWithRole.name,
        email: userWithRole.email,
        role: userWithRole.role
      }
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
