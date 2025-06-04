'use client'

import {
  Home,
  Building2,
  Megaphone,
  Settings,
  Users,
  MessageCircle,
} from "lucide-react"

import { UserButton, useUser } from "@clerk/nextjs"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname(); // 👈 gets current URL

  if (!isLoaded || !user) {
    return null;
  }

  const role = user?.publicMetadata?.role;

  const creatorItems = [
    {
      title: "Home",
      url: "/user-dashboard/Home",
      icon: Home,
    },
    {
      title: "Find brands",
      url: "/user-dashboard/brands",
      icon: Building2,
    },
    {
      title: "Find brand campaigns",
      url: "/user-dashboard/campaigns",
      icon: Megaphone,
    },
    {
      title: "Messages",
      url: "/user-dashboard/Messages",
      icon: MessageCircle,
    },
    {
      title: "Settings",
      url: "/user-dashboard/settings",
      icon: Settings,
    },
  ];

  const brandItems = [
    {
      title: "Home",
      url: "/brand-dashboard/Home",
      icon: Home,
    },
    {
      title: "Find creators",
      url: "/brand-dashboard/creators",
      icon: Users,
    },
    {
      title: "Post a campaign",
      url: "/brand-dashboard/campaign",
      icon: Megaphone,
    },
    {
      title: "Messages",
      url: "/brand-dashboard/Messages",
      icon: MessageCircle,
    },
    {
      title: "Settings",
      url: "/brand-dashboard/settings",
      icon: Settings,
    },
  ];

  const items = role === 'creator' ? creatorItems : brandItems;

  return (
    <Sidebar className="bg-[#FFF8EC] text-[#1B5E20]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url; // 👈 checks active link
                return (
                  <SidebarMenuItem key={item.title} className={isActive ? "bg-[#F57C00] text-white rounded-md" : ""}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-2 p-2">
                        <item.icon />
                        <span className="">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
          <div className="p-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
