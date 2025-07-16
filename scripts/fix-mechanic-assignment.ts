import { db } from '../lib/db';

async function fixMechanicAssignment() {
  try {
    console.log('🔧 Correction de l\'assignation des mécaniciens...');

    // 1. Vérifier s'il y a des stations
    const stations = await db.station.findMany();
    console.log(`📍 ${stations.length} station(s) trouvée(s)`);

    let defaultStation;
    if (stations.length === 0) {
      console.log('❌ Aucune station trouvée, création d\'une station par défaut...');
      defaultStation = await db.station.create({
        data: {
          name: "Station Centrale",
          address: "Yaoundé, Cameroun",
          latitude: 3.8480,
          longitude: 11.5021,
          phone: "+237 666 000 000",
          email: "contact@station-centrale.cm",
          isActive: true
        }
      });
      console.log(`✅ Station par défaut créée: ${defaultStation.name}`);
    } else {
      defaultStation = stations[0];
      console.log(`✅ Utilisation de la station: ${defaultStation.name}`);
    }

    // 2. Mettre à jour l'API avec l'ID de la station par défaut
    console.log(`📝 ID de la station par défaut: ${defaultStation.id}`);

    // 3. Vérifier les mécaniciens existants
    const mechanics = await db.mechanic.findMany({
      include: {
        user: { select: { name: true } },
        station: { select: { name: true } }
      }
    });

    console.log(`👨‍🔧 ${mechanics.length} mécanicien(s) trouvé(s)`);
    mechanics.forEach(mechanic => {
      console.log(`  - ${mechanic.user?.name || `${mechanic.firstName} ${mechanic.lastName}`} (Station: ${mechanic.station?.name})`);
    });

    // 4. Vérifier les demandes
    const requests = await db.request.findMany({
      include: {
        station: { select: { name: true } },
        mechanic: { 
          include: { 
            user: { select: { name: true } } 
          } 
        }
      }
    });

    console.log(`📋 ${requests.length} demande(s) trouvée(s)`);
    requests.forEach(request => {
      console.log(`  - ${request.requesterName} (Status: ${request.status}, Station: ${request.station?.name || 'Aucune'}, Mécanicien: ${request.mechanic?.user?.name || 'Aucun'})`);
    });

    console.log('✅ Analyse terminée');
    console.log(`\n🔧 Pour utiliser la station par défaut dans l'API, utilisez l'ID: ${defaultStation.id}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await db.$disconnect();
  }
}

fixMechanicAssignment();
