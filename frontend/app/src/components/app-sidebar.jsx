"use client"

import * as React from "react"
import Link from 'next/link'
import {
  BookOpen,
  Bot, BriefcaseBusiness, CircleGauge,
  Command,
  Frame, LayoutDashboard,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal, Users,
} from "lucide-react"

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
import {DATA} from "@/lib/data";
import {NavMenu} from "@/components/nav-menu";
import {useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import Image from "next/image";

const data = {
  navMenu: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Interviews",
      url: "/interviews",
      icon: Bot,
      defaultOpen: true,
    },
    {
      title: "Candidates",
      url: "/candidates",
      icon: Users,
      defaultOpen: true,
      items: [
        {
          title: "My Candidates",
          url: "/candidates",
        },
      ],
    },
    {
      title: "Jobs",
      url: "/jobs/templates",
      icon: BriefcaseBusiness,
      defaultOpen: true,
      items: [
        {
          title: "Templates",
          url: "/jobs/templates",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings/account",
      icon: Settings2,
      defaultOpen: true,
      items: [
        {
          title: "Account",
          url: "/settings/account",
        },
        {
          title: "Organization",
          url: "/settings/organization",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }) {
  const { user } = useSelector((state) => state.retrieveUser);
  const { organization } = useSelector(state => state.retrieveOrganization);

  return (
    <Sidebar variant="inset" collapsible='icon'  {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-transparent text-sidebar-primary-foreground">
                  <img src={`/app/logo/supermodal-sm.webp`}  alt='cognato ai'/>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Cognato AI</span>
                  <span className="truncate text-xs">{organization?.plan || 'Trial'}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMenu items={data.navMenu} />
        {/*<NavMain items={data.navMain} />*/}
        {/*<NavProjects projects={data.projects} />*/}
        {/*<NavSecondary items={data.navSecondary} className="mt-auto" />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
