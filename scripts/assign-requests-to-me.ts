import { db } from "../lib/db";

async function assignRequestsToMe() {
  try {
    console.log("🔄 Attribution des demandes à votre profil...\n");

    // Récupérer l'utilisateur
    const user = await db.user.findFirst({
      where: { email: 'latioms@gmail.com' },
      include: { mechanic: true }
    });

    if (!user || !user.mechanic) {
      console.log("❌ Aucun profil mécanicien trouvé pour cet utilisateur");
      return;
    }

    // Récupérer toutes les demandes
    const requests = await db.request.findMany({
      where: {
        status: {
          in: ['PENDING', 'IN_PROGRESS', 'ASSIGNED']
        }
      }
    });

    console.log(`📋 ${requests.length} demandes trouvées`);

    // Assigner toutes les demandes à ce mécanicien
    const updateResult = await db.request.updateMany({
      where: {
        id: {
          in: requests.map((r: any) => r.id)
        }
      },
      data: {
        mechanicId: user.mechanic.id,
        status: 'ASSIGNED' // Assigner la demande
      }
    });

    console.log(`✅ ${updateResult.count} demandes assignées avec succès`);

    // Vérifier le résultat
    const assignedRequests = await db.request.findMany({
      where: {
        mechanicId: user.mechanic.id
      },
      include: {
        mechanic: {
          include: {
            user: true
          }
        }
      }
    });

    console.log(`\n📊 Vérification: ${assignedRequests.length} demandes assignées à votre profil:`);
    assignedRequests.forEach((req: any, index: number) => {
      console.log(`  ${index + 1}. ${req.description} - ${req.status}`);
    });

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await db.$disconnect();
  }
}

assignRequestsToMe();
