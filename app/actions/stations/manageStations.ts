import { db } from "@/lib/db";

export async function getAllStations() {
  try {
    const stations = await db.station.findMany({
      where: {
        isActive: true
      },
      include: {
        mechanics: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return stations.map((station: any) => ({
      ...station,
      mechanicsCount: station.mechanics.length
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des stations:", error);
    throw new Error("Impossible de récupérer les stations");
  }
}

export async function getStationById(id: string) {
  try {
    const station = await db.station.findUnique({
      where: { id },
      include: {
        mechanics: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        requests: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    return station;
  } catch (error) {
    console.error("Erreur lors de la récupération de la station:", error);
    throw new Error("Station non trouvée");
  }
}

export async function createStation(data: {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
}) {
  try {
    const station = await db.station.create({
      data: {
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        phone: data.phone,
        email: data.email,
        isActive: true
      }
    });

    return station;
  } catch (error) {
    console.error("Erreur lors de la création de la station:", error);
    throw new Error("Impossible de créer la station");
  }
}

export async function updateStation(id: string, data: Partial<{
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  isActive: boolean;
}>) {
  try {
    const station = await db.station.update({
      where: { id },
      data
    });

    return station;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la station:", error);
    throw new Error("Impossible de mettre à jour la station");
  }
}

export async function deleteStation(id: string) {
  try {
    // Vérifier qu'il n'y a pas de mécaniciens actifs
    const mechanicsCount = await db.mechanic.count({
      where: { stationId: id }
    });

    if (mechanicsCount > 0) {
      throw new Error("Impossible de supprimer une station avec des mécaniciens actifs");
    }

    // Marquer comme inactive au lieu de supprimer
    const station = await db.station.update({
      where: { id },
      data: { isActive: false }
    });

    return station;
  } catch (error) {
    console.error("Erreur lors de la suppression de la station:", error);
    throw new Error("Impossible de supprimer la station");
  }
}
