"use client";

import * as React from "react";

import { MainMenu } from "@/components/sidebar/main-menu";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavRole } from "@/components/sidebar/nav-role";
import { NavUser } from "@/components/sidebar/nav-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SystemActions } from "@/components/sidebar/system-actions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { MenuConfig } from "@/lib/menu";
import Image from "next/image";
import Link from "next/link";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  menu: MenuConfig;
  logoUrl?: string;
  portalName?: string;
  portalSubtitle?: string;
}

export function AppSidebar({
  menu,
  logoUrl = "/dashboard",
  portalName = "Tanzania Creative Hub",
  portalSubtitle = "Tanzania Creative Hub",
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar variant="sidebar" {...props} className="bg-[#003580] border-none">
      <SidebarHeader className="bg-[#003580] border-none px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href={logoUrl} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Image
                  src="/coat.png"
                  alt="Coat of Arms"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-base leading-tight">
                  Tanzania Creative
                </span>
                <span className="text-white/70 text-sm leading-tight">
                  Hub
                </span>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-hidden bg-[#003580]">
        <ScrollArea className="h-full w-full">
          <div className="space-y-1 px-3 pb-6">
            <MainMenu items={menu.navMain} />
            <SystemActions projects={menu.projects} />
            <NavSecondary items={menu.navSecondary} />
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="bg-[#003580] border-none">
        <NavRole />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
