import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Démarrer le tracking GPS pour une intervention
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: true,
        mechanic: true
      }
    });

    if (!user || !user.role || user.role.name !== 'MECHANIC' || !user.mechanic) {
      return NextResponse.json(
        { error: "Accès refusé - seuls les mécaniciens peuvent démarrer le tracking" },
        { status: 403 }
      );
    }

    const requestId = params.id;
    const body = await request.json();
    const { latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Coordonnées GPS requises" },
        { status: 400 }
      );
    }

    // Vérifier que la requête existe et est assignée à ce mécanicien
    const existingRequest = await db.request.findUnique({
      where: { id: requestId },
      include: {
        mechanic: {
          include: {
            user: true
          }
        }
      }
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Demande non trouvée" },
        { status: 404 }
      );
    }

    if (existingRequest.mechanicId !== user.mechanic.id) {
      return NextResponse.json(
        { error: "Cette demande n'est pas assignée à vous" },
        { status: 403 }
      );
    }

    if (existingRequest.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: "Vous devez d'abord accepter la tâche avant de démarrer le tracking" },
        { status: 400 }
      );
    }

    // Mettre à jour la position du mécanicien
    await db.mechanic.update({
      where: { id: user.mechanic.id },
      data: {
        latitude,
        longitude
      }
    });

    return NextResponse.json({
      success: true,
      message: "Tracking GPS démarré",
      mechanicId: user.mechanic.id,
      requestId,
      location: {
        latitude,
        longitude
      }
    });

  } catch (error) {
    console.error("Erreur lors du démarrage du tracking:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
