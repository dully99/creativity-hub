"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavProjectItem } from "@/lib/menu";

export function SystemActions({ projects }: { projects: NavProjectItem[] }) {
  const pathname = usePathname();

  const isActive = (url: string) => pathname === url;

  if (projects.length === 0) {
    return null;
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="mb-2 text-sm font-semibold">Quick Actions</SidebarGroupLabel>
      <SidebarMenu className="gap-2">
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              className={`h-10 cursor-pointer rounded-full text-sm font-medium transition-all ${
                isActive(item.url)
                  ? "bg-white text-black hover:bg-white/90 hover:text-black"
                  : "text-sidebar-foreground hover:bg-white/10 hover:text-white"
              }`}
            >
              <Link href={item.url}>
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
