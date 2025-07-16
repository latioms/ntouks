import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Assigner un mécanicien à une requête
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

    // Vérifier le rôle
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    if (!user || !user.role || !['station-manager', 'admin'].includes(user.role.name)) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { requestId, mechanicId, estimatedTime, priority } = body;

    // Validation
    if (!requestId || !mechanicId) {
      return NextResponse.json(
        { error: "ID de requête et ID de mécanicien requis" },
        { status: 400 }
      );
    }

    // Vérifier que la requête existe
    const existingRequest = await db.request.findUnique({
      where: { id: requestId }
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Requête non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que le mécanicien existe et est disponible
    const mechanic = await db.mechanic.findUnique({
      where: { id: mechanicId },
      include: { user: true }
    });

    if (!mechanic || !mechanic.isAvailable) {
      return NextResponse.json(
        { error: "Mécanicien non disponible" },
        { status: 400 }
      );
    }

    // Assigner le mécanicien à la requête
    const updatedRequest = await db.request.update({
      where: { id: requestId },
      data: {
        mechanicId,
        status: 'ASSIGNED',
        assignedAt: new Date(),
        priority: priority || existingRequest.priority
      },
      include: {
        mechanic: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: `Requête assignée à ${mechanic.user?.name || 'mécanicien'}`
    });

  } catch (error) {
    console.error("Erreur lors de l'assignation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
