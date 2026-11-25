"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ExecutiveAnalytics } from "@/lib/api/executive-analytics.service";
import {
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { EmptyChart, KpiCard } from "./dashboard-main-view";

const trackerConfig = {
  progress: { label: "Avg actual % completion", color: "#2C4A84" },
} satisfies ChartConfig;

function formatMonthDay(value?: string | null) {
  if (!value) return "";
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric" });
}

function formatMonthDayShort(value?: string | null) {
  if (!value) return "";
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function toDayNumber(value: string) {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.floor(date.getTime() / 86_400_000);
}

export function TrackerDashboardView({ data }: { data: ExecutiveAnalytics }) {
  const [issuesOnly, setIssuesOnly] = useState(false);

  const activities = useMemo(() => {
    const list = data.tracker?.activities || [];
    return issuesOnly ? list.filter((a) => a.has_issues) : list;
  }, [data.tracker?.activities, issuesOnly]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Activities · data entry tracker</CardTitle>
            <CardDescription>
              Average of actual % completion vs Month Day
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <EmptyChart message="No activity progress points yet for this filter." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {activities.map((activity) => {
                  const points = activity.points.map((p) => ({
                    x: toDayNumber(p.date),
                    y: p.progress_percent,
                    label: formatMonthDay(p.date),
                    shortLabel: formatMonthDayShort(p.date),
                    date: p.date,
                  }));
                  const xDomain =
                    points.length === 1
                      ? [points[0].x - 2, points[0].x + 2]
                      : ["dataMin - 1", "dataMax + 1"];

                  return (
                    <div key={activity.activity_id} className="rounded-lg border p-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-medium leading-snug">
                            {activity.activity_name}
                          </p>
                          {activity.activity_code ? (
                            <p className="font-mono text-[11px] text-muted-foreground">
                              {activity.activity_code}
                            </p>
                          ) : null}
                        </div>
                        <Badge
                          variant={activity.has_issues ? "destructive" : "secondary"}
                          className="tabular-nums"
                        >
                          {activity.latest_progress_percent}%
                        </Badge>
                      </div>

                      <ChartContainer
                        config={trackerConfig}
                        className="aspect-auto h-[220px] w-full"
                      >
                        <ComposedChart
                          data={points}
                          margin={{ top: 18, right: 12, bottom: 28, left: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            type="number"
                            dataKey="x"
                            name="Month Day"
                            domain={xDomain as [number | string, number | string]}
                            tickFormatter={(value) => {
                              const match = points.find((p) => p.x === value);
                              return match?.shortLabel || "";
                            }}
                            ticks={points.map((p) => p.x)}
                            angle={-35}
                            textAnchor="end"
                            height={48}
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            label={{
                              value: "Month Day",
                              position: "insideBottom",
                              offset: -18,
                              style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
                            }}
                          />
                          <YAxis
                            type="number"
                            dataKey="y"
                            name="Avg actual % completion"
                            domain={[0, 100]}
                            width={44}
                            tickFormatter={(v) => `${v}`}
                            tickLine={false}
                            axisLine={false}
                            label={{
                              value: "Average of actual % completion",
                              angle: -90,
                              position: "insideLeft",
                              offset: 8,
                              style: { fill: "hsl(var(--muted-foreground))", fontSize: 10 },
                            }}
                          />
                          <ZAxis range={[90, 90]} />
                          <ChartTooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            content={
                              <ChartTooltipContent
                                labelFormatter={(_, payload) =>
                                  payload?.[0]?.payload?.label || "Month Day"
                                }
                                formatter={(value) => (
                                  <span className="font-mono font-medium">
                                    Avg actual % completion: {value}%
                                  </span>
                                )}
                              />
                            }
                          />
                          {points.length > 1 ? (
                            <Line
                              type="monotone"
                              dataKey="y"
                              stroke="var(--color-progress)"
                              strokeWidth={1.5}
                              strokeOpacity={0.35}
                              dot={false}
                              isAnimationActive={false}
                            />
                          ) : null}
                          <Scatter dataKey="y" fill="var(--color-progress)">
                            <LabelList
                              dataKey="y"
                              position="top"
                              offset={8}
                              className="fill-foreground text-[10px] font-semibold"
                              formatter={(value: number) => `${value}`}
                            />
                          </Scatter>
                        </ComposedChart>
                      </ChartContainer>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <KpiCard
            label="# indicators"
            value={String(data.tracker?.indicator_count ?? data.kpis.indicators ?? 0)}
            hint="Activities with progress history"
            tone="primary"
          />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">With issues</CardTitle>
              <CardDescription>Latest progress under 50%</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <button
                type="button"
                onClick={() => setIssuesOnly(false)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                  !issuesOnly
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => setIssuesOnly(true)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                  issuesOnly
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                Yes
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
