"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/lib/mock/dashboard";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Building2, CheckCircle2, Clock, TrendingUp, Users, XCircle } from "lucide-react";

const translations = {
  en: {
    totalItems: "Total Items",
    pendingReview: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    activeProjects: "Active Projects",
    totalUsers: "Total Users",
  },
  sw: {
    totalItems: "Jumla ya Vitu",
    pendingReview: "Inasubiri Ukaguzi",
    approved: "Imeidhinishwa",
    rejected: "Imekataliwa",
    activeProjects: "Miradi Inayoendelea",
    totalUsers: "Jumla ya Watumiaji",
  },
};

interface DashboardStatsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export function DashboardStats({ stats, isLoading = false }: DashboardStatsProps) {
  const language = useLanguageStore((state) => state.language);
  const t = translations[language];

  const statCards = [
    {
      title: t.totalItems,
      value: stats?.totalItems ?? 0,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t.pendingReview,
      value: stats?.pendingReview ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: t.approved,
      value: stats?.approved ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: t.rejected,
      value: stats?.rejected ?? 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: t.activeProjects,
      value: stats?.activeProjects ?? 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: t.totalUsers,
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} rounded-full p-2`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
