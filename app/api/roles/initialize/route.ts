import { NextRequest, NextResponse } from "next/server";
import { initializeDefaultRoles } from "@/app/actions/users/manageRoles";

export async function POST(request: NextRequest) {
  try {
    await initializeDefaultRoles();

    return NextResponse.json({
      success: true,
      message: "Rôles par défaut initialisés avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de l'initialisation des rôles:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erreur interne du serveur";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
