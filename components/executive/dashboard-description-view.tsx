"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutiveAnalytics, HierarchyItem } from "@/lib/api/executive-analytics.service";

function columnAverage(items: HierarchyItem[]): number {
  if (!items.length) return 0;
  return Math.round(
    items.reduce((sum, item) => sum + (item.avg_progress_percent || 0), 0) / items.length
  );
}

function ProgressRow({ item }: { item: HierarchyItem }) {
  return (
    <li className="rounded-md border bg-card px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium leading-relaxed">{item.name}</p>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            {item.code ? <span className="font-mono">{item.code}</span> : null}
            {item.reporting_status === "not_reported" ? (
              <Badge variant="outline" className="h-5 text-[10px]">
                Not reported
              </Badge>
            ) : item.reporting_status === "reported" ? (
              <Badge variant="secondary" className="h-5 text-[10px]">
                Reported
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-base font-semibold tabular-nums text-primary">
            {item.avg_progress_percent}%
          </p>
        </div>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(item.avg_progress_percent, 100)}%` }}
        />
      </div>
    </li>
  );
}

function HierarchyColumn({
  title,
  items,
  totalPercent,
}: {
  title: string;
  items: HierarchyItem[];
  totalPercent: number;
}) {
  return (
    <Card className="flex min-h-0 flex-col">
      <CardHeader className="border-b py-2.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="tabular-nums text-primary">
              {totalPercent}%
            </Badge>
            <Badge variant="secondary" className="tabular-nums">
              {items.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-2">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No submitted data</p>
        ) : (
          <ul className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {items.map((item) => (
              <ProgressRow key={item.id} item={item} />
            ))}
          </ul>
        )}
        {items.length > 0 ? (
          <div className="mt-auto flex items-center justify-between border-t px-1 pt-2 text-xs font-medium">
            <span className="text-muted-foreground">Total</span>
            <span className="tabular-nums text-primary">{totalPercent}%</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TaskBoard({
  items,
  totalPercent,
}: {
  items: HierarchyItem[];
  totalPercent: number;
}) {
  return (
    <Card>
      <CardHeader className="border-b py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold">Main Task</CardTitle>
            <p className="text-xs text-muted-foreground">
              Reported tasks with progress, quarters, and responsible unit
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="tabular-nums text-primary">
              Total {totalPercent}%
            </Badge>
            <Badge variant="secondary" className="tabular-nums">
              {items.length} task{items.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No submitted tasks</p>
        ) : (
          <ul className="grid max-h-[520px] gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col rounded-lg border bg-card p-3.5 shadow-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    {item.code ? (
                      <p className="font-mono text-[11px] text-muted-foreground">{item.code}</p>
                    ) : null}
                    <p className="text-sm font-medium leading-relaxed text-foreground">
                      {item.name}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-md bg-primary/10 px-2.5 py-1.5 text-center">
                    <p className="text-lg font-semibold leading-none tabular-nums text-primary">
                      {item.avg_progress_percent}%
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                      Progress
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(item.avg_progress_percent, 100)}%` }}
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
                  <div className="min-w-0 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Quarters
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.quarters?.length ? (
                        item.quarters.map((q) => (
                          <Badge key={q} variant="secondary" className="h-5 text-[10px]">
                            {q}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 space-y-1 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Resp.
                    </p>
                    <p className="truncate text-sm font-medium">
                      {item.responsible || "—"}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function DescriptionDashboardView({ data }: { data: ExecutiveAnalytics }) {
  const totals = data.hierarchy.column_totals;
  const objectiveTotal = totals?.objectives ?? columnAverage(data.hierarchy.objectives);
  const targetTotal = totals?.targets ?? columnAverage(data.hierarchy.targets);
  const activityTotal = totals?.activities ?? columnAverage(data.hierarchy.activities);
  const taskTotal = totals?.tasks ?? columnAverage(data.hierarchy.tasks || []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
        <p className="text-sm text-muted-foreground">
          Objective → Target → Activity → Main Task roll-up from submitted assessments
        </p>
        <Badge className="tabular-nums">Overall {data.hierarchy.total_percent}%</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <HierarchyColumn
          title="Objective"
          items={data.hierarchy.objectives}
          totalPercent={objectiveTotal}
        />
        <HierarchyColumn
          title="Target"
          items={data.hierarchy.targets}
          totalPercent={targetTotal}
        />
        <HierarchyColumn
          title="Activity"
          items={data.hierarchy.activities}
          totalPercent={activityTotal}
        />
      </div>

      <TaskBoard items={data.hierarchy.tasks || []} totalPercent={taskTotal} />
    </div>
  );
}
