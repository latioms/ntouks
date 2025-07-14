import { db } from "@/lib/db";

export interface AdminStats {
  totalStations: number;
  activeStations: number;
  totalMechanics: number;
  activeMechanics: number;
  totalRequests: number;
  pendingRequests: number;
  totalRevenue: number;
  platformUsers: number;
}

export async function getPlatformStats(): Promise<AdminStats> {
  try {
    // Récupération des statistiques des stations
    const stations = await db.station.findMany({
      select: { id: true, isActive: true }
    });

    const totalStations = stations.length;
    const activeStations = stations.filter(station => station.isActive).length;

    // Récupération des statistiques des mécaniciens
    const mechanics = await db.mechanic.findMany({
      select: { id: true, isAvailable: true }
    });

    const totalMechanics = mechanics.length;
    const activeMechanics = mechanics.filter(mechanic => mechanic.isAvailable).length;

    // Récupération des statistiques des demandes
    const requests = await db.request.findMany({
      select: { 
        id: true, 
        status: true
      }
    });

    const totalRequests = requests.length;
    const pendingRequests = requests.filter(req => req.status === "PENDING").length;

    // Calcul du chiffre d'affaires total à partir des factures
    const invoices = await db.invoice.findMany({
      where: { status: "PAID" },
      select: { totalAmount: true }
    });

    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

    // Récupération du nombre total d'utilisateurs
    const platformUsers = await db.user.count();

    return {
      totalStations,
      activeStations,
      totalMechanics,
      activeMechanics,
      totalRequests,
      pendingRequests,
      totalRevenue,
      platformUsers
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw new Error("Impossible de récupérer les statistiques de la plateforme");
  }
}
