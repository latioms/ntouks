
import { PrismaClient } from '@/app/generated/prisma'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// assign a specific request to a specific mechanic
export async function assignRequestToMechanic(requestId: string, mechanicId: string) {
  try {
    // Check if the request exists and is available for assignment
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        mechanic: true,
        station: true
      }
    })

    if (!request) {
      return {
        success: false,
        error: 'Request not found'
      }
    }

    if (request.status !== 'PENDING') {
      return {
        success: false,
        error: 'Request is not available for assignment'
      }
    }

    // Check if the mechanic exists and is available
    const mechanic = await prisma.mechanic.findUnique({
      where: { id: mechanicId },
      include: {
        station: true
      }
    })

    if (!mechanic) {
      return {
        success: false,
        error: 'Mechanic not found'
      }
    }

    if (!mechanic.isAvailable) {
      return {
        success: false,
        error: 'Mechanic is not available'
      }
    }

    // Assign the request to the mechanic and update status
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        mechanicId: mechanicId,
        stationId: mechanic.stationId,
        status: 'ASSIGNED',
        assignedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        mechanic: {
          include: {
            station: true
          }
        },
        station: true
      }
    })

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/stations/dashboard')

    return {
      success: true,
      data: updatedRequest,
      message: `Request successfully assigned to ${mechanic.firstName} ${mechanic.lastName}`
    }

  } catch (error) {
    console.error('Error assigning request:', error)
    return {
      success: false,
      error: 'An error occurred while assigning the request'
    }
  } finally {
    await prisma.$disconnect()
  }
}