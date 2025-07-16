import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Mettre à jour la position GPS du mécanicien
export async function POST(request: NextRequest) {
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
        { error: "Accès refusé - seuls les mécaniciens peuvent mettre à jour leur position" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { latitude, longitude, requestId } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Coordonnées GPS requises" },
        { status: 400 }
      );
    }

    // Mettre à jour la position du mécanicien dans la base de données
    await db.mechanic.update({
      where: { id: user.mechanic.id },
      data: {
        latitude,
        longitude
      }
    });

    // Si on a un requestId, vérifier que le mécanicien travaille sur cette demande
    if (requestId) {
      const activeRequest = await db.request.findFirst({
        where: {
          id: requestId,
          mechanicId: user.mechanic.id,
          status: 'IN_PROGRESS'
        }
      });

      if (!activeRequest) {
        return NextResponse.json(
          { error: "Aucune demande active trouvée pour ce mécanicien" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Position mise à jour",
      mechanicId: user.mechanic.id,
      location: {
        latitude,
        longitude
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour de la position:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
