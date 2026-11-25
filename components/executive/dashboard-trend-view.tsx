"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ExecutiveAnalytics, TrendPoint } from "@/lib/api/executive-analytics.service";
import { Area, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { EmptyChart, progressConfig } from "./dashboard-main-view";

function formatWeekLabel(value?: string | null) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function toSeries(points: TrendPoint[], valueKey: "reported" | "avg" | "combined") {
  return points
    .filter((p) => p.week)
    .map((p) => ({
      week: formatWeekLabel(p.week),
      weekRaw: p.week as string,
      [valueKey]: p.avg_progress_percent,
      submissions: p.submissions,
    }));
}

export function TrendDashboardView({ data }: { data: ExecutiveAnalytics }) {
  const reportedPoints = data.trend.reported || data.trend.overall || [];
  const combinedPoints = data.trend.reported_plus_unreported || [];

  const reportedSeries = toSeries(reportedPoints, "reported");
  const combinedMap = new Map(
    toSeries(combinedPoints, "combined").map((p) => [String(p.weekRaw), Number(p.combined ?? 0)])
  );

  const merged = reportedSeries.map((row) => ({
    week: String(row.week),
    weekRaw: String(row.weekRaw),
    reported: Number(row.reported ?? 0),
    combined: Number(combinedMap.get(String(row.weekRaw)) ?? row.reported ?? 0),
    submissions: Number(row.submissions ?? 0),
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance trend of reported activities (weekly)</CardTitle>
            <CardDescription>Average progress from submitted reports — actual weeks only</CardDescription>
          </CardHeader>
          <CardContent>
            {merged.length === 0 ? (
              <EmptyChart message="Not enough weekly submissions to plot a trend." />
            ) : (
              <ChartContainer config={progressConfig} className="aspect-auto h-[280px] w-full">
                <LineChart data={merged} margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="reported"
                    stroke="transparent"
                    fill="var(--color-reported_trend)"
                    fillOpacity={0.14}
                  />
                  <Line
                    type="monotone"
                    dataKey="reported"
                    stroke="var(--color-reported_trend)"
                    strokeWidth={2.75}
                    dot={{ r: 4.5, fill: "var(--color-reported_trend)" }}
                    activeDot={{ r: 6 }}
                    name="Reported"
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance trend (reported + unreported)</CardTitle>
            <CardDescription>
              Weekly sum of reported progress ÷ planned activities (unreported count as 0%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {merged.length === 0 ? (
              <EmptyChart />
            ) : (
              <ChartContainer config={progressConfig} className="aspect-auto h-[280px] w-full">
                <LineChart data={merged} margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="reported"
                    stroke="var(--color-reported_trend)"
                    strokeWidth={2.25}
                    dot={false}
                    name="Reported"
                  />
                  <Line
                    type="monotone"
                    dataKey="combined"
                    stroke="var(--color-combined_trend)"
                    strokeWidth={2.75}
                    dot={{ r: 4.5, fill: "var(--color-combined_trend)" }}
                    name="Reported + Unreported"
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Division performance trends</CardTitle>
          <CardDescription>Small multiples of weekly reported progress</CardDescription>
        </CardHeader>
        <CardContent>
          {data.trend.by_division.length === 0 ? (
            <EmptyChart message="Division trends appear after weekly submissions." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {data.trend.by_division.map((series) => {
                const points = toSeries(series.points, "avg").map((p) => ({
                  week: String(p.week),
                  avg: Number(p.avg ?? 0),
                }));
                const latest = series.points[series.points.length - 1]?.avg_progress_percent ?? 0;
                return (
                  <div key={series.division_short_name || series.division_code} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {series.division_short_name || series.division_code}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {series.division_name}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-primary">
                        {latest}%
                      </span>
                    </div>
                    <ChartContainer config={progressConfig} className="aspect-auto h-[140px] w-full">
                      <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={10} />
                        <YAxis domain={[0, 100]} hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="avg"
                          stroke="transparent"
                          fill="var(--color-avg)"
                          fillOpacity={0.16}
                        />
                        <Line
                          type="monotone"
                          dataKey="avg"
                          stroke="var(--color-avg)"
                          strokeWidth={2.75}
                          dot={{ r: 4, fill: "var(--color-avg)" }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
