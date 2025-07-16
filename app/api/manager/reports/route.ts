import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Récupérer les rapports et analytics
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // Période en jours
    const type = searchParams.get('type') || 'general';

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let whereClause: any = {
      createdAt: {
        gte: startDate
      }
    };

    // Si c'est un gestionnaire de station, limiter aux données de sa station
    if (user.role.name === 'station-manager') {
      // TODO: Ajouter la logique pour identifier la station du gestionnaire
      // whereClause.stationId = user.stationId;
    }

    // Générer différents types de rapports
    let reportData: any = {};

    if (type === 'general' || type === 'requests') {
      // Statistiques des demandes
      const requestStats = await db.request.groupBy({
        by: ['status'],
        where: whereClause,
        _count: {
          status: true
        }
      });

      // Répartition par type de panne
      const breakdownTypes = await db.request.groupBy({
        by: ['breakdownType'],
        where: whereClause,
        _count: {
          breakdownType: true
        }
      });

      // Évolution quotidienne
      const dailyRequests = await db.request.findMany({
        where: whereClause,
        select: {
          createdAt: true,
          status: true
        }
      });

      // Grouper par jour
      const dailyStats = dailyRequests.reduce((acc: any, request) => {
        const date = request.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { total: 0, completed: 0 };
        }
        acc[date].total++;
        if (request.status === 'COMPLETED') {
          acc[date].completed++;
        }
        return acc;
      }, {});

      reportData.requests = {
        statusDistribution: requestStats,
        breakdownTypes,
        dailyEvolution: dailyStats,
        totalRequests: dailyRequests.length
      };
    }

    if (type === 'general' || type === 'mechanics') {
      // Statistiques des mécaniciens
      const mechanicStats = await db.mechanic.findMany({
        where: user.role.name === 'admin' ? {} : whereClause,
        include: {
          requests: {
            where: whereClause,
            select: {
              status: true,
              createdAt: true
            }
          },
          user: {
            select: { name: true }
          }
        }
      });

      const mechanicPerformance = mechanicStats.map(mechanic => ({
        id: mechanic.id,
        name: mechanic.user?.name || `${mechanic.firstName} ${mechanic.lastName}`,
        totalRequests: mechanic.requests.length,
        completedRequests: mechanic.requests.filter(r => r.status === 'COMPLETED').length,
        completionRate: mechanic.requests.length > 0 
          ? (mechanic.requests.filter(r => r.status === 'COMPLETED').length / mechanic.requests.length) * 100 
          : 0,
        isAvailable: mechanic.isAvailable,
        specialties: mechanic.specialties
      }));

      reportData.mechanics = {
        performance: mechanicPerformance,
        totalMechanics: mechanicStats.length,
        availableMechanics: mechanicStats.filter(m => m.isAvailable).length
      };
    }

    if (type === 'general' || type === 'revenue') {
      // Simulation de revenus
      const completedRequests = await db.request.count({
        where: {
          ...whereClause,
          status: 'COMPLETED'
        }
      });

      reportData.revenue = {
        totalRevenue: completedRequests * 50, // 50€ par intervention
        averagePerRequest: 50,
        completedInterventions: completedRequests,
        projectedMonthly: (completedRequests / days) * 30 * 50
      };
    }

    return NextResponse.json({
      success: true,
      period: days,
      type,
      reportDate: new Date(),
      data: reportData
    });

  } catch (error) {
    console.error("Erreur lors de la génération du rapport:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
