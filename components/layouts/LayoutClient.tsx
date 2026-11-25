"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DynamicBreadcrumb } from "@/components/layouts/DynamicBreadcrumb";
import LanguageSwitcher from "@/components/layouts/LanguageSwitcher";
import { Footer } from "@/components/layouts/Footer";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getMenuForUser } from "@/lib/menu";
import {
  getHomePathForUser,
  isAdminOnlyPath,
  isExecutiveUser,
  isFocalOnlyPath,
  isFocalUser,
} from "@/lib/auth-roles";
import { useAuth } from "@/contexts/auth-context";
import { dodosoService } from "@/lib/api/dodoso.service";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { UserMenu } from "./UserMenu";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { user, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [hasDraftReports, setHasDraftReports] = useState(false);

  const activeRole = user?.role || "user";
  const isFocal = isFocalUser(user);
  const isExecutive = isExecutiveUser(user);
  const menu = useMemo(
    () => getMenuForUser([activeRole], activeRole === "SuperAdmin", { hasDraftReports }),
    [activeRole, hasDraftReports]
  );
  const homePath = getHomePathForUser(user);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (isFocal && isAdminOnlyPath(pathname)) {
      router.replace(homePath);
      return;
    }
    if (isExecutive && (isAdminOnlyPath(pathname) || isFocalOnlyPath(pathname))) {
      router.replace(homePath);
    }
  }, [isLoading, isAuthenticated, isFocal, isExecutive, pathname, homePath, router]);

  useEffect(() => {
    if (!isAuthenticated || !isFocal) {
      setHasDraftReports(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const drafts = await dodosoService.getDrafts();
        if (!cancelled) setHasDraftReports(drafts.length > 0);
      } catch {
        if (!cancelled) setHasDraftReports(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isFocal, pathname]);

  const portalSubtitle = isFocal
    ? "Focal Person"
    : isExecutive
      ? "Executive Console"
      : "Admin Console";

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 15)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        menu={menu}
        logoUrl={homePath}
        portalName="AAPTMIS"
        portalSubtitle={portalSubtitle}
      />
      <SidebarInset className="dark:bg-background bg-neutral-200 flex flex-col min-h-screen border-none outline-none">
        <header
          className="bg-card sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
        >
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
            <DynamicBreadcrumb />
          </div>

          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-full"
          >
            <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <UserMenu />
        </header>
        <div
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-x-hidden px-4 py-4 sm:px-5 sm:py-5"
          style={{ marginTop: "0rem" }}
        >
          {children}
        </div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
