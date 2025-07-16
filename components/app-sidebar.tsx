"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Settings,
  LogOut,
  User,
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

// Navigation minimaliste avec les fonctions disponibles
const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
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
        title: "Préférences",
        url: "/settings/preferences",
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  
  const user = session?.user ? {
    name: session.user.name || "Utilisateur",
    email: session.user.email,
    avatar: session.user.image || "",
  } : null

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
