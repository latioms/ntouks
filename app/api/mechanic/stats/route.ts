import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Récupérer les statistiques du mécanicien
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

    const mechanicId = user.mechanic.id;

    // Calculer les statistiques
    const [
      totalRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      todayRequests
    ] = await Promise.all([
      // Total des demandes assignées
      db.request.count({
        where: { mechanicId }
      }),
      
      // Demandes en attente
      db.request.count({
        where: { 
          mechanicId,
          status: 'PENDING' 
        }
      }),
      
      // Demandes en cours
      db.request.count({
        where: { 
          mechanicId,
          status: 'IN_PROGRESS' 
        }
      }),
      
      // Demandes terminées
      db.request.count({
        where: { 
          mechanicId,
          status: 'COMPLETED' 
        }
      }),
      
      // Demandes d'aujourd'hui
      db.request.count({
        where: { 
          mechanicId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    // Récupérer les demandes urgentes
    const urgentRequests = await db.request.findMany({
      where: {
        mechanicId,
        priority: 3, // High priority
        status: {
          in: ['PENDING', 'IN_PROGRESS']
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // Calculer le taux de complétion
    const completionRate = totalRequests > 0 
      ? Math.round((completedRequests / totalRequests) * 100) 
      : 0;

    const stats = {
      totalRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      todayRequests,
      urgentRequests: urgentRequests.length,
      completionRate,
      isAvailable: user.mechanic.isAvailable,
      specialties: user.mechanic.specialties,
      recentUrgentRequests: urgentRequests
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques du mécanicien:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
