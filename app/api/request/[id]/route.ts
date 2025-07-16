import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Récupérer une demande spécifique par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;

    if (!requestId) {
      return NextResponse.json(
        { error: "ID de demande requis" },
        { status: 400 }
      );
    }

    // Récupérer la demande avec toutes les relations
    const requestData = await db.request.findUnique({
      where: { id: requestId },
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
      request: requestData
    });

  } catch (error) {
    console.error("Erreur lors de la récupération de la demande:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le statut d'une demande
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;
    const body = await request.json();
    const { status, mechanicLocation } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "ID de demande requis" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    // Mettre à jour le statut
    if (status) {
      updateData.status = status;
      
      if (status === 'IN_PROGRESS') {
        updateData.startedAt = new Date();
      } else if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
        
        // Libérer le mécanicien
        const requestData = await db.request.findUnique({
          where: { id: requestId },
          select: { mechanicId: true }
        });

        if (requestData?.mechanicId) {
          await db.mechanic.update({
            where: { id: requestData.mechanicId },
            data: { isAvailable: true }
          });
        }
      }
    }

    // Mettre à jour la localisation du mécanicien
    if (mechanicLocation && mechanicLocation.latitude && mechanicLocation.longitude) {
      const requestData = await db.request.findUnique({
        where: { id: requestId },
        select: { mechanicId: true }
      });

      if (requestData?.mechanicId) {
        await db.mechanic.update({
          where: { id: requestData.mechanicId },
          data: {
            latitude: mechanicLocation.latitude,
            longitude: mechanicLocation.longitude
          }
        });
      }
    }

    const updatedRequest = await db.request.update({
      where: { id: requestId },
      data: updateData,
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
        }
      }
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour de la demande:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
