import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

async function seedRolesAndPermissions() {
  console.log("🌱 Initialisation des rôles et permissions...");

  // Créer les permissions de base
  const permissions = [
    // Permissions pour les demandes
    { name: "create_request", resource: "requests", action: "create", description: "Créer une demande d'intervention" },
    { name: "read_request", resource: "requests", action: "read", description: "Voir les demandes d'intervention" },
    { name: "update_request", resource: "requests", action: "update", description: "Modifier une demande d'intervention" },
    { name: "delete_request", resource: "requests", action: "delete", description: "Supprimer une demande d'intervention" },
    { name: "assign_request", resource: "requests", action: "assign", description: "Assigner une demande à un mécanicien" },

    // Permissions pour les stations
    { name: "create_station", resource: "stations", action: "create", description: "Créer une station" },
    { name: "read_station", resource: "stations", action: "read", description: "Voir les stations" },
    { name: "update_station", resource: "stations", action: "update", description: "Modifier une station" },
    { name: "delete_station", resource: "stations", action: "delete", description: "Supprimer une station" },
    { name: "manage_station", resource: "stations", action: "manage", description: "Gérer une station" },

    // Permissions pour les mécaniciens
    { name: "read_mechanic", resource: "mechanics", action: "read", description: "Voir les mécaniciens" },
    { name: "update_mechanic", resource: "mechanics", action: "update", description: "Modifier un mécanicien" },
    { name: "manage_mechanic", resource: "mechanics", action: "manage", description: "Gérer les mécaniciens" },

    // Permissions pour les utilisateurs
    { name: "read_user", resource: "users", action: "read", description: "Voir les utilisateurs" },
    { name: "update_user", resource: "users", action: "update", description: "Modifier un utilisateur" },
    { name: "delete_user", resource: "users", action: "delete", description: "Supprimer un utilisateur" },
    { name: "manage_user", resource: "users", action: "manage", description: "Gérer tous les utilisateurs" },

    // Permissions administratives
    { name: "admin_dashboard", resource: "admin", action: "read", description: "Accéder au tableau de bord admin" },
    { name: "system_config", resource: "system", action: "manage", description: "Configurer le système" },
  ];

  // Créer ou mettre à jour les permissions
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    });
  }

  console.log(`✅ ${permissions.length} permissions créées/mises à jour`);

  // Créer les rôles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrateur système avec tous les droits"
    },
  });

  const stationManagerRole = await prisma.role.upsert({
    where: { name: "station-manager" },
    update: {},
    create: {
      name: "station-manager",
      description: "Gestionnaire de station de service"
    },
  });

  const mechanicRole = await prisma.role.upsert({
    where: { name: "mechanic" },
    update: {},
    create: {
      name: "mechanic",
      description: "Mécanicien intervenant"
    },
  });

  console.log("✅ Rôles créés/mis à jour");

  // Assigner les permissions aux rôles
  // Admin: toutes les permissions
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Station Manager: permissions liées aux stations et demandes
  const stationManagerPermissions = [
    "create_station", "read_station", "update_station", "manage_station",
    "read_request", "update_request", "assign_request",
    "read_mechanic", "manage_mechanic",
    "read_user"
  ];

  for (const permissionName of stationManagerPermissions) {
    const permission = await prisma.permission.findUnique({
      where: { name: permissionName }
    });
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: stationManagerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: stationManagerRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // Mechanic: permissions limitées pour les interventions
  const mechanicPermissions = [
    "read_request", "update_request",
    "read_station",
    "read_mechanic", "update_mechanic"
  ];

  for (const permissionName of mechanicPermissions) {
    const permission = await prisma.permission.findUnique({
      where: { name: permissionName }
    });
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: mechanicRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: mechanicRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("✅ Permissions assignées aux rôles");
  console.log("🎉 Initialisation des rôles et permissions terminée !");
}

async function main() {
  try {
    await seedRolesAndPermissions();
  } catch (error) {
    console.error("❌ Erreur lors du seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seed seulement si ce fichier est appelé directement
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { seedRolesAndPermissions };
