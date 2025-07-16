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
      licensePlate
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

    // Créer la demande
    const newRequest = await db.request.create({
      data: {
        requesterName,
        requesterPhone,
        requesterEmail,
        breakdownType,
        description,
        urgency: Math.min(Math.max(urgency, 1), 5), // Entre 1 et 5
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        vehicleBrand,
        vehicleModel,
        vehicleYear: vehicleYear ? parseInt(vehicleYear) : null,
        licensePlate,
        priority: urgency >= 4 ? 3 : urgency >= 2 ? 2 : 1
      }
    });

    // TODO: Envoyer notification aux stations proches
    // TODO: Envoyer SMS/Email de confirmation

    return NextResponse.json({
      success: true,
      request: newRequest,
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

// GET - Récupérer les demandes publiques (pour automobilistes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: "Numéro de téléphone requis" },
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
          select: { name: true, address: true, phone: true }
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
