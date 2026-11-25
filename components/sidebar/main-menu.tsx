"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { NavMainItem } from "@/lib/menu";

export function MainMenu({ items }: { items: NavMainItem[] }) {
  const pathname = usePathname();

  const getActiveParent = () => {
    const activeItem = items.find((item) => {
      if (pathname === item.url) return true;
      return item.items?.some(
        (subItem) => pathname === subItem.url || pathname.startsWith(subItem.url + "/")
      );
    });
    return activeItem?.title || null;
  };

  const [openItem, setOpenItem] = useState<string | null>(getActiveParent());

  React.useEffect(() => {
    const activeParent = getActiveParent();
    if (activeParent) {
      setOpenItem(activeParent);
    }
  }, [pathname]);

  const isParentActive = (item: NavMainItem) => {
    if (pathname === item.url) return true;

    return item.items?.some((subItem) => {
      if (pathname === subItem.url) return true;
      if (pathname.startsWith(subItem.url + "/")) {
        const hasMoreSpecificMatch = items.some((otherItem) =>
          otherItem.items?.some(
            (otherSubItem) =>
              otherSubItem.url !== subItem.url &&
              otherSubItem.url.length > subItem.url.length &&
              pathname === otherSubItem.url
          )
        );
        return !hasMoreSpecificMatch;
      }
      return false;
    });
  };

  const isSubItemActive = (url: string) => pathname === url;

  const handleToggle = (itemTitle: string) => {
    const activeParent = getActiveParent();
    if (activeParent === itemTitle) return;
    setOpenItem((current) => (current === itemTitle ? null : itemTitle));
  };

  return (
    <SidebarGroup>
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const parentActive = isParentActive(item);
          const isOpen = openItem === item.title;

          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={`h-11 cursor-pointer rounded-xl text-base font-normal transition-all px-3 ${
                    parentActive
                      ? "bg-white/20 text-white hover:bg-white/25"
                      : "text-white/80 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <Link href={item.url}>
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen}
              onOpenChange={() => handleToggle(item.title)}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`h-12 cursor-pointer rounded-xl text-base font-normal transition-all ${
                      parentActive
                        ? "bg-white/20 text-white hover:bg-white/25"
                        : "text-white/80 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 truncate">{item.title}</span>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="border-none">
                    {item.items?.map((subItem) => {
                      const subItemActive = isSubItemActive(subItem.url);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={`rounded-lg text-sm transition-all ${
                              subItemActive
                                ? "bg-white/15 font-medium text-white"
                                : "text-white/70 font-normal hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <Link href={subItem.url}>
                              <span
                                className={`mr-1 h-1.5 w-1.5 shrink-0 rounded-full transition-all ${
                                  subItemActive ? "bg-white" : "bg-white/30"
                                }`}
                              />
                              <span className="truncate">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
