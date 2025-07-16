#!/usr/bin/env node

/**
 * Script pour créer un utilisateur admin
 * Usage: node create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Utiliser le client Prisma généré
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createAdmin() {
  try {
    console.log('🔧 Création d\'un utilisateur admin...');

    // 1. Vérifier si le rôle admin existe
    let adminRole = await prisma.role.findUnique({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      console.log('📝 Création du rôle admin...');
      adminRole = await prisma.role.create({
        data: {
          name: 'admin',
          description: 'Administrateur de la plateforme'
        }
      });
      console.log('✅ Rôle admin créé');
    } else {
      console.log('✅ Rôle admin trouvé');
    }

    // 2. Créer un utilisateur admin
    const adminEmail = 'admin@ntouks.com';
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      // Mettre à jour le rôle si nécessaire
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: { roleId: adminRole.id },
        include: { role: true }
      });
      console.log('✅ Utilisateur admin mis à jour:', updatedUser.email);
    } else {
      // Créer un nouvel admin
      const adminUser = await prisma.user.create({
        data: {
          id: 'admin-' + Math.random().toString(36).substr(2, 9),
          name: 'Administrateur NTOUKS',
          email: adminEmail,
          emailVerified: true,
          roleId: adminRole.id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: { role: true }
      });
      console.log('✅ Utilisateur admin créé:', adminUser.email);
    }

    // 3. Afficher les instructions
    console.log('\n🎉 Admin créé avec succès !');
    console.log('\n📋 Instructions pour se connecter :');
    console.log('1. Aller sur http://localhost:3000/login');
    console.log('2. Utiliser l\'email:', adminEmail);
    console.log('3. Le mot de passe sera envoyé par email ou configuré via Better Auth');
    console.log('\n💡 Alternative : Modifier votre utilisateur actuel');
    console.log('4. Ou exécuter: node promote-user.js votre-email@exemple.com');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour promouvoir un utilisateur existant
async function promoteUser(email) {
  try {
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      throw new Error('Rôle admin non trouvé');
    }

    const user = await prisma.user.update({
      where: { email },
      data: { roleId: adminRole.id },
      include: { role: true }
    });

    console.log('✅ Utilisateur promu admin:', user.email);
    return user;
  } catch (error) {
    console.error('❌ Erreur promotion:', error);
  }
}

// Exécution du script
const args = process.argv.slice(2);
if (args[0] === 'promote' && args[1]) {
  promoteUser(args[1]);
} else {
  createAdmin();
}

module.exports = { createAdmin, promoteUser };
