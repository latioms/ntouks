import { db } from "../lib/db";

async function createMechanicProfile() {
  try {
    console.log("🔧 Création du profil mécanicien...\n");

    // Trouver l'utilisateur avec rôle mechanic
    const mechanicUser = await db.user.findFirst({
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

    if (!mechanicUser) {
      console.log("❌ Aucun utilisateur avec rôle mechanic trouvé");
      return;
    }

    console.log(`👤 Utilisateur trouvé: ${mechanicUser.name} (${mechanicUser.email})`);

    if (mechanicUser.mechanic) {
      console.log("✅ Le profil mécanicien existe déjà");
      return;
    }

    // Trouver une station pour l'assignation
    const station = await db.station.findFirst();
    if (!station) {
      console.log("❌ Aucune station trouvée. Veuillez d'abord créer une station.");
      return;
    }

    // Créer le profil mécanicien
    const mechanicProfile = await db.mechanic.create({
      data: {
        userId: mechanicUser.id,
        firstName: mechanicUser.name?.split(' ')[0] || 'Prénom',
        lastName: mechanicUser.name?.split(' ')[1] || 'Nom',
        phone: mechanicUser.phone || '+221 XX XXX XXXX',
        email: mechanicUser.email + '.mechanic', // Email unique pour le mécanicien
        specialties: ['MECHANICAL', 'ELECTRICAL', 'ENGINE'],
        isAvailable: true,
        stationId: station.id
      }
    });

    console.log(`✅ Profil mécanicien créé avec succès:`);
    console.log(`   ID: ${mechanicProfile.id}`);
    console.log(`   Nom: ${mechanicProfile.firstName} ${mechanicProfile.lastName}`);
    console.log(`   Spécialités: ${mechanicProfile.specialties.join(', ')}`);
    console.log(`   Disponible: ${mechanicProfile.isAvailable}`);

    // Créer quelques demandes de test assignées à ce mécanicien
    console.log("\n📋 Création de demandes de test...");

    const testRequests = [
      {
        requesterName: "Jean Dupont",
        requesterPhone: "+221 77 123 4567",
        requesterEmail: "jean.dupont@example.com",
        description: "Panne moteur - Véhicule ne démarre plus",
        address: "Dakar, Senegal",
        latitude: 14.7167,
        longitude: -17.4677,
        breakdownType: "ENGINE",
        status: "PENDING",
        priority: 3,
        mechanicId: mechanicProfile.id
      },
      {
        requesterName: "Marie Ndiaye",
        requesterPhone: "+221 77 987 6543",
        requesterEmail: "marie.ndiaye@example.com",
        description: "Problème électrique - Phares défaillants",
        address: "Pikine, Senegal",
        latitude: 14.7645,
        longitude: -17.3972,
        breakdownType: "ELECTRICAL",
        status: "IN_PROGRESS",
        priority: 2,
        mechanicId: mechanicProfile.id
      },
      {
        requesterName: "Amadou Ba",
        requesterPhone: "+221 77 555 1234",
        requesterEmail: "amadou.ba@example.com",
        description: "Pneu crevé urgent",
        address: "Guediawaye, Senegal",
        latitude: 14.7692,
        longitude: -17.4103,
        breakdownType: "TIRE", 
        status: "PENDING",
        priority: 3,
        mechanicId: mechanicProfile.id
      }
    ];

    for (const request of testRequests) {
      const created = await db.request.create({
        data: request
      });
      console.log(`   ✅ Demande créée: ${created.description} (${created.status})`);
    }

    console.log("\n🎉 Configuration terminée avec succès !");

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await db.$disconnect();
  }
}

createMechanicProfile();
