import { PrismaClient } from '@/app/generated/prisma'

const prisma = new PrismaClient()

export interface UserWithRole {
  id: string
  name: string
  email: string
  role?: {
    id: string
    name: string
    permissions: {
      permission: {
        id: string
        name: string
        resource: string
        action: string
      }
    }[]
  }
}

// Get user with role and permissions
export async function getUserWithPermissions(userId: string): Promise<UserWithRole | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })

    return user as UserWithRole
  } catch (error) {
    console.error('Error fetching user with permissions:', error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

// Check if user has specific permission
export async function hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
  try {
    const user = await getUserWithPermissions(userId)
    
    if (!user || !user.role) {
      return false
    }

    // Check if user has the specific permission
    const hasSpecificPermission = user.role.permissions.some(rp => 
      rp.permission.resource === resource && rp.permission.action === action
    )

    return hasSpecificPermission
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

// Check if user has any permission for a resource
export async function hasResourceAccess(userId: string, resource: string): Promise<boolean> {
  try {
    const user = await getUserWithPermissions(userId)
    
    if (!user || !user.role) {
      return false
    }

    // Check if user has any permission for the resource
    const hasAccess = user.role.permissions.some(rp => 
      rp.permission.resource === resource
    )

    return hasAccess
  } catch (error) {
    console.error('Error checking resource access:', error)
    return false
  }
}

// Get user permissions for a specific resource
export async function getUserPermissionsForResource(userId: string, resource: string): Promise<string[]> {
  try {
    const user = await getUserWithPermissions(userId)
    
    if (!user || !user.role) {
      return []
    }

    // Get all actions user can perform on the resource
    const actions = user.role.permissions
      .filter(rp => rp.permission.resource === resource)
      .map(rp => rp.permission.action)

    return actions
  } catch (error) {
    console.error('Error getting user permissions for resource:', error)
    return []
  }
}

// Check if user is admin
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await getUserWithPermissions(userId)
    return user?.role?.name === 'ADMIN' || false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Check if user is mechanic
export async function isMechanic(userId: string): Promise<boolean> {
  try {
    const user = await getUserWithPermissions(userId)
    return user?.role?.name === 'MECHANIC' || false
  } catch (error) {
    console.error('Error checking mechanic status:', error)
    return false
  }
}

// Check if user is station manager
export async function isStationManager(userId: string): Promise<boolean> {
  try {
    const user = await getUserWithPermissions(userId)
    return user?.role?.name === 'STATION_MANAGER' || false
  } catch (error) {
    console.error('Error checking station manager status:', error)
    return false
  }
}

// Get mechanic info for a user
export async function getMechanicByUserId(userId: string) {
  try {
    const mechanic = await prisma.mechanic.findUnique({
      where: { userId },
      include: {
        station: true,
        user: true
      }
    })

    return mechanic
  } catch (error) {
    console.error('Error fetching mechanic by user ID:', error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}
