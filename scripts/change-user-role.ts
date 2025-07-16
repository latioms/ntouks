import { db } from "../lib/db";

async function changeUserRole() {
  try {
    console.log("🔄 Changement du rôle utilisateur...\n");

    // Trouver l'utilisateur actuel
    const user = await db.user.findFirst({
      where: { email: 'latioms@gmail.com' },
      include: { role: true }
    });

    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      return;
    }

    console.log(`👤 Utilisateur trouvé: ${user.name} (${user.email})`);
    console.log(`🎭 Rôle actuel: ${user.role?.name}`);

    // Trouver le rôle station-manager
    const stationManagerRole = await db.role.findUnique({
      where: { name: 'station-manager' }
    });

    if (!stationManagerRole) {
      console.log("❌ Rôle station-manager non trouvé");
      return;
    }

    // Mettre à jour le rôle
    await db.user.update({
      where: { id: user.id },
      data: { roleId: stationManagerRole.id }
    });

    console.log(`✅ Rôle changé vers: station-manager`);
    console.log("🔄 Redémarrez votre session pour voir les changements");

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await db.$disconnect();
  }
}

changeUserRole();
