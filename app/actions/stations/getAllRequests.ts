

import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

// get all the requests for a specific station
export async function getAllRequests(stationId?: string) {
  try {
    // Build the where clause conditionally
    const whereClause = stationId ? { stationId } : {}

    // Fetch all requests with related data
    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        mechanic: {
          include: {
            station: true
          }
        },
        station: true,
        interventions: true,
        invoice: true
      },
      orderBy: [
        { priority: 'desc' },
        { urgency: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return {
      success: true,
      data: requests,
      count: requests.length
    }

  } catch (error) {
    console.error('Error fetching requests:', error)
    return {
      success: false,
      error: 'An error occurred while fetching requests',
      data: [],
      count: 0
    }
  } finally {
    await prisma.$disconnect()
  }
}

// get requests by status
export async function getRequestsByStatus(status: string, stationId?: string) {
  try {
    const whereClause: any = { status }
    if (stationId) {
      whereClause.stationId = stationId
    }

    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        mechanic: {
          include: {
            station: true
          }
        },
        station: true,
        interventions: true,
        invoice: true
      },
      orderBy: [
        { priority: 'desc' },
        { urgency: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return {
      success: true,
      data: requests,
      count: requests.length
    }

  } catch (error) {
    console.error('Error fetching requests by status:', error)
    return {
      success: false,
      error: 'An error occurred while fetching requests',
      data: [],
      count: 0
    }
  } finally {
    await prisma.$disconnect()
  }
}

// get requests for a specific mechanic
export async function getRequestsForMechanic(mechanicId: string) {
  try {
    const requests = await prisma.request.findMany({
      where: { mechanicId },
      include: {
        mechanic: {
          include: {
            station: true
          }
        },
        station: true,
        interventions: true,
        invoice: true
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { urgency: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return {
      success: true,
      data: requests,
      count: requests.length
    }

  } catch (error) {
    console.error('Error fetching mechanic requests:', error)
    return {
      success: false,
      error: 'An error occurred while fetching mechanic requests',
      data: [],
      count: 0
    }
  } finally {
    await prisma.$disconnect()
  }
}