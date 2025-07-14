import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assignUserRole, updateUserRole } from "@/app/actions/users/manageRoles";

export async function POST(request: NextRequest) {
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

    const { roleId, targetUserId } = await request.json();

    if (!roleId) {
      return NextResponse.json(
        { error: "ID du rôle requis" },
        { status: 400 }
      );
    }

    // Si targetUserId est fourni, c'est une mise à jour de rôle (admin only)
    // Sinon, c'est l'assignement initial de rôle pour l'utilisateur connecté
    const userId = targetUserId || session.user.id;
    
    let updatedUser;
    
    if (targetUserId && targetUserId !== session.user.id) {
      // Mise à jour du rôle d'un autre utilisateur (nécessite des permissions admin)
      updatedUser = await updateUserRole(userId, roleId, session.user.id);
    } else {
      // Assignement de rôle pour l'utilisateur connecté
      updatedUser = await assignUserRole(userId, roleId);
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Rôle assigné avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de l'assignement du rôle:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erreur interne du serveur";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
