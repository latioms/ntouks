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
      // Gestionnaire voit tous les mécaniciens pour l'instant
      // TODO: Filtrer par station spécifique une fois la relation établie
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
    const { userId, specialties, stationId, firstName, lastName, phone, email } = body;

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

    // Vérifier qu'il n'est pas déjà mécanicien
    const existingMechanic = await db.mechanic.findUnique({
      where: { userId }
    });

    if (existingMechanic) {
      return NextResponse.json(
        { error: "Cet utilisateur est déjà mécanicien" },
        { status: 400 }
      );
    }

    // Récupérer une station par défaut si aucune n'est spécifiée
    let targetStationId = stationId;
    if (!targetStationId) {
      const firstStation = await db.station.findFirst({
        where: { isActive: true }
      });
      if (firstStation) {
        targetStationId = firstStation.id;
      } else {
        return NextResponse.json(
          { error: "Aucune station active disponible" },
          { status: 400 }
        );
      }
    }

    // Utiliser les informations de l'utilisateur ou celles fournies
    const mechanicData = {
      firstName: firstName || targetUser.name?.split(' ')[0] || 'Prénom',
      lastName: lastName || targetUser.name?.split(' ')[1] || 'Nom',
      phone: phone || targetUser.phone || '',
      email: email || targetUser.email,
      userId,
      specialties: specialties || [],
      isAvailable: true,
      stationId: targetStationId
    };

    // Créer le mécanicien
    const newMechanic = await db.mechanic.create({
      data: mechanicData,
      include: {
        user: {
          select: { name: true, email: true }
        },
        station: {
          select: { name: true, address: true }
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
