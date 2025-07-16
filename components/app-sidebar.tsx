"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  Wrench,
  ClipboardList,
  BarChart3,
  Users,
  Building2,
} from "lucide-react"
import Image from "next/image"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { SidebarRoleIndicator } from "@/components/ui/sidebar-role-indicator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { useSession, signOut } from "@/lib/auth-client"

// Navigation basée sur le rôle
const getNavigationItems = (userRole: string | undefined) => {
  const baseItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    }
  ];

  // Navigation spécifique au rôle
  if (userRole === 'admin') {
    return [
      ...baseItems,
      {
        title: "Gestion",
        url: "/admin",
        icon: Users,
        items: [
          {
            title: "Utilisateurs",
            url: "/admin/users",
          },
          {
            title: "Stations",
            url: "/admin/stations",
          },
          {
            title: "Mécaniciens",
            url: "/admin/mechanics",
          },
        ],
      },
      {
        title: "Rapports",
        url: "/admin/reports",
        icon: BarChart3,
      },
      {
        title: "Paramètres",
        url: "/settings",
        icon: Settings,
        items: [
          {
            title: "Profil",
            url: "/settings/profile",
          },
          {
            title: "Système",
            url: "/settings/system",
          },
        ],
      },
    ];
  } else if (userRole === 'station-manager') {
    return [
      ...baseItems,
      {
        title: "Gestion Station",
        url: "/manager",
        icon: Building2,
        items: [
          {
            title: "Mécaniciens",
            url: "/manager/mechanics",
          },
          {
            title: "Demandes",
            url: "/manager/requests",
          },
          {
            title: "Rapports",
            url: "/manager/reports",
          },
        ],
      },
      {
        title: "Paramètres",
        url: "/settings",
        icon: Settings,
        items: [
          {
            title: "Profil",
            url: "/settings/profile",
          },
          {
            title: "Station",
            url: "/settings/station",
          },
        ],
      },
    ];
  } else if (userRole === 'mechanic') {
    return [
      ...baseItems,
      {
        title: "Mes Interventions",
        url: "/mechanic/requests",
        icon: Wrench,
      },
      {
        title: "Historique",
        url: "/mechanic/history",
        icon: ClipboardList,
      },
      {
        title: "Paramètres",
        url: "/settings",
        icon: Settings,
        items: [
          {
            title: "Profil",
            url: "/settings/profile",
          },
          {
            title: "Disponibilité",
            url: "/settings/availability",
          },
        ],
      },
    ];
  }

  // Navigation par défaut
  return [
    ...baseItems,
    {
      title: "Paramètres",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "Profil",
          url: "/settings/profile",
        },
      ],
    },
  ];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const [userRole, setUserRole] = React.useState<string | undefined>()

  // Récupérer le rôle de l'utilisateur
  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/user')
          if (response.ok) {
            const data = await response.json()
            setUserRole(data.user?.role?.name)
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du rôle:', error)
        }
      }
    }
    
    fetchUserRole()
  }, [session])
  
  const user = session?.user ? {
    name: session.user.name || "Utilisateur",
    email: session.user.email,
    avatar: session.user.image || "",
  } : null

  // Générer la navigation selon le rôle
  const navigationItems = getNavigationItems(userRole)

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Image
            src="/ntouks.png"
            alt="Ntouks"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
            Ntouks
          </span>
        </div>
        <SidebarRoleIndicator />
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={navigationItems} />
      </SidebarContent>
      
      <SidebarFooter>
        {user && (
          <div className="p-2">
            <NavUser user={user} />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md mt-2 group-data-[collapsible=icon]:justify-center"
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Se déconnecter</span>
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
