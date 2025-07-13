import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Create permissions
  const permissions = await Promise.all([
    // Request permissions
    prisma.permission.create({
      data: {
        name: 'requests:create',
        description: 'Create new service requests',
        resource: 'requests',
        action: 'create'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'requests:read',
        description: 'View service requests',
        resource: 'requests',
        action: 'read'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'requests:update',
        description: 'Update service requests',
        resource: 'requests',
        action: 'update'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'requests:delete',
        description: 'Delete service requests',
        resource: 'requests',
        action: 'delete'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'requests:assign',
        description: 'Assign requests to mechanics',
        resource: 'requests',
        action: 'assign'
      }
    }),
    
    // Mechanic permissions
    prisma.permission.create({
      data: {
        name: 'mechanics:create',
        description: 'Create new mechanics',
        resource: 'mechanics',
        action: 'create'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'mechanics:read',
        description: 'View mechanics',
        resource: 'mechanics',
        action: 'read'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'mechanics:update',
        description: 'Update mechanic information',
        resource: 'mechanics',
        action: 'update'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'mechanics:delete',
        description: 'Delete mechanics',
        resource: 'mechanics',
        action: 'delete'
      }
    }),
    
    // Station permissions
    prisma.permission.create({
      data: {
        name: 'stations:create',
        description: 'Create new stations',
        resource: 'stations',
        action: 'create'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'stations:read',
        description: 'View stations',
        resource: 'stations',
        action: 'read'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'stations:update',
        description: 'Update station information',
        resource: 'stations',
        action: 'update'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'stations:delete',
        description: 'Delete stations',
        resource: 'stations',
        action: 'delete'
      }
    }),
    
    // Invoice permissions
    prisma.permission.create({
      data: {
        name: 'invoices:create',
        description: 'Create invoices',
        resource: 'invoices',
        action: 'create'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'invoices:read',
        description: 'View invoices',
        resource: 'invoices',
        action: 'read'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'invoices:update',
        description: 'Update invoices',
        resource: 'invoices',
        action: 'update'
      }
    }),
    
    // Dashboard permissions
    prisma.permission.create({
      data: {
        name: 'dashboard:view',
        description: 'Access dashboard',
        resource: 'dashboard',
        action: 'view'
      }
    })
  ])

  // Create roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'System administrator with full access'
    }
  })

  const stationManagerRole = await prisma.role.create({
    data: {
      name: 'STATION_MANAGER',
      description: 'Station manager with management capabilities'
    }
  })

  const mechanicRole = await prisma.role.create({
    data: {
      name: 'MECHANIC',
      description: 'Mechanic with limited access to their assignments'
    }
  })

  const customerRole = await prisma.role.create({
    data: {
      name: 'CUSTOMER',
      description: 'Customer with basic access'
    }
  })

  // Assign all permissions to admin
  for (const permission of permissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id
      }
    })
  }

  // Assign permissions to station manager
  const stationManagerPermissions = permissions.filter(p => 
    p.name.startsWith('requests:') || 
    p.name.startsWith('mechanics:read') ||
    p.name.startsWith('mechanics:update') ||
    p.name.startsWith('stations:read') ||
    p.name.startsWith('stations:update') ||
    p.name.startsWith('invoices:') ||
    p.name === 'dashboard:view'
  )

  for (const permission of stationManagerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: stationManagerRole.id,
        permissionId: permission.id
      }
    })
  }

  // Assign permissions to mechanic
  const mechanicPermissions = permissions.filter(p => 
    p.name === 'requests:read' ||
    p.name === 'requests:update' ||
    p.name === 'mechanics:read' ||
    p.name === 'dashboard:view'
  )

  for (const permission of mechanicPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: mechanicRole.id,
        permissionId: permission.id
      }
    })
  }

  // Assign permissions to customer
  const customerPermissions = permissions.filter(p => 
    p.name === 'requests:create' ||
    p.name === 'requests:read'
  )

  for (const permission of customerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: customerRole.id,
        permissionId: permission.id
      }
    })
  }

  // Create a sample station
  const station = await prisma.station.create({
    data: {
      name: 'Station Centrale',
      address: '123 Avenue Principale, Tunis',
      latitude: 36.8065,
      longitude: 10.1815,
      phone: '+216 71 123 456',
      email: 'centrale@ntouks.tn'
    }
  })

  console.log('🎉 Database seeded successfully!')
  console.log('Roles created:', { adminRole, stationManagerRole, mechanicRole, customerRole })
  console.log('Permissions created:', permissions.length)
  console.log('Sample station created:', station.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
