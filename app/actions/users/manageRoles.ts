import { db } from "@/lib/db";

// Fonction pour assigner un rôle à un utilisateur après inscription
export async function assignUserRole(userId: string, roleId: string) {
  try {
    // Vérifier que l'utilisateur existe
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier que le rôle existe (chercher par nom si ce n'est pas un UUID)
    const role = await db.role.findFirst({
      where: {
        OR: [
          { id: roleId },
          { name: roleId }
        ]
      },
    });

    if (!role) {
      throw new Error("Rôle non trouvé");
    }

    // Mettre à jour l'utilisateur avec le rôle (utiliser l'ID du rôle trouvé)
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { roleId: role.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    return updatedUser;
  } catch (error) {
    console.error("Erreur lors de l'assignement du rôle:", error);
    throw new Error("Impossible d'assigner le rôle");
  }
}

// Fonction pour mettre à jour le rôle d'un utilisateur existant (server-side seulement)
export async function updateUserRole(userId: string, roleId: string, adminUserId?: string) {
  try {
    // Si adminUserId est fourni, vérifier les permissions
    if (adminUserId && adminUserId !== userId) {
      const currentUser = await db.user.findUnique({
        where: { id: adminUserId },
        include: { role: true }
      });

      if (currentUser?.role?.name !== "admin") {
        throw new Error("Permission refusée");
      }
    }

    // Vérifier que le rôle existe (chercher par nom si ce n'est pas un UUID)
    const role = await db.role.findFirst({
      where: {
        OR: [
          { id: roleId },
          { name: roleId }
        ]
      },
    });

    if (!role) {
      throw new Error("Rôle non trouvé");
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { roleId: role.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    return user;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error);
    throw new Error("Impossible de mettre à jour le rôle");
  }
}

// Fonction pour obtenir le rôle d'un utilisateur
export async function getUserRole(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    return user?.role;
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    throw new Error("Impossible de récupérer le rôle");
  }
}

// Fonction pour obtenir tous les rôles disponibles
export async function getAllRoles() {
  try {
    const roles = await db.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      },
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

// Fonction pour vérifier si un utilisateur a une permission spécifique
export async function hasPermission(userId: string, resource: string, action: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user?.role) {
      return false;
    }

    return user.role.permissions.some(
      rp => rp.permission.resource === resource && rp.permission.action === action
    );
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    return false;
  }
}

// Fonction pour initialiser les rôles par défaut
export async function initializeDefaultRoles() {
  try {
    const defaultRoles = [
      {
        name: "admin",
        description: "Administrateur avec tous les droits"
      },
      {
        name: "station-manager",
        description: "Gestionnaire de station de service"
      },
      {
        name: "mechanic",
        description: "Mécanicien intervenant"
      }
    ];

    for (const roleData of defaultRoles) {
      await db.role.upsert({
        where: { name: roleData.name },
        update: {},
        create: roleData
      });
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de l'initialisation des rôles:", error);
    throw new Error("Impossible d'initialiser les rôles");
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
