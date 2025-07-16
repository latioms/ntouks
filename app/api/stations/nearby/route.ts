import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Fonction pour calculer la distance entre deux points (formule de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// GET - Trouver les stations proches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('lat');
    const longitude = searchParams.get('lng');
    const radius = searchParams.get('radius') || '50'; // 50km par défaut

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Coordonnées GPS requises" },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusKm = parseFloat(radius);

    // Récupérer toutes les stations actives
    const stations = await db.station.findMany({
      where: {
        isActive: true
      },
      include: {
        mechanics: {
          where: {
            isAvailable: true
          },
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        _count: {
          select: {
            mechanics: true
          }
        }
      }
    });

    // Calculer les distances et filtrer
    const nearbyStations = stations
      .map(station => {
        const distance = calculateDistance(lat, lng, station.latitude, station.longitude);
        return {
          ...station,
          distance: Math.round(distance * 100) / 100, // Arrondi à 2 décimales
          availableMechanics: station.mechanics.length
        };
      })
      .filter(station => station.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      stations: nearbyStations,
      total: nearbyStations.length,
      userLocation: { latitude: lat, longitude: lng },
      searchRadius: radiusKm
    });

  } catch (error) {
    console.error("Erreur lors de la recherche de stations:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
