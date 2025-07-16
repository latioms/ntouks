import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH - Mettre à jour le statut d'une demande
export async function PATCH(request: NextRequest) {
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

    if (!user || !user.role || !['station-manager', 'admin', 'mechanic'].includes(user.role.name)) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { requestId, status, notes } = body;

    // Validation
    if (!requestId || !status) {
      return NextResponse.json(
        { error: "ID de requête et statut requis" },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    // Vérifier que la requête existe
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
        { error: "Requête non trouvée" },
        { status: 404 }
      );
    }

    // Vérifications de permissions selon le rôle
    if (user.role.name === 'mechanic') {
      // Un mécanicien ne peut modifier que ses propres requêtes
      if (!existingRequest.mechanic || !existingRequest.mechanic.user || existingRequest.mechanic.user.id !== user.id) {
        return NextResponse.json(
          { error: "Vous ne pouvez modifier que vos propres interventions" },
          { status: 403 }
        );
      }
    }

    // Logique de mise à jour selon le nouveau statut
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    // Ajout des timestamps selon le statut
    switch (status) {
      case 'ASSIGNED':
        if (!existingRequest.assignedAt) {
          updateData.assignedAt = new Date();
        }
        break;
      case 'IN_PROGRESS':
        if (!existingRequest.startedAt) {
          updateData.startedAt = new Date();
        }
        break;
      case 'COMPLETED':
        if (!existingRequest.completedAt) {
          updateData.completedAt = new Date();
        }
        break;
    }

    // Mettre à jour la requête
    const updatedRequest = await db.request.update({
      where: { id: requestId },
      data: updateData,
      include: {
        mechanic: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        station: {
          select: { name: true, address: true }
        }
      }
    });

    // TODO: Envoyer notification au client selon le nouveau statut
    // TODO: Envoyer notification à la station si nécessaire

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: `Statut mis à jour vers: ${status}`
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
