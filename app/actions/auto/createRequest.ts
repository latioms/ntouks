import { PrismaClient } from '@/app/generated/prisma'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export interface CreateRequestData {
  requesterName: string
  requesterPhone: string
  requesterEmail?: string
  breakdownType: 'MECHANICAL' | 'ELECTRICAL' | 'TIRE' | 'BATTERY' | 'ENGINE' | 'TRANSMISSION' | 'BRAKES' | 'OTHER'
  description: string
  urgency?: number
  address: string
  latitude: number
  longitude: number
  vehicleBrand?: string
  vehicleModel?: string
  vehicleYear?: number
  licensePlate?: string
  priority?: number
}

// create a new service request
export async function createRequest(data: CreateRequestData) {
  try {
    // Validate required fields
    if (!data.requesterName || !data.requesterPhone || !data.description || !data.address) {
      return {
        success: false,
        error: 'Missing required fields'
      }
    }

    // Find the nearest station based on coordinates
    const nearestStation = await findNearestStation(data.latitude, data.longitude)

    // Create the request
    const newRequest = await prisma.request.create({
      data: {
        requesterName: data.requesterName,
        requesterPhone: data.requesterPhone,
        requesterEmail: data.requesterEmail,
        breakdownType: data.breakdownType,
        description: data.description,
        urgency: data.urgency || 1,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        vehicleBrand: data.vehicleBrand,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
        licensePlate: data.licensePlate,
        priority: data.priority || calculatePriority(data.urgency || 1, data.breakdownType),
        stationId: nearestStation?.id,
        status: 'PENDING'
      },
      include: {
        station: true
      }
    })

    // Try to auto-assign to an available mechanic if urgent
    if (data.urgency && data.urgency >= 4 && nearestStation) {
      await autoAssignMechanic(newRequest.id, nearestStation.id)
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/stations/dashboard')

    return {
      success: true,
      data: newRequest,
      message: 'Service request created successfully'
    }

  } catch (error) {
    console.error('Error creating request:', error)
    return {
      success: false,
      error: 'An error occurred while creating the request'
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to find the nearest station
async function findNearestStation(latitude: number, longitude: number) {
  try {
    const stations = await prisma.station.findMany({
      where: { isActive: true }
    })

    if (stations.length === 0) return null

    // Calculate distance to each station and return the nearest one
    let nearestStation = stations[0]
    let minDistance = calculateDistance(latitude, longitude, stations[0].latitude, stations[0].longitude)

    for (const station of stations.slice(1)) {
      const distance = calculateDistance(latitude, longitude, station.latitude, station.longitude)
      if (distance < minDistance) {
        minDistance = distance
        nearestStation = station
      }
    }

    return nearestStation
  } catch (error) {
    console.error('Error finding nearest station:', error)
    return null
  }
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Helper function to calculate priority based on urgency and breakdown type
function calculatePriority(urgency: number, breakdownType: string): number {
  let priority = urgency

  // Increase priority for critical breakdown types
  if (breakdownType === 'ENGINE' || breakdownType === 'BRAKES') {
    priority += 2
  } else if (breakdownType === 'ELECTRICAL' || breakdownType === 'TRANSMISSION') {
    priority += 1
  }

  return Math.min(priority, 5) // Cap at 5
}

// Helper function to auto-assign mechanic for urgent requests
async function autoAssignMechanic(requestId: string, stationId: string) {
  try {
    // Find available mechanics at the station
    const availableMechanics = await prisma.mechanic.findMany({
      where: {
        stationId: stationId,
        isAvailable: true
      },
      orderBy: { createdAt: 'asc' } // First in, first out
    })

    if (availableMechanics.length > 0) {
      // Assign to the first available mechanic
      await prisma.request.update({
        where: { id: requestId },
        data: {
          mechanicId: availableMechanics[0].id,
          status: 'ASSIGNED',
          assignedAt: new Date()
        }
      })
    }
  } catch (error) {
    console.error('Error auto-assigning mechanic:', error)
    // Don't throw error, just log it since this is a nice-to-have feature
  }
}