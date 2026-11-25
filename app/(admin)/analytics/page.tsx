"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExecutiveDashboard } from "@/components/executive/executive-dashboard";
import { useAuth } from "@/contexts/auth-context";
import { canViewExecutiveAnalytics, getHomePathForUser } from "@/lib/auth-roles";

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const allowed = canViewExecutiveAnalytics(user);

  useEffect(() => {
    if (isLoading) return;
    if (!allowed) {
      router.replace(getHomePathForUser(user));
    }
  }, [allowed, isLoading, router, user]);

  if (isLoading || !allowed) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return <ExecutiveDashboard />;
}
