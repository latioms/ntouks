import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createStationWithManager } from "@/app/actions/stations/manageStations";

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer les données du formulaire
    const body = await request.json();
    const { name, address, latitude, longitude, phone, email } = body;

    // Validation des champs requis
    if (!name || !address || !phone) {
      return NextResponse.json(
        { error: "Les champs nom, adresse et téléphone sont obligatoires" },
        { status: 400 }
      );
    }

    // Validation des coordonnées
    const lat = latitude ? parseFloat(latitude) : 0;
    const lng = longitude ? parseFloat(longitude) : 0;

    if (latitude && isNaN(lat)) {
      return NextResponse.json(
        { error: "La latitude doit être un nombre valide" },
        { status: 400 }
      );
    }
    if (longitude && isNaN(lng)) {
      return NextResponse.json(
        { error: "La longitude doit être un nombre valide" },
        { status: 400 }
      );
    }

    // Préparer les données de la station
    const stationData = {
      name,
      address,
      latitude: lat,
      longitude: lng,
      phone,
      email: email || undefined
    };

    // Créer la station avec gestionnaire
    const newStation = await createStationWithManager(stationData, session.user.id);

    return NextResponse.json({
      success: true,
      station: newStation,
      message: "Station créée avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la création de la station:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erreur interne du serveur";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
