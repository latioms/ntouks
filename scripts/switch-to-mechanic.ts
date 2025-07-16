import { db } from "../lib/db";

async function switchToMechanic() {
  try {
    console.log("🔧 Changement vers le rôle mécanicien...\n");

    const user = await db.user.findFirst({
      where: { email: 'latioms@gmail.com' }
    });

    const mechanicRole = await db.role.findUnique({
      where: { name: 'mechanic' }
    });

    if (user && mechanicRole) {
      await db.user.update({
        where: { id: user.id },
        data: { roleId: mechanicRole.id }
      });
      console.log("✅ Rôle changé vers: mechanic");
    }

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await db.$disconnect();
  }
}

switchToMechanic();
