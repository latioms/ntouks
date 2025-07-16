import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllStations } from "@/app/actions/stations/manageStations";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification (optionnel pour la lecture des stations)
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    // Récupérer toutes les stations
    const stations = await getAllStations();

    return NextResponse.json({
      success: true,
      stations,
      count: stations.length
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des stations:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erreur interne du serveur";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
