"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeading from "@/components/headers/page-heading";
import { DescriptionDashboardView } from "@/components/executive/dashboard-description-view";
import { MainDashboardView } from "@/components/executive/dashboard-main-view";
import { TrackerDashboardView } from "@/components/executive/dashboard-tracker-view";
import { TrendDashboardView } from "@/components/executive/dashboard-trend-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExecutiveAnalytics,
  executiveAnalyticsService,
} from "@/lib/api/executive-analytics.service";
import { AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type BudgetMode = "recurring" | "development";
type ViewMode = "main" | "description" | "trend" | "tracker";

function formatShortDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type ScopeFilters = {
  financial_year?: number | null;
  quarter?: number | null;
  division?: number | null;
  project?: number | null;
};

export function ExecutiveDashboard() {
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("recurring");
  const [viewMode, setViewMode] = useState<ViewMode>("main");
  const [data, setData] = useState<ExecutiveAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ScopeFilters>({});
  const [reporting, setReporting] = useState<"all" | "reported" | "not_reported">("all");

  const showReportingFilter = viewMode === "main" || viewMode === "description";

  const reportingParam = useMemo(() => {
    if (!showReportingFilter || reporting === "all") return "reported,not_reported";
    return reporting;
  }, [showReportingFilter, reporting]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const analytics = await executiveAnalyticsService.getAnalytics({
        ...filters,
        budget_type: budgetMode,
        project: budgetMode === "development" ? filters.project : null,
        reporting: showReportingFilter ? reportingParam : "reported,not_reported",
      });
      setData(analytics);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load executive analytics.");
    } finally {
      setIsLoading(false);
    }
  }, [budgetMode, filters, reportingParam, showReportingFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const options = data?.filter_options;
  const isDevelopment = budgetMode === "development";
  const fyLabel = data?.meta.financial_year_name || "All years";
  const fySelectValue =
    filters.financial_year === null
      ? ""
      : String(filters.financial_year ?? data?.meta.financial_year_id ?? "");
  const quarterSelectValue =
    filters.quarter === null
      ? ""
      : String(filters.quarter ?? data?.meta.quarter_id ?? "");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <PageHeading
          title="Executive Dashboards"
          description="Updated Dodoso analytics suite from focal person submissions"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 self-start"
          onClick={load}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                United Republic of Tanzania · MCIT
              </p>
              <h2 className="text-lg font-semibold leading-snug sm:text-xl">
                Tanzania Creative Hub ·{" "}
                {isDevelopment ? "Development Budget" : "Recurrent Budget"}
              </h2>
              <p className="text-sm text-muted-foreground">
                FY {fyLabel}
                {data?.meta.quarter_name ? ` · ${data.meta.quarter_name}` : ""}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 px-3 py-2 text-right">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Date of update
              </p>
              <p className="text-sm font-semibold">
                {formatShortDate(data?.meta.date_of_update)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <BudgetTab
              active={budgetMode === "recurring"}
              onClick={() => {
                setBudgetMode("recurring");
                setFilters((prev) => ({ ...prev, project: null }));
              }}
            >
              Recurrent
            </BudgetTab>
            <BudgetTab
              active={budgetMode === "development"}
              onClick={() => setBudgetMode("development")}
            >
              Development
            </BudgetTab>
          </div>

          <div
            className={`grid gap-2 sm:grid-cols-2 ${
              showReportingFilter ? "lg:grid-cols-5" : "lg:grid-cols-4"
            }`}
          >
            <FilterSelect
              label="Financial year"
              value={fySelectValue}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  financial_year: value ? Number(value) : null,
                  // Explicit all years → all quarters; otherwise re-default to current for FY
                  quarter: value ? undefined : null,
                }))
              }
              options={(options?.financial_years || []).map((fy) => ({
                value: String(fy.id),
                label: fy.name,
              }))}
            />
            <FilterSelect
              label="Quarter"
              value={quarterSelectValue}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  quarter: value ? Number(value) : null,
                }))
              }
              options={(options?.quarters || []).map((q) => ({
                value: String(q.id),
                label: q.name,
              }))}
            />
            <FilterSelect
              label="Division"
              value={filters.division ? String(filters.division) : ""}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  division: value ? Number(value) : null,
                }))
              }
              options={(options?.divisions || []).map((d) => ({
                value: String(d.id),
                label: `${d.code} — ${d.name}`,
              }))}
            />
            <FilterSelect
              label="Project"
              value={filters.project ? String(filters.project) : ""}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  project: value ? Number(value) : null,
                }))
              }
              disabled={!isDevelopment}
              options={(options?.projects || []).map((p) => ({
                value: String(p.id),
                label: p.name,
              }))}
            />
            {showReportingFilter ? (
              <FilterSelect
                label="Reporting"
                value={reporting === "all" ? "" : reporting}
                onChange={(value) =>
                  setReporting(
                    value === "reported" || value === "not_reported" ? value : "all"
                  )
                }
                allLabel="All"
                options={[
                  { value: "reported", label: "Reported" },
                  { value: "not_reported", label: "Not reported" },
                ]}
              />
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as ViewMode)}
        className="space-y-4"
      >
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4">
          <TabsTrigger value="main">
            Main-{isDevelopment ? "Development" : "Recurrent"}
          </TabsTrigger>
          <TabsTrigger value="description">
            Description-{isDevelopment ? "Development" : "Recurrent"}
          </TabsTrigger>
          <TabsTrigger value="trend">
            Trend-{isDevelopment ? "Development" : "Recurrent"}
          </TabsTrigger>
          <TabsTrigger value="tracker">
            Tracker{isDevelopment ? "Dev" : "Rec"}
          </TabsTrigger>
        </TabsList>

        {isLoading && !data ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : data ? (
          <>
            <TabsContent value="main" className="mt-0">
              <MainDashboardView data={data} isDevelopment={isDevelopment} />
            </TabsContent>
            <TabsContent value="description" className="mt-0">
              <DescriptionDashboardView data={data} />
            </TabsContent>
            <TabsContent value="trend" className="mt-0">
              <TrendDashboardView data={data} />
            </TabsContent>
            <TabsContent value="tracker" className="mt-0">
              <TrackerDashboardView data={data} />
            </TabsContent>
          </>
        ) : (
          <Card>
            <CardContent className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              No analytics data available.
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  );
}

function BudgetTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled,
  allLabel = "All",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  allLabel?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <select
        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none disabled:opacity-50"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
