import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST - Créer une nouvelle demande d'assistance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      requesterName,
      requesterPhone,
      requesterEmail,
      breakdownType,
      description,
      urgency = 1,
      address,
      latitude,
      longitude,
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      licensePlate,
      stationId
    } = body;

    // Validation des champs obligatoires
    if (!requesterName || !requesterPhone || !breakdownType || !description || !address) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Géolocalisation requise" },
        { status: 400 }
      );
    }

    if (!stationId) {
      return NextResponse.json(
        { error: "Sélection de station requise" },
        { status: 400 }
      );
    }

    // Vérifier que la station existe et est active
    const station = await db.station.findFirst({
      where: {
        id: stationId,
        isActive: true
      }
    });

    if (!station) {
      return NextResponse.json(
        { error: "Station non trouvée ou inactive" },
        { status: 404 }
      );
    }

    // Créer la demande
    const newRequest = await db.request.create({
      data: {
        requesterName,
        requesterPhone,
        requesterEmail,
        breakdownType,
        description,
        urgency: Math.min(Math.max(urgency, 1), 4), // Entre 1 et 4
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        vehicleBrand,
        vehicleModel,
        vehicleYear: vehicleYear ? parseInt(vehicleYear) : null,
        licensePlate,
        priority: urgency >= 4 ? 3 : urgency >= 2 ? 2 : 1,
        stationId // Assigner directement à la station sélectionnée
      }
    });

    // TODO: Trouver un mécanicien disponible dans la station et l'assigner automatiquement
    await assignMechanicToRequest(newRequest.id, stationId);

    return NextResponse.json({
      success: true,
      id: newRequest.id,
      message: "Demande d'assistance créée avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la création de la demande:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Fonction pour assigner automatiquement un mécanicien
async function assignMechanicToRequest(requestId: string, stationId: string) {
  try {
    // Chercher un mécanicien disponible dans la station
    const availableMechanic = await db.mechanic.findFirst({
      where: {
        stationId,
        isAvailable: true
      },
      orderBy: {
        updatedAt: 'asc' // Le moins récemment assigné
      }
    });

    if (availableMechanic) {
      // Assigner le mécanicien
      await db.request.update({
        where: { id: requestId },
        data: {
          mechanicId: availableMechanic.id,
          status: 'ASSIGNED',
          assignedAt: new Date()
        }
      });

      // Marquer le mécanicien comme occupé
      await db.mechanic.update({
        where: { id: availableMechanic.id },
        data: { isAvailable: false }
      });

      console.log(`Mécanicien ${availableMechanic.id} assigné à la demande ${requestId}`);
    } else {
      console.log(`Aucun mécanicien disponible dans la station ${stationId}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'assignation du mécanicien:", error);
  }
}

// GET - Récupérer les demandes publiques (pour automobilistes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    const id = searchParams.get('id');

    if (id) {
      // Récupérer une demande spécifique par ID
      const requestData = await db.request.findUnique({
        where: { id },
        include: {
          mechanic: {
            include: {
              user: {
                select: { 
                  name: true, 
                  phone: true 
                }
              }
            }
          },
          station: {
            select: { 
              name: true, 
              address: true, 
              phone: true,
              latitude: true,
              longitude: true
            }
          },
          interventions: {
            orderBy: { createdAt: 'desc' }
          },
          invoice: true
        }
      });

      if (!requestData) {
        return NextResponse.json(
          { error: "Demande non trouvée" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        requests: [requestData]
      });
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Numéro de téléphone ou ID requis" },
        { status: 400 }
      );
    }

    // Récupérer les demandes de cet automobiliste
    const userRequests = await db.request.findMany({
      where: {
        requesterPhone: phone
      },
      include: {
        mechanic: {
          include: {
            user: {
              select: { name: true, phone: true }
            }
          }
        },
        station: {
          select: { 
            name: true, 
            address: true, 
            phone: true,
            latitude: true,
            longitude: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      requests: userRequests
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des demandes:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
