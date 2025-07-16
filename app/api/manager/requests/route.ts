import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Récupérer toutes les requêtes d'assistance
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

    // Vérifier le rôle (gestionnaire ou admin)
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

    // Récupérer les requêtes selon le rôle
    let requests;
    if (user.role.name === 'admin') {
      // Admin voit toutes les requêtes
      requests = await db.request.findMany({
        include: {
          mechanic: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          station: {
            select: { name: true, address: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Gestionnaire voit toutes les requêtes pour l'instant
      // TODO: Lier les gestionnaires aux stations spécifiques
      requests = await db.request.findMany({
        include: {
          mechanic: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
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
      requests,
      count: requests.length
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des requêtes:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
