"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReportingSummary } from "@/lib/api/dodoso.service";
import { CalendarDays, CheckCircle2, CircleDashed, FileEdit } from "lucide-react";

interface FocalReportingSummaryProps {
  summary: ReportingSummary | null;
  isLoading?: boolean;
}

export function FocalReportingSummary({ summary, isLoading }: FocalReportingSummaryProps) {
  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-lg bg-muted" />;
  }

  if (!summary) return null;

  const quarter = summary.active_quarter;
  const progress = summary.progress ?? {
    answered: 0,
    drafts: 0,
    unanswered: 0,
    total: 0,
    percent: 0,
  };
  const percent = progress.percent ?? 0;

  return (
    <Card>
      <CardContent className="grid gap-4 p-4 lg:grid-cols-[minmax(220px,1fr)_2fr] lg:items-center">
        <div className="space-y-2 border-b pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4 text-primary" />
            Active Quarter
          </div>
          {quarter ? (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge>{quarter.name}</Badge>
                {quarter.is_current && <Badge variant="secondary">Current</Badge>}
                {quarter.financial_year_name && (
                  <span className="text-sm font-medium">{quarter.financial_year_name}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {quarter.start_date} — {quarter.end_date}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                No active quarter found.
              </p>
              <p className="text-xs text-muted-foreground">
                {(progress.drafts ?? 0) > 0
                  ? "Your open drafts are listed below. Ask an admin to activate the current quarter."
                  : "Ask an admin to activate the current quarter to see reporting progress."}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Reporting Progress</p>
            <span className="text-sm font-semibold tabular-nums">{percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MetricLink
              href="/dashboard?status=answered#reporting-lists"
              icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
              value={progress.answered ?? 0}
              label="Answered"
            />
            <MetricLink
              href="/dashboard?status=drafts#reporting-lists"
              icon={<FileEdit className="h-3.5 w-3.5 text-amber-600" />}
              value={progress.drafts ?? 0}
              label="Drafts"
            />
            <MetricLink
              href="/dashboard?status=unanswered#reporting-lists"
              icon={<CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />}
              value={progress.unanswered ?? 0}
              label="Unanswered"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {quarter
              ? `${progress.total ?? 0} activit${(progress.total ?? 0) === 1 ? "y" : "ies"} for current quarter${
                  quarter.financial_year_name ? ` · ${quarter.financial_year_name}` : ""
                }`
              : (progress.drafts ?? 0) > 0
                ? `${progress.drafts} open draft${progress.drafts === 1 ? "" : "s"} (no active quarter)`
                : "0 activities — no active quarter"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricLink({
  href,
  icon,
  value,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md border px-2.5 py-2 transition-colors hover:border-primary/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {icon}
      <div className="min-w-0">
        <p className="text-base font-semibold leading-none tabular-nums">{value}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground underline-offset-2 group-hover:underline">
          {label}
        </p>
      </div>
    </Link>
  );
}
