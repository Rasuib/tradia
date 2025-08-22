"use client"

import { SidebarFooter as UI_SidebarFooter } from "@/components/ui/sidebar"
import { SidebarMenuBadge as UI_SidebarMenuBadge } from "@/components/ui/sidebar"
import { SidebarMenuButton as UI_SidebarMenuButton } from "@/components/ui/sidebar"
import { SidebarMenuItem as UI_SidebarMenuItem } from "@/components/ui/sidebar"
import { SidebarMenu as UI_SidebarMenu } from "@/components/ui/sidebar"
import { SidebarGroupContent as UI_SidebarGroupContent } from "@/components/ui/sidebar"
import { SidebarGroupLabel as UI_SidebarGroupLabel } from "@/components/ui/sidebar"
import { SidebarGroup as UI_SidebarGroup } from "@/components/ui/sidebar"
import { SidebarContent as UI_SidebarContent } from "@/components/ui/sidebar"
import { SidebarHeader as UI_SidebarHeader } from "@/components/ui/sidebar"
import { Sidebar } from "@/components/ui/sidebar"
import * as React from "react"
import { useNavigation } from "@/components/dashboard/navigation-context"
import { cn } from "@/lib/utils"
import TrendingUpIcon from "@/components/icons/trending-up"
import BarChartIcon from "@/components/icons/bar-chart"
import DollarSignIcon from "@/components/icons/dollar-sign"
import ActivityIcon from "@/components/icons/activity"
import GearIcon from "@/components/icons/gear"
import DotsVerticalIcon from "@/components/icons/dots-vertical"
import { Bullet } from "@/components/ui/bullet"
import LockIcon from "@/components/icons/lock"
import Image from "next/image"
import { useIsV0 } from "@/lib/v0-context"

const navData = {
  navMain: [
    {
      title: "Trading Tools",
      items: [
        {
          title: "Dashboard",
          view: "dashboard",
          icon: BarChartIcon,
          isActive: false,
        },
        {
          title: "Stock Analysis",
          view: "analysis",
          icon: TrendingUpIcon,
          isActive: false,
        },
        {
          title: "Portfolio",
          view: "portfolio",
          icon: DollarSignIcon,
          isActive: false,
        },
        {
          title: "Market News",
          view: "news",
          icon: ActivityIcon,
          isActive: false,
        },
        {
          title: "Trading Simulator",
          view: "simulator",
          icon: ActivityIcon,
          isActive: false,
        },
        {
          title: "Settings",
          view: "settings",
          icon: GearIcon,
          isActive: false,
          locked: true,
        },
      ],
    },
  ],
  desktop: {
    title: "Market Status (Live)",
    status: "online",
  },
  user: {
    name: "TRADER",
    email: "trader@tradia.com",
    avatar: "/avatars/user_krimson.png",
  },
}

export function DashboardSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const isV0 = useIsV0()
  const { currentView, setCurrentView } = useNavigation()

  return (
    <Sidebar {...props} className={cn("py-sides", className)}>
      <UI_SidebarHeader className="rounded-t-lg flex gap-3 flex-row rounded-b-none">
        <div className="flex overflow-clip size-12 shrink-0 items-center justify-center rounded bg-sidebar-primary-foreground/10 transition-colors group-hover:bg-sidebar-primary text-sidebar-primary-foreground">
          <TrendingUpIcon className="size-8 group-hover:scale-110 transition-transform text-blue-500" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="text-2xl font-display text-blue-400">Tradia</span>
          <span className="text-xs uppercase text-muted-foreground">Stock Market Learning Platform</span>
        </div>
      </UI_SidebarHeader>

      <UI_SidebarContent>
        {navData.navMain.map((group, i) => (
          <UI_SidebarGroup className={cn(i === 0 && "rounded-t-none")} key={group.title}>
            <UI_SidebarGroupLabel>
              <Bullet className="mr-2" />
              {group.title}
            </UI_SidebarGroupLabel>
            <UI_SidebarGroupContent>
              <UI_SidebarMenu>
                {group.items.map((item) => (
                  <UI_SidebarMenuItem
                    key={item.title}
                    className={cn(item.locked && "pointer-events-none opacity-50")}
                    data-disabled={item.locked}
                  >
                    <UI_SidebarMenuButton
                      isActive={currentView === item.view}
                      disabled={item.locked}
                      className={cn("disabled:cursor-not-allowed", item.locked && "pointer-events-none")}
                      onClick={() => !item.locked && setCurrentView(item.view as any)}
                    >
                      {React.createElement(item.icon, { className: "size-5" })}
                      <span>{item.title}</span>
                    </UI_SidebarMenuButton>
                    {item.locked && (
                      <UI_SidebarMenuBadge>
                        <LockIcon className="size-5 block" />
                      </UI_SidebarMenuBadge>
                    )}
                  </UI_SidebarMenuItem>
                ))}
              </UI_SidebarMenu>
            </UI_SidebarGroupContent>
          </UI_SidebarGroup>
        ))}
      </UI_SidebarContent>

      <UI_SidebarFooter className="p-0">
        <UI_SidebarGroup>
          <UI_SidebarGroupLabel>
            <Bullet className="mr-2" />
            User
          </UI_SidebarGroupLabel>
          <UI_SidebarGroupContent>
            <UI_SidebarMenu>
              <UI_SidebarMenuItem>
                <div className="flex gap-0.5 w-full group cursor-pointer">
                  <div className="shrink-0 flex size-14 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-clip">
                    <Image
                      src={navData.user.avatar || "/placeholder.svg"}
                      alt={navData.user.name}
                      width={120}
                      height={120}
                    />
                  </div>
                  <div className="group/item pl-3 pr-1.5 pt-2 pb-1.5 flex-1 flex bg-sidebar-accent hover:bg-sidebar-accent-active/75 items-center rounded group-data-[state=open]:bg-sidebar-accent-active group-data-[state=open]:hover:bg-sidebar-accent-active group-data-[state=open]:text-sidebar-accent-foreground">
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate text-xl font-display">{navData.user.name}</span>
                      <span className="truncate text-xs uppercase opacity-50 group-hover/item:opacity-100">
                        {navData.user.email}
                      </span>
                    </div>
                    <DotsVerticalIcon className="ml-auto size-4" />
                  </div>
                </div>
              </UI_SidebarMenuItem>
            </UI_SidebarMenu>
          </UI_SidebarGroupContent>
        </UI_SidebarGroup>
      </UI_SidebarFooter>

      {/* <SidebarRail /> */}
    </Sidebar>
  )
}
