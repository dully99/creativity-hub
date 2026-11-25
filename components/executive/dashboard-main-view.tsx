"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ExecutiveAnalytics } from "@/lib/api/executive-analytics.service";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

export const STATUS_COLORS = {
  fully_completed: "#2C4A84",
  partly_completed: "#6B8AB8",
  not_started: "#94A3B8",
  cancelled: "#CBD5E1",
  compliance: "#16a34a",
  noncompliance: "#dc2626",
};

export const completionConfig = {
  fully_completed: { label: "Fully completed", color: STATUS_COLORS.fully_completed },
  partly_completed: { label: "Partly completed", color: STATUS_COLORS.partly_completed },
  not_started: { label: "Not started", color: STATUS_COLORS.not_started },
  cancelled: { label: "Cancelled", color: STATUS_COLORS.cancelled },
} satisfies ChartConfig;

export const progressConfig = {
  overall: { label: "Overall implementation", color: "#2C4A84" },
  reported: { label: "On reported", color: "#6B8AB8" },
  compliance: { label: "Compliance", color: STATUS_COLORS.compliance },
  noncompliance: { label: "Noncompliance", color: STATUS_COLORS.noncompliance },
  unreported: { label: "Unreported", color: "#dc2626" },
  avg: { label: "Avg progress", color: "#2C4A84" },
  reported_trend: { label: "Reported", color: "#2C4A84" },
  combined_trend: { label: "Reported + Unreported", color: "#C2410C" },
} satisfies ChartConfig;

export function EmptyChart({ message = "No chart data for the selected filters." }: { message?: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-lg border border-dashed px-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "muted";
}) {
  const tones = {
    default: "",
    primary: "border-blue-500/25 bg-blue-500/[0.08]",
    success: "border-emerald-500/30 bg-emerald-500/[0.10]",
    warning: "border-amber-500/30 bg-amber-500/[0.10]",
    danger: "border-red-500/35 bg-red-500/[0.12]",
    info: "border-sky-500/30 bg-sky-500/[0.10]",
    muted: "border-slate-400/25 bg-slate-500/[0.08]",
  };
  const valueTones = {
    default: "",
    primary: "text-blue-700 dark:text-blue-300",
    success: "text-emerald-700 dark:text-emerald-300",
    warning: "text-amber-700 dark:text-amber-300",
    danger: "text-red-700 dark:text-red-300",
    info: "text-sky-700 dark:text-sky-300",
    muted: "text-slate-700 dark:text-slate-300",
  };
  return (
    <Card className={tones[tone]}>
      <CardContent className="space-y-1 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={`text-3xl font-semibold tracking-tight tabular-nums ${valueTones[tone]}`}>
          {value}
        </p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function MainDashboardView({
  data,
  isDevelopment,
}: {
  data: ExecutiveAnalytics;
  isDevelopment: boolean;
}) {
  const completionStatus = data.completion_status ?? [];
  const byDivision = data.by_division ?? [];
  const byProject = data.by_project ?? [];
  const byQuarter = data.by_quarter ?? [];

  const completionPie = completionStatus
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item.label,
      value: item.count,
      percent: item.percent,
      count: item.count,
      fill:
        item.status === "completed"
          ? STATUS_COLORS.fully_completed
          : item.status === "in_progress"
            ? STATUS_COLORS.partly_completed
            : item.status === "not_started"
              ? STATUS_COLORS.not_started
              : STATUS_COLORS.cancelled,
    }));

  const divisionBars = byDivision.map((row) => ({
    code: row.division_short_name || row.division_code,
    fullName: row.division_name,
    overall: row.overall_implementation_percent,
    reported: row.implementation_on_reported_percent,
    compliance: row.compliance_percent,
    noncompliance: Math.max(0, 100 - row.compliance_percent),
    unreported: row.unreported,
  }));

  const divisionStack = byDivision.map((row) => ({
    code: row.division_short_name || row.division_code,
    fullName: row.division_name,
    fully_completed: row.completion_mix.fully_completed,
    partly_completed: row.completion_mix.partly_completed,
    not_started: row.completion_mix.not_started,
  }));

  const projectBars = byProject.map((row) => ({
    name: row.project_name.length > 26 ? `${row.project_name.slice(0, 26)}…` : row.project_name,
    fullName: row.project_name,
    avg: row.avg_progress_percent,
  }));

  // Grow chart height with row count so Recharts can paint every Y-axis code.
  const divisionChartHeight = Math.max(320, divisionBars.length * 28 + 48);
  const divisionChartClass = "aspect-auto w-full";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Overall compliance"
          value={`${data.kpis.overall_compliance_percent}%`}
          hint="Reported tasks ÷ total tasks"
          tone="success"
        />
        <KpiCard
          label="Total tasks"
          value={String(data.kpis.total_main_activities)}
          hint={`${data.kpis.reported_main_activities} reported`}
          tone="primary"
        />
        <KpiCard
          label="Un-reported tasks"
          value={String(data.kpis.unreported_main_activities)}
          hint="Still outstanding"
          tone="danger"
        />
        <KpiCard
          label="Overall implementation"
          value={`${data.kpis.overall_implementation_percent}%`}
          hint="Unreported tasks count as 0%"
          tone="info"
        />
        <KpiCard
          label="On reported tasks"
          value={`${data.kpis.implementation_on_reported_percent}%`}
          hint="Average of reported tasks"
          tone="muted"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Completion status on reported tasks</CardTitle>
            <CardDescription>Fully / partly / not started</CardDescription>
          </CardHeader>
          <CardContent>
            {completionPie.length === 0 ? (
              <EmptyChart />
            ) : (
              <>
                <ChartContainer config={completionConfig} className="mx-auto aspect-square max-h-[240px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={completionPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                      {completionPie.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="mt-2 grid grid-cols-1 gap-1.5">
                  {completionStatus.map((item) => (
                    <div key={item.status} className="flex items-center justify-between rounded-md border px-2.5 py-1.5 text-sm">
                      <span>{item.label}</span>
                      <span className="font-semibold tabular-nums">{item.percent}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overall implementation by division</CardTitle>
            <CardDescription>Compared with implementation on reported only</CardDescription>
          </CardHeader>
          <CardContent>
            {divisionBars.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer
                config={progressConfig}
                className={divisionChartClass}
                style={{ height: divisionChartHeight }}
              >
                <BarChart data={divisionBars} layout="vertical" margin={{ left: 4, right: 8 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis
                    dataKey="code"
                    type="category"
                    width={80}
                    interval={0}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.fullName || payload?.[0]?.payload?.code || ""
                        }
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="overall" fill="var(--color-overall)" radius={3} name="Overall" />
                  <Bar dataKey="reported" fill="var(--color-reported)" radius={3} name="On reported" />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Completion status by division</CardTitle>
            <CardDescription>Stacked mix on reported activities</CardDescription>
          </CardHeader>
          <CardContent>
            {divisionStack.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer
                config={completionConfig}
                className={divisionChartClass}
                style={{ height: divisionChartHeight }}
              >
                <BarChart data={divisionStack} layout="vertical" stackOffset="expand" margin={{ left: 4 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`} />
                  <YAxis
                    dataKey="code"
                    type="category"
                    width={80}
                    interval={0}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.fullName || payload?.[0]?.payload?.code || ""
                        }
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="fully_completed" stackId="a" fill="var(--color-fully_completed)" />
                  <Bar dataKey="partly_completed" stackId="a" fill="var(--color-partly_completed)" />
                  <Bar dataKey="not_started" stackId="a" fill="var(--color-not_started)" />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Compliance by division / unit</CardTitle>
            <CardDescription>Green = reported · Red = still outstanding</CardDescription>
          </CardHeader>
          <CardContent>
            {divisionBars.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer
                config={progressConfig}
                className={divisionChartClass}
                style={{ height: divisionChartHeight }}
              >
                <BarChart data={divisionBars} layout="vertical" stackOffset="expand" margin={{ left: 4 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`} />
                  <YAxis
                    dataKey="code"
                    type="category"
                    width={80}
                    interval={0}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.fullName || payload?.[0]?.payload?.code || ""
                        }
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="compliance" stackId="c" fill="var(--color-compliance)" name="Compliance" />
                  <Bar dataKey="noncompliance" stackId="c" fill="var(--color-noncompliance)" name="Noncompliance" />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Un-reported activities by division</CardTitle>
          </CardHeader>
          <CardContent>
            {divisionBars.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer
                config={progressConfig}
                className={divisionChartClass}
                style={{ height: Math.max(260, divisionBars.length * 28 + 48) }}
              >
                <BarChart data={divisionBars} layout="vertical" margin={{ left: 4 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    dataKey="code"
                    type="category"
                    width={80}
                    interval={0}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.fullName || payload?.[0]?.payload?.code || ""
                        }
                      />
                    }
                  />
                  <Bar dataKey="unreported" fill="var(--color-unreported)" radius={3} name="Unreported" />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {isDevelopment ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Overall implementation by project</CardTitle>
            </CardHeader>
            <CardContent>
              {projectBars.length === 0 ? (
                <EmptyChart message="No development project reports for this filter." />
              ) : (
                <ChartContainer config={progressConfig} className="h-[260px] w-full">
                  <BarChart data={projectBars} margin={{ bottom: 40 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-20} textAnchor="end" height={50} interval={0} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
                        />
                      }
                    />
                    <Bar dataKey="avg" fill="var(--color-avg)" radius={3} name="Avg progress" />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reporting volume by quarter</CardTitle>
            </CardHeader>
            <CardContent>
              {byQuarter.length === 0 ? (
                <EmptyChart />
              ) : (
                <ChartContainer config={progressConfig} className="aspect-auto h-[260px] w-full">
                  <BarChart
                    data={byQuarter.map((q) => ({
                      name: q.quarter_name,
                      avg: q.avg_progress_percent,
                    }))}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} tickLine={false} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="avg" fill="var(--color-avg)" radius={3} name="Avg progress" />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
