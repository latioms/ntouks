import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PUT - Mettre à jour le statut d'une demande
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const requestId = params.id;
    const body = await request.json();
    const { status, notes } = body;

    // Vérifier que l'utilisateur est un mécanicien
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { 
        role: true,
        mechanic: true
      }
    });

    if (!user || !user.role || user.role.name !== 'mechanic' || !user.mechanic) {
      return NextResponse.json(
        { error: "Accès refusé - Mécanicien uniquement" },
        { status: 403 }
      );
    }

    // Vérifier que la demande existe et est assignée à ce mécanicien
    const existingRequest = await db.request.findUnique({
      where: { id: requestId }
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Demande non trouvée" },
        { status: 404 }
      );
    }

    if (existingRequest.mechanicId !== user.mechanic.id) {
      return NextResponse.json(
        { error: "Cette demande n'est pas assignée à ce mécanicien" },
        { status: 403 }
      );
    }

    // Mettre à jour la demande
    const updatedRequest = await db.request.update({
      where: { id: requestId },
      data: {
        status,
        ...(notes && { notes })
      }
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: "Statut mis à jour avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
