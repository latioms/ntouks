// Test simple de l'API mécanicien
const testMechanicAPI = async () => {
  try {
    console.log("🧪 Test de l'API mécanicien...\n");

    // Test de l'API stats
    console.log("📊 Test des statistiques mécanicien...");
    const statsResponse = await fetch('http://localhost:3000/api/mechanic/stats');
    const statsData = await statsResponse.json();
    console.log('Status:', statsResponse.status);
    console.log('Response:', JSON.stringify(statsData, null, 2));

    console.log("\n📋 Test des demandes mécanicien...");
    const requestsResponse = await fetch('http://localhost:3000/api/mechanic/requests');
    const requestsData = await requestsResponse.json();
    console.log('Status:', requestsResponse.status);
    console.log('Response:', JSON.stringify(requestsData, null, 2));

  } catch (error) {
    console.error("❌ Erreur:", error);
  }
};

testMechanicAPI();
