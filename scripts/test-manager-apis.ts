import { db } from '../lib/db';

async function testManagerAPIs() {
  try {
    console.log('🧪 Test des APIs du gestionnaire...');

    // 1. Test de récupération des demandes
    console.log('\n📋 Test des demandes:');
    const requests = await db.request.findMany({
      include: {
        mechanic: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        station: { select: { name: true, address: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`  - ${requests.length} demande(s) trouvée(s)`);
    requests.forEach((request, index) => {
      console.log(`  ${index + 1}. ${request.requesterName} (${request.status})`);
      console.log(`     📍 Station: ${request.station?.name || 'Aucune'}`);
      console.log(`     👨‍🔧 Mécanicien: ${request.mechanic?.user?.name || 'Aucun'}`);
      console.log(`     🔧 Type: ${request.breakdownType}`);
      console.log(`     ⚡ Urgence: ${request.urgency}/4`);
    });

    // 2. Test de récupération des mécaniciens
    console.log('\n👨‍🔧 Test des mécaniciens:');
    const mechanics = await db.mechanic.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        station: { select: { name: true, address: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`  - ${mechanics.length} mécanicien(s) trouvé(s)`);
    mechanics.forEach((mechanic, index) => {
      console.log(`  ${index + 1}. ${mechanic.user?.name || `${mechanic.firstName} ${mechanic.lastName}`}`);
      console.log(`     📍 Station: ${mechanic.station?.name}`);
      console.log(`     📧 Email: ${mechanic.email}`);
      console.log(`     🔧 Spécialités: ${mechanic.specialties.join(', ') || 'Aucune'}`);
      console.log(`     ✅ Disponible: ${mechanic.isAvailable ? 'Oui' : 'Non'}`);
    });

    // 3. Test de récupération des stations
    console.log('\n🏢 Test des stations:');
    const stations = await db.station.findMany({
      include: {
        _count: {
          select: {
            mechanics: true,
            requests: true
          }
        }
      }
    });

    console.log(`  - ${stations.length} station(s) trouvée(s)`);
    stations.forEach((station, index) => {
      console.log(`  ${index + 1}. ${station.name}`);
      console.log(`     📍 Adresse: ${station.address}`);
      console.log(`     📞 Téléphone: ${station.phone}`);
      console.log(`     👨‍🔧 Mécaniciens: ${station._count.mechanics}`);
      console.log(`     📋 Demandes: ${station._count.requests}`);
      console.log(`     ✅ Active: ${station.isActive ? 'Oui' : 'Non'}`);
    });

    // 4. Statistiques générales
    console.log('\n📊 Statistiques générales:');
    const stats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'PENDING').length,
      assignedRequests: requests.filter(r => r.status === 'ASSIGNED').length,
      inProgressRequests: requests.filter(r => r.status === 'IN_PROGRESS').length,
      completedRequests: requests.filter(r => r.status === 'COMPLETED').length,
      totalMechanics: mechanics.length,
      availableMechanics: mechanics.filter(m => m.isAvailable).length,
      totalStations: stations.length,
      activeStations: stations.filter(s => s.isActive).length
    };

    Object.entries(stats).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });

    console.log('\n✅ Test terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await db.$disconnect();
  }
}

testManagerAPIs();
