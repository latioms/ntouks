import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserRole } from "@/app/actions/users/manageRoles";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const userRole = await getUserRole(session.user.id);

    return NextResponse.json({
      success: true,
      role: userRole,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du rôle utilisateur:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erreur interne du serveur";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
