import { PrismaClient } from '@/app/generated/prisma'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// function to reject an intervention request
export async function rejectIntervention(requestId: string, mechanicId: string, reason?: string) {
  try {
    // Check if the request exists and is assigned to this mechanic
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

    if (request.mechanicId !== mechanicId) {
      return {
        success: false,
        error: 'Request is not assigned to this mechanic'
      }
    }

    if (request.status === 'COMPLETED' || request.status === 'CANCELLED') {
      return {
        success: false,
        error: 'Request cannot be rejected in its current state'
      }
    }

    // Update the request to remove the mechanic assignment and reset status
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        mechanicId: null,
        status: 'PENDING',
        assignedAt: null,
        updatedAt: new Date()
      },
      include: {
        mechanic: true,
        station: true
      }
    })

    // Log the rejection reason if provided
    if (reason) {
      // You could create a separate log table or add a notes field to track rejection reasons
      console.log(`Request ${requestId} rejected by mechanic ${mechanicId}. Reason: ${reason}`)
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/mecano/dashboard')

    return {
      success: true,
      data: updatedRequest,
      message: 'Intervention request rejected successfully'
    }

  } catch (error) {
    console.error('Error rejecting intervention:', error)
    return {
      success: false,
      error: 'An error occurred while rejecting the intervention'
    }
  } finally {
    await prisma.$disconnect()
  }
}