
import { PrismaClient } from '@/app/generated/prisma'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// function to accept an intervention request
export async function acceptIntervention(requestId: string, mechanicId: string) {
  try {
    // Check if the request exists and is in a valid state
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

    if (request.status !== 'PENDING' && request.status !== 'ASSIGNED') {
      return {
        success: false,
        error: 'Request is not available for acceptance'
      }
    }

    // Check if the mechanic exists and is available
    const mechanic = await prisma.mechanic.findUnique({
      where: { id: mechanicId }
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

    // Update the request to assign it to the mechanic and change status
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        mechanicId: mechanicId,
        status: 'ASSIGNED',
        assignedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        mechanic: true,
        station: true
      }
    })

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/mecano/dashboard')

    return {
      success: true,
      data: updatedRequest,
      message: 'Intervention request accepted successfully'
    }

  } catch (error) {
    console.error('Error accepting intervention:', error)
    return {
      success: false,
      error: 'An error occurred while accepting the intervention'
    }
  } finally {
    await prisma.$disconnect()
  }
}