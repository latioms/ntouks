import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Récupérer les demandes assignées à ce mécanicien
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

    // Vérifier que l'utilisateur est un mécanicien
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { 
        role: true,
        mechanic: true
      }
    });

    if (!user || !user.role || user.role.name !== 'mechanic' || !user.mechanic) {
      return NextResponse.json(
        { error: "Accès refusé - Mécanicien uniquement" },
        { status: 403 }
      );
    }

    // Récupérer toutes les demandes assignées à ce mécanicien
    const requests = await db.request.findMany({
      where: {
        mechanicId: user.mechanic.id
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Mapper les demandes au format attendu par le frontend
    const mappedRequests = requests.map(request => ({
      id: request.id,
      description: request.description,
      location: request.address, // Mapper address vers location
      status: request.status,
      priority: request.priority,
      createdAt: request.createdAt.toISOString(),
      urgency: request.urgency,
      requesterName: request.requesterName,
      requesterPhone: request.requesterPhone,
      vehicleBrand: request.vehicleBrand,
      vehicleModel: request.vehicleModel,
      licensePlate: request.licensePlate
    }));

    return NextResponse.json({
      success: true,
      requests: mappedRequests,
      mechanicInfo: {
        id: user.mechanic.id,
        name: user.name,
        specialties: user.mechanic.specialties,
        isAvailable: user.mechanic.isAvailable
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des demandes du mécanicien:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
