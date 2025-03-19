"use client"

import * as React from "react"
import {
  BookOpen,
  ClipboardList,
  Users,
  FileText,
  Home,
  LifeBuoy,
  Send,
  Settings2,
  PieChart,
  Download,
  CheckSquare,
} from "lucide-react"
import { Session } from "next-auth"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Admin navigation data
const adminData = {
  navMain: [
    {
      title: "Forms",
      url: "/forms",
      icon: FileText,
    },
  ],
}

// User navigation data
const userData = {
  navMain: [
    {
      title: "My Forms",
      url: "/forms",
      icon: FileText,
    },
  ],
}

// Common data for both roles
const commonData = {
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: Session | null;
}

export function AppSidebar({ session, ...props }: AppSidebarProps) {
  const isAdmin = session?.user?.role === "admin"
  
  // Select appropriate navigation based on user role
  const navItems = isAdmin ? adminData.navMain : userData.navMain
  
  // Get user data from session
  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
    avatar: "/avatars/default.jpg", // Use default avatar as NextAuth may not provide an image
  }

  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/forms">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <FileText className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Form Management</span>
                  <span className="truncate text-xs">
                    {isAdmin ? "Admin Portal" : "User Portal"}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavSecondary items={commonData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
