import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Récupérer les statistiques pour l'admin
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

    // Vérifier le rôle admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });

    if (!user || !user.role || user.role.name !== 'admin') {
      return NextResponse.json(
        { error: "Accès refusé - Admin requis" },
        { status: 403 }
      );
    }

    // Récupérer toutes les statistiques de la plateforme
    const [
      totalStations,
      activeStations,
      totalMechanics,
      activeMechanics,
      totalRequests,
      pendingRequests,
      completedRequests,
      platformUsers
    ] = await Promise.all([
      db.station.count(),
      db.station.count({ where: { isActive: true } }),
      db.mechanic.count(),
      db.mechanic.count({ where: { isAvailable: true } }),
      db.request.count(),
      db.request.count({ where: { status: 'PENDING' } }),
      db.request.count({ where: { status: 'COMPLETED' } }),
      db.user.count()
    ]);

    // Calcul du revenu total (simulation pour l'instant)
    const totalRevenue = completedRequests * 50; // 50€ moyen par intervention

    // Statistiques des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRequests = await db.request.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    const recentCompletions = await db.request.count({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalStations,
        activeStations,
        totalMechanics,
        activeMechanics,
        totalRequests,
        pendingRequests,
        completedRequests,
        totalRevenue,
        platformUsers,
        recentRequests,
        recentCompletions,
        completionRate: totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0,
        activeStationRate: totalStations > 0 ? (activeStations / totalStations) * 100 : 0
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des stats admin:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
