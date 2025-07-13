import { db } from "@/lib/db";

export async function joinStation(userId: string, stationId: string, userData: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  specialties?: string[];
}) {
  try {
    // Vérifier que la station existe et est active
    const station = await db.station.findUnique({
      where: { id: stationId }
    });

    if (!station || !station.isActive) {
      throw new Error("Station non trouvée ou inactive");
    }

    // Vérifier que l'utilisateur n'est pas déjà mécanicien dans une autre station
    const existingMechanic = await db.mechanic.findUnique({
      where: { userId }
    });

    if (existingMechanic) {
      throw new Error("L'utilisateur est déjà mécanicien dans une station");
    }

    // Créer l'enregistrement mécanicien
    const mechanic = await db.mechanic.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        email: userData.email,
        specialties: userData.specialties || [],
        stationId: stationId,
        userId: userId,
        isAvailable: true
      },
      include: {
        station: true,
        user: true
      }
    });

    // Assigner le rôle "mécanicien" à l'utilisateur
    const mechanicRole = await db.role.findFirst({
      where: { name: "MECHANIC" }
    });

    if (mechanicRole) {
      await db.user.update({
        where: { id: userId },
        data: { roleId: mechanicRole.id }
      });
    }

    return mechanic;
  } catch (error) {
    console.error("Erreur lors de l'adhésion à la station:", error);
    throw new Error(error instanceof Error ? error.message : "Impossible de rejoindre la station");
  }
}

export async function leavStation(userId: string) {
  try {
    // Trouver le mécanicien
    const mechanic = await db.mechanic.findUnique({
      where: { userId }
    });

    if (!mechanic) {
      throw new Error("Aucun enregistrement mécanicien trouvé");
    }

    // Vérifier qu'il n'y a pas d'interventions en cours
    const activeRequests = await db.request.count({
      where: {
        mechanicId: mechanic.id,
        status: {
          in: ["ASSIGNED", "IN_PROGRESS"]
        }
      }
    });

    if (activeRequests > 0) {
      throw new Error("Impossible de quitter la station avec des interventions en cours");
    }

    // Supprimer l'enregistrement mécanicien
    await db.mechanic.delete({
      where: { id: mechanic.id }
    });

    // Retirer le rôle mécanicien
    await db.user.update({
      where: { id: userId },
      data: { roleId: null }
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la sortie de la station:", error);
    throw new Error(error instanceof Error ? error.message : "Impossible de quitter la station");
  }
}

export async function getMechanicInfo(userId: string) {
  try {
    const mechanic = await db.mechanic.findUnique({
      where: { userId },
      include: {
        station: true,
        user: true,
        requests: {
          where: {
            status: {
              in: ["ASSIGNED", "IN_PROGRESS"]
            }
          }
        }
      }
    });

    return mechanic;
  } catch (error) {
    console.error("Erreur lors de la récupération des informations mécanicien:", error);
    throw new Error("Impossible de récupérer les informations");
  }
}

export async function updateMechanicAvailability(userId: string, isAvailable: boolean) {
  try {
    const mechanic = await db.mechanic.update({
      where: { userId },
      data: { isAvailable }
    });

    return mechanic;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la disponibilité:", error);
    throw new Error("Impossible de mettre à jour la disponibilité");
  }
}

export async function updateMechanicProfile(userId: string, data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialties?: string[];
  latitude?: number;
  longitude?: number;
}) {
  try {
    const mechanic = await db.mechanic.update({
      where: { userId },
      data
    });

    return mechanic;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    throw new Error("Impossible de mettre à jour le profil");
  }
}
