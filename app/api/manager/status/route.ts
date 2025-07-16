import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH - Mettre à jour le statut d'un mécanicien
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

    if (!user || !user.role || !['station-manager', 'admin'].includes(user.role.name)) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { mechanicId, isAvailable, specialties } = body;

    // Validation
    if (!mechanicId) {
      return NextResponse.json(
        { error: "ID mécanicien requis" },
        { status: 400 }
      );
    }

    // Vérifier que le mécanicien existe
    const mechanic = await db.mechanic.findUnique({
      where: { id: mechanicId },
      include: { user: true }
    });

    if (!mechanic) {
      return NextResponse.json(
        { error: "Mécanicien non trouvé" },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (typeof isAvailable === 'boolean') {
      updateData.isAvailable = isAvailable;
    }
    if (specialties && Array.isArray(specialties)) {
      updateData.specialties = specialties;
    }

    // Mettre à jour le mécanicien
    const updatedMechanic = await db.mechanic.update({
      where: { id: mechanicId },
      data: updateData,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      mechanic: updatedMechanic,
      message: "Statut du mécanicien mis à jour"
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
