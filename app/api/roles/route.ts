import { NextRequest, NextResponse } from "next/server";
import { getAllRoles } from "@/app/actions/users/manageRoles";

export async function GET(request: NextRequest) {
  try {
    const roles = await getAllRoles();

    return NextResponse.json({
      success: true,
      roles
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des rôles:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erreur interne du serveur";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
