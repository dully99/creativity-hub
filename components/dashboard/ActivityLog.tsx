"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardActivity, DashboardActivityType } from "@/lib/mock/dashboard";
import { useLanguageStore } from "@/store/useLanguageStore";
import { formatDistanceToNow } from "date-fns";
import { Building2, CheckCircle2, FileText, Loader2, UserPlus, XCircle } from "lucide-react";

const translations = {
  en: {
    title: "Recent Activity",
    noActivity: "No recent activity",
    loading: "Loading activity...",
  },
  sw: {
    title: "Shughuli za Hivi Karibuni",
    noActivity: "Hakuna shughuli za hivi karibuni",
    loading: "Inapakia shughuli...",
  },
};

interface ActivityLogProps {
  activities: DashboardActivity[];
  isLoading?: boolean;
  maxItems?: number;
}

const activityIcons: Record<DashboardActivityType, typeof Building2> = {
  item_submitted: Building2,
  item_approved: CheckCircle2,
  item_rejected: XCircle,
  project_created: FileText,
  user_registered: UserPlus,
};

const activityColors: Record<DashboardActivityType, string> = {
  item_submitted: "text-blue-600 bg-blue-100",
  item_approved: "text-green-600 bg-green-100",
  item_rejected: "text-red-600 bg-red-100",
  project_created: "text-purple-600 bg-purple-100",
  user_registered: "text-indigo-600 bg-indigo-100",
};

export function ActivityLog({ activities, isLoading = false, maxItems = 5 }: ActivityLogProps) {
  const language = useLanguageStore((state) => state.language);
  const t = translations[language];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.loading}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">{t.noActivity}</p>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, maxItems).map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];
              const when = new Date(activity.timestamp);

              return (
                <div key={activity.id} className="flex gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-none font-medium">{activity.title}</p>
                    <p className="text-muted-foreground text-sm">{activity.description}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDistanceToNow(when, { addSuffix: true })}
                      {activity.user ? ` • ${activity.user}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
