import { db } from "../lib/db";

async function checkMechanicData() {
  try {
    console.log("🔍 Vérification des données mécanicien...\n");

    // Vérifier les utilisateurs avec rôle mechanic
    const mechanicUsers = await db.user.findMany({
      include: {
        role: true,
        mechanic: true
      },
      where: {
        role: {
          name: 'mechanic'
        }
      }
    });

    console.log(`👥 Utilisateurs avec rôle mechanic: ${mechanicUsers.length}`);
    mechanicUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
      console.log(`    Profil mécanicien: ${user.mechanic ? 'Oui' : 'Non'}`);
      if (user.mechanic) {
        console.log(`    Disponible: ${user.mechanic.isAvailable}`);
        console.log(`    Spécialités: ${user.mechanic.specialties.join(', ')}`);
      }
    });

    // Vérifier les demandes
    const requests = await db.request.findMany({
      include: {
        mechanic: true
      }
    });

    console.log(`\n📋 Total des demandes: ${requests.length}`);
    console.log(`📋 Demandes assignées à un mécanicien: ${requests.filter(r => r.mechanicId).length}`);

    // Vérifier les demandes par mécanicien
    const requestsByMechanic = requests.reduce((acc: any, request) => {
      if (request.mechanicId) {
        if (!acc[request.mechanicId]) {
          acc[request.mechanicId] = [];
        }
        acc[request.mechanicId].push(request);
      }
      return acc;
    }, {});

    console.log(`\n📋 Répartition des demandes par mécanicien:`);
    Object.keys(requestsByMechanic).forEach(mechanicId => {
      const mechanicRequests = requestsByMechanic[mechanicId];
      console.log(`  - Mécanicien ${mechanicId}: ${mechanicRequests.length} demandes`);
    });

    // Vérifier les rôles
    const roles = await db.role.findMany();
    console.log(`\n🎭 Rôles disponibles:`);
    roles.forEach(role => {
      console.log(`  - ${role.name}: ${role.description}`);
    });

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await db.$disconnect();
  }
}

checkMechanicData();
