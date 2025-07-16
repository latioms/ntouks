import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Récupérer les mécaniciens de la station
export async function GET(request: NextRequest) {
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

    // Récupérer les mécaniciens
    let mechanics;
    if (user.role.name === 'admin') {
      // Admin voit tous les mécaniciens
      mechanics = await db.mechanic.findMany({
        include: {
          user: {
            select: { name: true, email: true, phone: true }
          },
          station: {
            select: { name: true, address: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Gestionnaire voit seulement ses mécaniciens
      mechanics = await db.mechanic.findMany({
        where: {
          stationId: user.id // Assuming station manager is linked to station
        },
        include: {
          user: {
            select: { name: true, email: true, phone: true }
          },
          station: {
            select: { name: true, address: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({
      success: true,
      mechanics,
      count: mechanics.length
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des mécaniciens:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Ajouter un nouveau mécanicien
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
    const { userId, specialties, stationId } = body;

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const targetUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Créer le mécanicien
    const newMechanic = await db.mechanic.create({
      data: {
        userId,
        specialties: specialties || [],
        isAvailable: true,
        stationId: stationId || user.id // Use manager's station
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      mechanic: newMechanic,
      message: "Mécanicien ajouté avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de l'ajout du mécanicien:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
