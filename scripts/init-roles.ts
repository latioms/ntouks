import { initializeDefaultRoles } from "@/app/actions/users/manageRoles";

async function main() {
  try {
    console.log("🚀 Initialisation des rôles par défaut...");
    
    await initializeDefaultRoles();
    
    console.log("✅ Rôles par défaut initialisés avec succès !");
    console.log("📋 Rôles créés :");
    console.log("   - admin: Administrateur système");
    console.log("   - station-manager: Gestionnaire de station");
    console.log("   - mechanic: Mécanicien intervenant");
    
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation des rôles:", error);
    process.exit(1);
  }
}

main();
