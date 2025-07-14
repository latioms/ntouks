# Script de réinitialisation de la base de données

# Supprimer les tables existantes et recréer la structure
Write-Host "🗄️ Réinitialisation de la base de données..." -ForegroundColor Yellow

# Reset de la base de données avec Prisma
Write-Host "📋 Reset des migrations..." -ForegroundColor Blue
npx prisma migrate reset --force

# Application des migrations
Write-Host "🔄 Application des migrations..." -ForegroundColor Blue  
npx prisma migrate dev

# Seed avec les données essentielles uniquement
Write-Host "🌱 Seed des données essentielles..." -ForegroundColor Blue
npx prisma db seed

# Génération du client Prisma
Write-Host "⚙️ Génération du client Prisma..." -ForegroundColor Blue
npx prisma generate

Write-Host "✅ Base de données réinitialisée avec succès!" -ForegroundColor Green
Write-Host "📊 La base contient maintenant uniquement:" -ForegroundColor Cyan
Write-Host "   - Les rôles (ADMIN, STATION_MANAGER, MECHANIC, USER)" -ForegroundColor Gray
Write-Host "   - Les permissions essentielles" -ForegroundColor Gray
Write-Host "   - Aucune donnée de test" -ForegroundColor Gray
