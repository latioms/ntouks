import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllStations } from "@/app/actions/stations/manageStations";

export async function GET(request: NextRequest) {
  try {
    // Récupérer toutes les stations actives (pas d'auth requise pour les automobilistes)
    const stations = await getAllStations();

    // Retourner directement le tableau pour simplifier l'usage
    return NextResponse.json(stations);

  } catch (error) {
    console.error("Erreur lors de la récupération des stations:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erreur interne du serveur";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
