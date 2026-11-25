"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PageHeading from "@/components/headers/page-heading";
import { FocalReportingSummary } from "@/components/reporting/focal-reporting-summary";
import { FocalSectionActivities } from "@/components/reporting/focal-section-activities";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  dodosoService,
  ReportingSummary,
  ReportingSummaryActivity,
  UserContext,
} from "@/lib/api/dodoso.service";
import { buildContinueAssessmentHref } from "@/lib/reporting-continue";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  FileEdit,
  History,
} from "lucide-react";
import { toast } from "sonner";

type ProgressStatus = "answered" | "drafts" | "unanswered";

function parseStatus(value: string | null): ProgressStatus | null {
  if (value === "answered" || value === "drafts" || value === "unanswered") {
    return value;
  }
  return null;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full space-y-4">
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
        </div>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const statusFilter = parseStatus(searchParams.get("status"));

  const [summary, setSummary] = useState<ReportingSummary | null>(null);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const [context, reportingSummary] = await Promise.all([
        dodosoService.getUserContext(),
        dodosoService.getReportingSummary(),
      ]);
      setUserContext(context);
      setSummary(reportingSummary);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!statusFilter || isLoading) return;
    const el = document.getElementById("reporting-lists");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [statusFilter, isLoading, summary]);

  const unanswered = summary?.unanswered_activities ?? [];
  const drafts = summary?.draft_activities ?? [];
  const answered = summary?.answered_activities ?? [];
  const pendingCount = unanswered.length + drafts.length;

  const primaryContinueHref = useMemo(() => {
    const preferred = drafts[0] ?? unanswered[0];
    if (preferred) return buildContinueAssessmentHref(preferred);
    return "/reporting";
  }, [drafts, unanswered]);

  const primaryCta = useMemo(() => {
    if (drafts.length > 0) {
      return {
        label: "Continue Report Assessment",
        hint: `${drafts.length} draft${drafts.length === 1 ? "" : "s"} in progress`,
      };
    }
    if (unanswered.length > 0) {
      return {
        label: "Start Report Assessment",
        hint: `${unanswered.length} activit${unanswered.length === 1 ? "y" : "ies"} still unanswered`,
      };
    }
    return {
      label: "Report Assessment",
      hint: "Open the questionnaire to submit a new assessment",
    };
  }, [drafts.length, unanswered.length]);

  const filteredColumns = useMemo(() => {
    const columns: {
      key: ProgressStatus;
      title: string;
      icon: React.ReactNode;
      items: ReportingSummaryActivity[];
      showContinue?: boolean;
    }[] = [
      {
        key: "unanswered",
        title: "Unanswered",
        icon: <CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />,
        items: unanswered,
        showContinue: true,
      },
      {
        key: "drafts",
        title: "Drafts",
        icon: <FileEdit className="h-3.5 w-3.5 text-amber-600" />,
        items: drafts,
        showContinue: true,
      },
      {
        key: "answered",
        title: "Answered",
        icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
        items: answered,
      },
    ];
    if (!statusFilter) return columns;
    return columns.filter((col) => col.key === statusFilter);
  }, [answered, drafts, unanswered, statusFilter]);

  return (
    <div className="w-full space-y-4">
      <PageHeading
        title="Reporting Dashboard"
        description={
          summary?.has_sections
            ? "Section activities for your division — answered status and task progress"
            : "Active quarter progress for your unit/division"
        }
      />

      {!isLoading && !userContext?.division_id && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your account has no division assigned. Contact an administrator before reporting.
          </AlertDescription>
        </Alert>
      )}

      {userContext?.division_id && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border bg-card px-3 py-2 text-sm">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Unit/Division</span>
            <span className="font-medium">{userContext.division_name}</span>
            {userContext.division_code && (
              <Badge variant="secondary" className="h-5 font-mono text-[10px]">
                {userContext.division_code}
              </Badge>
            )}
          </div>
          {userContext.position_name && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Office</span>
              <span className="font-medium">{userContext.position_name}</span>
            </div>
          )}
        </div>
      )}

      <FocalReportingSummary summary={summary} isLoading={isLoading} />

      <Card className="min-w-0 overflow-hidden border-primary/25 bg-primary/[0.04]">
        <CardContent className="space-y-3 p-4">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold">Next step</p>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "Loading your reporting status…"
                : pendingCount > 0
                  ? primaryCta.hint
                  : answered.length > 0
                    ? "All activities for this quarter are answered. You can still submit another report or review history."
                    : primaryCta.hint}
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              className="w-full sm:w-auto"
              disabled={!userContext?.division_id}
            >
              <Link href={primaryContinueHref}>
                <ClipboardList className="mr-1.5 h-4 w-4 shrink-0" />
                {primaryCta.label}
                <ArrowRight className="ml-1.5 h-4 w-4 shrink-0" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/submitted-reports">
                <History className="mr-1.5 h-4 w-4 shrink-0" />
                View Submitted Reports
              </Link>
            </Button>
            {statusFilter ? (
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href="/dashboard#reporting-lists">Show all</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div id="reporting-lists" className="scroll-mt-4">
        {!isLoading && summary?.has_sections ? (
          <FocalSectionActivities
            sections={summary.sections ?? []}
            statusFilter={statusFilter}
          />
        ) : (
          <Card>
            <CardContent
              className={`grid gap-0 p-0 ${
                filteredColumns.length === 1 ? "md:grid-cols-1" : "md:grid-cols-3"
              }`}
            >
              {filteredColumns.map((col, index) => (
                <ActivityColumn
                  key={col.key}
                  id={col.key}
                  title={col.title}
                  icon={col.icon}
                  emptyText="None"
                  items={col.items}
                  isLoading={isLoading}
                  showContinue={col.showContinue}
                  highlighted={statusFilter === col.key}
                  className={
                    index < filteredColumns.length - 1
                      ? "border-b md:border-b-0 md:border-r"
                      : ""
                  }
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ActivityColumn({
  id,
  title,
  icon,
  emptyText,
  items,
  isLoading,
  showContinue = false,
  highlighted = false,
  className = "",
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  emptyText: string;
  items: ReportingSummaryActivity[];
  isLoading: boolean;
  showContinue?: boolean;
  highlighted?: boolean;
  className?: string;
}) {
  return (
    <div
      id={id}
      className={`min-h-0 scroll-mt-4 p-3 ${highlighted ? "bg-primary/[0.03]" : ""} ${className}`}
    >
      <div className="mb-2 flex items-center gap-1.5">
        {icon}
        <p className="text-sm font-semibold">{title}</p>
        <Badge variant="secondary" className="ml-auto h-5 tabular-nums">
          {items.length}
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-1.5">
          <div className="h-8 animate-pulse rounded bg-muted" />
          <div className="h-8 animate-pulse rounded bg-muted" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-2 text-xs text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="max-h-56 space-y-1 overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-2 rounded border bg-muted/20 px-2.5 py-1.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium leading-snug">{item.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {[item.code, item.target_name].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              {showContinue ? (
                <Button asChild size="sm" variant="outline" className="h-7 shrink-0 px-2 text-xs">
                  <Link href={buildContinueAssessmentHref(item)}>Continue</Link>
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
