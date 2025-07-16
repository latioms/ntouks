import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Accepter une tâche assignée
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
        { error: "Accès refusé - seuls les mécaniciens peuvent accepter des tâches" },
        { status: 403 }
      );
    }

    const requestId = params.id;

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

    if (existingRequest.status !== 'ASSIGNED') {
      return NextResponse.json(
        { error: "Cette demande ne peut pas être acceptée dans son état actuel" },
        { status: 400 }
      );
    }

    // Marquer la demande comme acceptée et en cours
    const updatedRequest = await db.request.update({
      where: { id: requestId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date()
      },
      include: {
        mechanic: {
          include: {
            user: {
              select: { name: true, phone: true }
            }
          }
        }
      }
    });

    // Marquer le mécanicien comme occupé (optionnel)
    await db.mechanic.update({
      where: { id: user.mechanic.id },
      data: {
        isAvailable: false
      }
    });

    return NextResponse.json({
      success: true,
      message: "Tâche acceptée avec succès",
      request: updatedRequest
    });

  } catch (error) {
    console.error("Erreur lors de l'acceptation de la tâche:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
