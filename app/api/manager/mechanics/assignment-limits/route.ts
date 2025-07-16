import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Récupérer les limites d'assignation pour chaque mécanicien
export async function GET(request: NextRequest) {
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
        mechanic: {
          include: {
            station: true
          }
        }
      }
    });

    if (!user || !user.role || (user.role.name !== 'STATION_MANAGER' && user.role.name !== 'ADMIN')) {
      return NextResponse.json(
        { error: "Permission refusée" },
        { status: 403 }
      );
    }

    // Récupérer tous les mécaniciens avec leurs demandes actives
    const whereClause = user.role.name === 'ADMIN' ? {} : { stationId: user.mechanic?.stationId };

    const mechanics = await db.mechanic.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true
          }
        },
        requests: {
          where: {
            status: {
              in: ['ASSIGNED', 'IN_PROGRESS']
            }
          },
          select: {
            id: true,
            status: true,
            description: true,
            createdAt: true,
            assignedAt: true,
            requesterName: true
          }
        }
      }
    });

    const MAX_ASSIGNMENTS = 2; // Limite maximale de tâches par mécanicien

    const limits = mechanics.map(mechanic => {
      const assignedRequestsCount = mechanic.requests.length;
      const canReceiveMoreTasks = assignedRequestsCount < MAX_ASSIGNMENTS && mechanic.isAvailable;

      return {
        mechanicId: mechanic.id,
        name: mechanic.user?.name || `${mechanic.firstName} ${mechanic.lastName}`,
        assignedRequestsCount,
        maxAllowed: MAX_ASSIGNMENTS,
        canReceiveMoreTasks,
        activeRequests: mechanic.requests.map(req => ({
          id: req.id,
          status: req.status,
          description: req.description,
          createdAt: req.createdAt,
          assignedAt: req.assignedAt,
          requesterName: req.requesterName
        }))
      };
    });

    return NextResponse.json({
      success: true,
      limits,
      summary: {
        totalMechanics: mechanics.length,
        availableForAssignment: limits.filter(l => l.canReceiveMoreTasks).length,
        fullyAssigned: limits.filter(l => l.assignedRequestsCount >= MAX_ASSIGNMENTS).length,
        maxAssignmentsPerMechanic: MAX_ASSIGNMENTS
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des limites d'assignation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
