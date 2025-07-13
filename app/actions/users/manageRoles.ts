import { db } from "@/lib/db";

export async function updateUserRole(userId: string, roleId: string) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { roleId },
      include: {
        role: true
      }
    });

    return user;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error);
    throw new Error("Impossible de mettre à jour le rôle");
  }
}

export async function getUserRole(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        role: true
      }
    });

    return user?.role;
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    throw new Error("Impossible de récupérer le rôle");
  }
}

export async function getAllRoles() {
  try {
    const roles = await db.role.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return roles;
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles:", error);
    throw new Error("Impossible de récupérer les rôles");
  }
}

export async function createRole(data: {
  name: string;
  description?: string;
}) {
  try {
    const role = await db.role.create({
      data: {
        name: data.name,
        description: data.description
      }
    });

    return role;
  } catch (error) {
    console.error("Erreur lors de la création du rôle:", error);
    throw new Error("Impossible de créer le rôle");
  }
}

export async function assignUserToStation(userId: string, stationId: string) {
  try {
    // Créer un enregistrement mécanicien
    const mechanic = await db.mechanic.create({
      data: {
        firstName: "Prénom", // À récupérer depuis les données utilisateur
        lastName: "Nom", // À récupérer depuis les données utilisateur
        phone: "Téléphone", // À récupérer depuis les données utilisateur
        email: "email@example.com", // À récupérer depuis les données utilisateur
        specialties: [],
        stationId: stationId,
        userId: userId
      }
    });

    return mechanic;
  } catch (error) {
    console.error("Erreur lors de l'assignation à la station:", error);
    throw new Error("Impossible d'assigner l'utilisateur à la station");
  }
}

export async function getUserStationRole(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        mechanic: {
          include: {
            station: true
          }
        }
      }
    });

    return {
      user,
      role: user?.role,
      station: user?.mechanic?.station
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des informations utilisateur:", error);
    throw new Error("Impossible de récupérer les informations");
  }
}
