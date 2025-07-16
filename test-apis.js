#!/usr/bin/env node

/**
 * Script de test pour vérifier toutes les APIs du dashboard
 * Usage: node test-apis.js
 */

const BASE_URL = 'http://localhost:3000';

// Fonctions utilitaires
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
};

const testAPI = async (endpoint, method = 'GET', body = null, headers = {}) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const runTests = async () => {
  log('🚀 Démarrage des tests API', 'info');
  log('='.repeat(50), 'info');

  // Test 1: API demandes d'assistance (publique)
  log('\n📋 Test: Création de demande d\'assistance', 'info');
  const requestData = {
    requesterName: "Jean Dupont",
    requesterPhone: "+237612345678",
    requesterEmail: "jean@example.com",
    breakdownType: "BATTERY",
    description: "Ma voiture ne démarre plus, je pense que c'est la batterie",
    urgency: 3,
    address: "123 Rue de la Paix, Yaoundé",
    latitude: 3.8480,
    longitude: 11.5021,
    vehicleBrand: "Toyota",
    vehicleModel: "Corolla",
    vehicleYear: 2018,
    licensePlate: "CM-001-YA"
  };

  const requestResult = await testAPI('/api/request', 'POST', requestData);
  if (requestResult.success) {
    log('✅ Demande créée avec succès', 'success');
    log(`   ID: ${requestResult.data.request?.id}`, 'info');
  } else {
    log('❌ Erreur création demande:', 'error');
    log(`   ${requestResult.data?.error || requestResult.error}`, 'error');
  }

  // Test 2: API recherche de stations
  log('\n🏢 Test: Recherche de stations proches', 'info');
  const stationsResult = await testAPI('/api/stations/nearby?lat=3.8480&lng=11.5021&radius=50');
  if (stationsResult.success) {
    log('✅ Recherche de stations réussie', 'success');
    log(`   ${stationsResult.data.total} stations trouvées`, 'info');
  } else {
    log('❌ Erreur recherche stations:', 'error');
    log(`   ${stationsResult.data?.error || stationsResult.error}`, 'error');
  }

  // Test 3: API suivi demandes (publique)
  log('\n🔍 Test: Suivi de demandes', 'info');
  const trackResult = await testAPI('/api/request?phone=+237612345678');
  if (trackResult.success) {
    log('✅ Suivi demandes réussi', 'success');
    log(`   ${trackResult.data.requests?.length || 0} demandes trouvées`, 'info');
  } else {
    log('❌ Erreur suivi demandes:', 'error');
    log(`   ${trackResult.data?.error || trackResult.error}`, 'error');
  }

  // Note: Les tests suivants nécessitent une authentification
  log('\n🔐 Tests nécessitant une authentification:', 'warning');
  log('   - /api/manager/mechanics (GET/POST)', 'warning');
  log('   - /api/manager/requests (GET)', 'warning');
  log('   - /api/manager/assign (POST)', 'warning');
  log('   - /api/manager/status (PATCH)', 'warning');
  log('   - /api/manager/reports (GET)', 'warning');
  log('   - /api/manager/update-status (PATCH)', 'warning');
  log('   - /api/admin/stats (GET)', 'warning');

  log('\n📝 Pour tester les APIs authentifiées:', 'info');
  log('   1. Connectez-vous à l\'application', 'info');
  log('   2. Ouvrez les DevTools', 'info');
  log('   3. Testez dans la console avec fetch()', 'info');

  log('\n✨ Tests terminés!', 'success');
};

// Vérifier que le serveur est démarré
const checkServer = async () => {
  try {
    const response = await fetch(BASE_URL);
    return response.ok;
  } catch {
    return false;
  }
};

const main = async () => {
  log('🔧 Vérification du serveur...', 'info');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    log('❌ Serveur non accessible sur ' + BASE_URL, 'error');
    log('   Assurez-vous que `npm run dev` est lancé', 'error');
    process.exit(1);
  }

  log('✅ Serveur accessible', 'success');
  await runTests();
};

main().catch(console.error);
