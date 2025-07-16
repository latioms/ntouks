import { db } from "../lib/db";

async function seedStations() {
  console.log("🌱 Ajout des stations de test...");

  const stations = [
    {
      name: "Station Central Yaoundé",
      address: "Avenue Kennedy, Centre-ville, Yaoundé",
      latitude: 3.8516,
      longitude: 11.5017,
      phone: "+237 222 123 456",
      email: "central@ntouks-stations.cm",
      isActive: true
    },
    {
      name: "Station Mvog-Ada",
      address: "Quartier Mvog-Ada, Yaoundé",
      latitude: 3.8280,
      longitude: 11.5180,
      phone: "+237 222 234 567",
      email: "mvogada@ntouks-stations.cm",
      isActive: true
    },
    {
      name: "Station Bastos",
      address: "Quartier Bastos, Yaoundé",
      latitude: 3.8720,
      longitude: 11.5140,
      phone: "+237 222 345 678",
      email: "bastos@ntouks-stations.cm",
      isActive: true
    },
    {
      name: "Station Emombo",
      address: "Carrefour Emombo, Yaoundé",
      latitude: 3.8390,
      longitude: 11.4850,
      phone: "+237 222 456 789",
      email: "emombo@ntouks-stations.cm",
      isActive: true
    },
    {
      name: "Station Mendong",
      address: "Quartier Mendong, Yaoundé",
      latitude: 3.8180,
      longitude: 11.4980,
      phone: "+237 222 567 890",
      email: "mendong@ntouks-stations.cm",
      isActive: true
    }
  ];

  for (const stationData of stations) {
    try {
      // Vérifier si la station existe déjà
      const existingStation = await db.station.findFirst({
        where: { 
          OR: [
            { name: stationData.name },
            { phone: stationData.phone }
          ]
        }
      });

      if (existingStation) {
        console.log(`⚠️  Station ${stationData.name} existe déjà`);
        continue;
      }

      const station = await db.station.create({
        data: stationData
      });

      console.log(`✅ Station créée: ${station.name}`);

      // Ajouter quelques mécaniciens de test pour chaque station
      const mechanics = [
        {
          firstName: "Jean",
          lastName: "Mbala",
          phone: `+237 6${Math.floor(Math.random() * 90000000 + 10000000)}`,
          email: `j.mbala.${station.id}@mechanics.cm`,
          specialties: ["ENGINE", "ELECTRICAL"],
          stationId: station.id,
          isAvailable: true
        },
        {
          firstName: "Paul",
          lastName: "Nkomo",
          phone: `+237 6${Math.floor(Math.random() * 90000000 + 10000000)}`,
          email: `p.nkomo.${station.id}@mechanics.cm`,
          specialties: ["TIRE", "BRAKES"],
          stationId: station.id,
          isAvailable: true
        }
      ];

      for (const mechanicData of mechanics) {
        const mechanic = await db.mechanic.create({
          data: mechanicData
        });
        console.log(`  👨‍🔧 Mécanicien ajouté: ${mechanic.firstName} ${mechanic.lastName}`);
      }

    } catch (error) {
      console.error(`❌ Erreur lors de la création de la station ${stationData.name}:`, error);
    }
  }

  console.log("🎉 Terminé !");
}

// Exécuter le script
seedStations()
  .catch((error) => {
    console.error("Erreur:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
