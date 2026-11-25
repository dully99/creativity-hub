"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

const translations = {
  en: {
    dashboard: "Dashboard",
    analytics: "Analytics",
    users: "Users",
    settings: "Settings",
    roles: "Roles",
  },
  sw: {
    dashboard: "Dashibodi",
    analytics: "Takwimu",
    users: "Watumiaji",
    settings: "Mipangilio",
    roles: "Majukumu",
  },
};

interface BreadcrumbSegment {
  label: string;
  href: string;
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const language = useLanguageStore((state) => state.language);
  const t = translations[language];

  const generateBreadcrumbs = (): BreadcrumbSegment[] => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbSegment[] = [];
    let currentPath = "";

    segments.forEach((segment) => {
      currentPath += `/${segment}`;

      const isId =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
        /^\d+$/.test(segment) ||
        /^[a-f0-9]{24}$/i.test(segment);

      if (isId) return;

      const formattedSegment = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const translationKey = segment.toLowerCase().replace(/-/g, "");
      const label = t[translationKey as keyof typeof t] || formattedSegment;

      breadcrumbs.push({
        label: label as string,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink
            href="/dashboard"
            className="flex items-center gap-1 text-sm font-medium"
          >
            <Home className="h-4 w-4" />
            <span>{t.dashboard}</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <Fragment key={crumb.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-primary text-sm font-medium">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink className="text-primary text-sm font-medium" href={crumb.href}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
