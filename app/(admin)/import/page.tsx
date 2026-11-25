"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  FileSpreadsheet,
  Upload,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Database,
  ShieldCheck,
} from "lucide-react";
import PageHeading from "@/components/headers/page-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { env } from "@/lib/env";
import { authService } from "@/lib/api/auth.service";
import {
  financialYearService,
  type FinancialYear,
} from "@/lib/api/financial-year.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Step = "select" | "previewed" | "imported";

type UploadAction = "preview" | "import";

interface ImportError {
  sheet: string;
  row: number;
  error: string;
}

interface ImportResult {
  success: boolean;
  error: boolean;
  message: string;
  data: {
    created: Record<string, number>;
    skipped: number;
    errors: ImportError[];
  } | null;
}

interface PreviewRow {
  division: string;
  sub_vote_no: number;
  sub_vote_name: string;
  objective_code: string;
  objective_id: number;
  objective_name: string;
  target_code: string;
  target_id: number;
  target_name: string;
  activity_code: string;
  activity_id: number;
  activity_name: string;
  project_code: number;
  project_name: string;
  task_id: number;
  task_name: string;
  target_category: string;
  target_number: string | number;
  implementation_q1: boolean;
  implementation_q2: boolean;
  implementation_q3: boolean;
  implementation_q4: boolean;
  responsible: string;
}

interface PreviewSheet {
  sheet_name: string;
  row_count: number;
  rows: PreviewRow[];
}

interface PreviewResult {
  success: boolean;
  message: string;
  data: { sheets: PreviewSheet[] } | null;
}

interface IntegrityResult {
  success: boolean;
  message: string;
  data: Record<string, unknown> | null;
}

const formatLabel = (key: string) =>
  key.replace(/_/g, " ").replace(/\w/g, (c) => c.toUpperCase());

function MetricCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const colorClasses = {
    default: "bg-muted/50",
    success: "bg-green-50 dark:bg-green-950/30",
    warning: "bg-amber-50 dark:bg-amber-950/30",
    danger: "bg-red-50 dark:bg-red-950/30",
  };
  const textClasses = {
    default: "text-foreground",
    success: "text-green-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };
  return (
    <div
      className={`flex flex-col gap-1 rounded-lg p-3 ${colorClasses[variant]}`}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xl font-bold ${textClasses[variant]}`}>
        {value}
      </span>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DbIntegritySection({ db }: { db: Record<string, unknown> }) {
  const isValid = db.is_valid as boolean;
  const summary = (db.summary as Record<string, number>) || {};
  const scoreBreakdown =
    (summary.score_breakdown as unknown as Record<string, unknown>) || {};
  const issues = (db.issues as unknown[]) || [];
  const qualityScore = summary.quality_score as number;
  const qualityGrade = summary.quality_grade as unknown as string;
  const totalIssues = summary.total_issues as number;

  const orphanKeys = Object.keys(summary).filter((k) =>
    k.startsWith("orphan_"),
  );
  const totalKeys = Object.keys(summary).filter(
    (k) =>
      k.startsWith("total_") &&
      k !== "total_issues" &&
      k !== "total_division_project_links" &&
      k !== "total_division_objective_links",
  );
  const linkKeys = Object.keys(summary).filter((k) => k.includes("division_"));

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div
        className={`flex items-center gap-3 rounded-lg p-4 ${isValid ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}`}
      >
        {isValid ? (
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        ) : (
          <XCircle className="h-6 w-6 text-red-600" />
        )}
        <div>
          <p
            className={`font-semibold ${isValid ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
          >
            {isValid
              ? "Database integrity check passed — no issues found"
              : "Database integrity check found issues"}
          </p>
          <p className="text-sm text-muted-foreground">
            Quality Score: {qualityScore}/100 · Grade:{" "}
            <span className="font-bold">{qualityGrade}</span> · Total Issues:{" "}
            {totalIssues}
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Quality Score"
          value={qualityScore}
          variant={qualityScore >= 90 ? "success" : "warning"}
        />
        <MetricCard
          label="Grade"
          value={qualityGrade}
          variant={qualityGrade === "A" ? "success" : "warning"}
        />
        <MetricCard
          label="Total Issues"
          value={totalIssues}
          variant={totalIssues === 0 ? "success" : "danger"}
        />
        <MetricCard
          label="Valid"
          value={isValid ? "Yes" : "No"}
          variant={isValid ? "success" : "danger"}
        />
      </div>

      {/* Entity counts */}
      {totalKeys.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Database Summary</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {totalKeys.map((key) => (
              <MetricCard
                key={key}
                label={formatLabel(key)}
                value={summary[key]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Division links */}
      {linkKeys.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Division Links</h3>
          <div className="grid grid-cols-2 gap-3">
            {linkKeys.map((key) => (
              <MetricCard
                key={key}
                label={formatLabel(key)}
                value={summary[key]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Orphan checks */}
      {orphanKeys.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Orphan Checks</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {orphanKeys.map((key) => {
              const count = summary[key];
              return (
                <MetricCard
                  key={key}
                  label={formatLabel(key)}
                  value={count}
                  variant={count === 0 ? "success" : "danger"}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Score breakdown */}
      {Object.keys(scoreBreakdown).length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Score Breakdown</h3>
          <div className="space-y-3 rounded-lg bg-muted/30 p-4">
            {Object.entries(scoreBreakdown).map(([key, val]) => {
              if (key === "max_possible") return null;
              const earned =
                typeof val === "object" && val !== null
                  ? (val as Record<string, number>).earned
                  : (val as number);
              const max =
                typeof val === "object" && val !== null
                  ? (val as Record<string, number>).max
                  : (scoreBreakdown.max_possible as number);
              return (
                <ScoreBar
                  key={key}
                  label={formatLabel(key)}
                  value={earned}
                  max={max}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Issues list */}
      {issues.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Issues ({issues.length})
          </h3>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg bg-muted p-3">
            {issues.map((item, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                {typeof item === "object" && item !== null
                  ? JSON.stringify(item)
                  : String(item)}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExcelComparisonSection({ cmp }: { cmp: Record<string, unknown> }) {
  const isValid = cmp.is_valid as boolean;
  const summary = (cmp.summary as Record<string, number>) || {};
  const discrepancies = (cmp.discrepancies as unknown[]) || [];
  const perSheet =
    (cmp.per_sheet_comparison as Record<
      string,
      Record<string, Record<string, number>>
    >) || {};

  const comparisonScore = summary.comparison_score as number;
  const comparisonGrade = summary.comparison_grade as unknown as string;
  const totalDiscrepancies = summary.total_discrepancies as number;

  const entities = ["projects", "objectives", "targets", "activities", "tasks"];
  const sheetEntityTypes = [
    "projects",
    "objectives",
    "targets",
    "activities",
    "tasks",
  ];

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div
        className={`flex items-center gap-3 rounded-lg p-4 ${isValid ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}`}
      >
        {isValid ? (
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        ) : (
          <XCircle className="h-6 w-6 text-red-600" />
        )}
        <div>
          <p
            className={`font-semibold ${isValid ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
          >
            {isValid
              ? "Excel files match the database — no discrepancies found"
              : "Discrepancies found between Excel and database"}
          </p>
          <p className="text-sm text-muted-foreground">
            Comparison Score: {comparisonScore}/100 · Grade:{" "}
            <span className="font-bold">{comparisonGrade}</span> ·
            Discrepancies: {totalDiscrepancies}
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Comparison Score"
          value={comparisonScore}
          variant={comparisonScore >= 90 ? "success" : "warning"}
        />
        <MetricCard
          label="Grade"
          value={comparisonGrade}
          variant={comparisonGrade === "A" ? "success" : "warning"}
        />
        <MetricCard
          label="Discrepancies"
          value={totalDiscrepancies}
          variant={totalDiscrepancies === 0 ? "success" : "danger"}
        />
        <MetricCard
          label="Valid"
          value={isValid ? "Yes" : "No"}
          variant={isValid ? "success" : "danger"}
        />
      </div>

      {/* Per-entity comparison */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Excel vs Database Counts</h3>
        <div className="space-y-3">
          {entities.map((entity) => {
            const excelCount = summary[`excel_${entity}`] as number;
            const dbCount = summary[`db_${entity}`] as number;
            const matched = summary[`${entity}_matched`] as number;
            const missingInDb = summary[`${entity}_missing_in_db`] as number;
            const missingInExcel = summary[
              `${entity}_missing_in_excel`
            ] as number;

            if (excelCount === undefined) return null;

            return (
              <div key={entity} className="rounded-lg border p-4">
                <h4 className="mb-3 text-sm font-semibold capitalize">
                  {formatLabel(entity)}
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <MetricCard
                    label="Excel"
                    value={excelCount}
                    variant="default"
                  />
                  <MetricCard
                    label="Database"
                    value={dbCount}
                    variant="default"
                  />
                  <MetricCard
                    label="Matched"
                    value={matched}
                    variant="success"
                  />
                  <MetricCard
                    label="Missing in DB"
                    value={missingInDb}
                    variant={missingInDb === 0 ? "success" : "danger"}
                  />
                  <MetricCard
                    label="Missing in Excel"
                    value={missingInExcel}
                    variant={missingInExcel === 0 ? "success" : "danger"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-sheet comparison */}
      {Object.keys(perSheet).length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">
            Per-Sheet (Division) Comparison
          </h3>
          <div className="max-h-[60vh] overflow-auto rounded-lg border">
            <table className="w-full caption-bottom text-sm">
              <thead className="bg-muted/50 sticky top-0 z-10 [&_tr]:border-y">
                <tr>
                  <th
                    className="whitespace-nowrap p-2 text-left font-medium"
                    rowSpan={2}
                  >
                    Sheet
                  </th>
                  {sheetEntityTypes.map((entity) => (
                    <th
                      key={entity}
                      className="whitespace-nowrap p-2 text-center font-medium capitalize"
                      colSpan={5}
                    >
                      {formatLabel(entity)}
                    </th>
                  ))}
                </tr>
                <tr>
                  {sheetEntityTypes.map((entity) => (
                    <Fragment key={entity}>
                      <th className="whitespace-nowrap p-2 text-right text-xs font-medium">
                        Excel
                      </th>
                      <th className="whitespace-nowrap p-2 text-right text-xs font-medium">
                        DB
                      </th>
                      <th className="whitespace-nowrap p-2 text-right text-xs font-medium">
                        Match
                      </th>
                      <th className="whitespace-nowrap p-2 text-right text-xs font-medium">
                        Miss DB
                      </th>
                      <th className="whitespace-nowrap p-2 text-right text-xs font-medium">
                        Miss Excel
                      </th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(perSheet).map(([sheet, entities]) => {
                  const getStat = (entity: string, key: string): number => {
                    const e = entities[entity];
                    if (!e) return 0;
                    return (e[key] as number) ?? 0;
                  };
                  return (
                    <tr key={sheet} className="border-b">
                      <td className="whitespace-nowrap p-2 font-medium">
                        {sheet}
                      </td>
                      {sheetEntityTypes.map((entity) => {
                        const excel = getStat(entity, "excel_count");
                        const db = getStat(entity, "db_count");
                        const matched = getStat(entity, "matched");
                        const missDb = getStat(entity, "missing_in_db");
                        const missExcel = getStat(entity, "missing_in_excel");
                        return (
                          <Fragment key={entity}>
                            <td className="p-2 text-right">{excel}</td>
                            <td className="p-2 text-right">{db}</td>
                            <td className="p-2 text-right">
                              <span
                                className={
                                  matched === excel && matched > 0
                                    ? "text-green-600"
                                    : "text-amber-600"
                                }
                              >
                                {matched}
                              </span>
                            </td>
                            <td className="p-2 text-right">
                              <span
                                className={
                                  missDb === 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {missDb}
                              </span>
                            </td>
                            <td className="p-2 text-right">
                              <span
                                className={
                                  missExcel === 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {missExcel}
                              </span>
                            </td>
                          </Fragment>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Discrepancies list */}
      {discrepancies.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Discrepancies ({discrepancies.length})
          </h3>
          <div className="max-h-[50vh] overflow-auto rounded-lg border">
            <Table className="min-w-full">
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="whitespace-nowrap">Type</TableHead>
                  <TableHead className="whitespace-nowrap">Sheet</TableHead>
                  <TableHead className="whitespace-nowrap">Issue</TableHead>
                  <TableHead className="min-w-[300px]">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discrepancies.map((item, i) => {
                  const disc =
                    typeof item === "object" && item !== null
                      ? (item as Record<string, string>)
                      : { detail: String(item) };
                  const isInExcelNotDb =
                    disc.issue?.toLowerCase().includes("excel") &&
                    !disc.issue?.toLowerCase().includes("database");
                  return (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {disc.type ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium">
                        {disc.sheet ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span
                          className={
                            isInExcelNotDb
                              ? "text-xs font-medium text-amber-600"
                              : "text-xs font-medium text-red-600"
                          }
                        >
                          {disc.issue ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {disc.detail ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrityDataRenderer({ data }: { data: Record<string, unknown> }) {
  const dbIntegrity = data.db_integrity as Record<string, unknown> | undefined;
  const excelComparison = data.excel_vs_db_comparison as
    | Record<string, unknown>
    | undefined;
  const filesChecked = data.files_checked as string[] | undefined;

  // POST response: has nested db_integrity and excel_vs_db_comparison
  if (dbIntegrity) {
    return (
      <div className="space-y-8">
        {filesChecked && filesChecked.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/50 p-3">
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Files checked:
            </span>
            {filesChecked.map((f, i) => (
              <Badge key={i} variant="secondary">
                {f}
              </Badge>
            ))}
          </div>
        )}

        <div>
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <Database className="h-5 w-5" />
            Database Integrity
          </h3>
          <DbIntegritySection db={dbIntegrity} />
        </div>

        {excelComparison && (
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <FileSpreadsheet className="h-5 w-5" />
              Excel vs Database Comparison
            </h3>
            <ExcelComparisonSection cmp={excelComparison} />
          </div>
        )}
      </div>
    );
  }

  // GET response: fields directly on data
  if (data.is_valid !== undefined && data.summary !== undefined) {
    return <DbIntegritySection db={data} />;
  }

  // Fallback: generic rendering for unknown structures
  return (
    <div className="space-y-3 rounded-lg bg-muted/50 p-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="space-y-1">
          <p className="text-sm font-medium capitalize">{formatLabel(key)}</p>
          <p className="text-sm text-muted-foreground">
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </p>
        </div>
      ))}
    </div>
  );
}

const PREVIEW_COLUMNS: { key: keyof PreviewRow; label: string }[] = [
  { key: "division", label: "Division" },
  { key: "sub_vote_no", label: "Sub Vote No" },
  { key: "sub_vote_name", label: "Sub Vote Name" },
  { key: "objective_code", label: "Obj Code" },
  { key: "objective_id", label: "Obj ID" },
  { key: "objective_name", label: "Objective Name" },
  { key: "target_code", label: "Target Code" },
  { key: "target_id", label: "Target ID" },
  { key: "target_name", label: "Target Name" },
  { key: "activity_code", label: "Activity Code" },
  { key: "activity_id", label: "Activity ID" },
  { key: "activity_name", label: "Activity Name" },
  { key: "project_code", label: "Project Code" },
  { key: "project_name", label: "Project Name" },
  { key: "task_id", label: "Task ID" },
  { key: "task_name", label: "Task Name" },
  { key: "target_category", label: "Category" },
  { key: "target_number", label: "Target Number" },
  { key: "implementation_q1", label: "Q1" },
  { key: "implementation_q2", label: "Q2" },
  { key: "implementation_q3", label: "Q3" },
  { key: "implementation_q4", label: "Q4" },
  { key: "responsible", label: "Responsible" },
];

export default function ImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const integrityFileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [budgetType, setBudgetType] = useState<"development" | "recurring">(
    "development",
  );
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [financialYearId, setFinancialYearId] = useState<string>("");
  const [loadingFinancialYears, setLoadingFinancialYears] = useState(true);
  const [step, setStep] = useState<Step>("select");
  const [uploading, setUploading] = useState(false);
  const [uploadAction, setUploadAction] = useState<UploadAction>("preview");
  const [progress, setProgress] = useState(0);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(
    null,
  );
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [integrityResult, setIntegrityResult] =
    useState<IntegrityResult | null>(null);
  const [integrityLoading, setIntegrityLoading] = useState(false);
  const [integrityError, setIntegrityError] = useState<string | null>(null);
  const [integrityFiles, setIntegrityFiles] = useState<File[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingFinancialYears(true);
        const response = await financialYearService.getFinancialYears();
        const years = response.results ?? [];
        if (cancelled) return;
        setFinancialYears(years);
        const current = years.find((fy) => fy.is_current) ?? years[0];
        if (current) {
          setFinancialYearId(String(current.id));
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load financial years");
        }
      } finally {
        if (!cancelled) setLoadingFinancialYears(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedFinancialYear = financialYears.find(
    (fy) => String(fy.id) === financialYearId,
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith(".xlsx")) {
        toast.error("Please select an .xlsx file");
        return;
      }
      setFile(selected);
      setPreviewResult(null);
      setImportResult(null);
      setError(null);
      setStep("select");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (!dropped.name.endsWith(".xlsx")) {
        toast.error("Please select an .xlsx file");
        return;
      }
      setFile(dropped);
      setPreviewResult(null);
      setImportResult(null);
      setError(null);
      setStep("select");
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewResult(null);
    setImportResult(null);
    setError(null);
    setProgress(0);
    setStep("select");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateBudgetTypeMatch = (
    selectedFile: File,
    type: string,
  ): boolean => {
    const name = selectedFile.name.toLowerCase();
    if (type === "development") {
      return name.includes("dev") || name.includes("development");
    }
    if (type === "recurring") {
      return name.includes("rec") || name.includes("recurring");
    }
    return true;
  };

  const handleUpload = (action: UploadAction) => {
    if (!file) {
      toast.error("Please select an Excel file first");
      return;
    }

    if (!financialYearId) {
      toast.error("Please select a financial year");
      return;
    }

    if (!validateBudgetTypeMatch(file, budgetType)) {
      toast.error(
        `The selected file does not appear to be a "${budgetType}" budget file. Please check the file name or select the correct budget type.`,
      );
      setError(
        `File name "${file.name}" does not match budget type "${budgetType}". Development files should contain "Dev" and recurring files should contain "Recurring" in the name.`,
      );
      return;
    }

    setUploading(true);
    setUploadAction(action);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    if (action === "import") {
      formData.append("budget_type", budgetType);
      formData.append("financial_year", financialYearId);
    }

    const endpoint =
      action === "preview"
        ? "/v1.0/planning/import/preview/"
        : "/v1.0/planning/import/";

    const url = `${env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`;
    const token = authService.getToken();

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setProgress(pct);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      try {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (action === "preview") {
            const response = JSON.parse(xhr.responseText) as PreviewResult;
            if (response.success) {
              setPreviewResult(response);
              const firstSheet = response.data?.sheets?.[0]?.sheet_name ?? "";
              setActiveSheet(firstSheet);
              setStep("previewed");
              toast.success(response.message);
            } else {
              setError(response.message);
              toast.error(response.message);
            }
          } else {
            const response = JSON.parse(xhr.responseText) as ImportResult;
            if (response.success) {
              setImportResult(response);
              setStep("imported");
              toast.success(response.message);
            } else {
              setError(response.message);
              toast.error(response.message);
            }
          }
        } else {
          const response = JSON.parse(xhr.responseText);
          const msg = response.message || `Server error (${xhr.status})`;
          setError(msg);
          toast.error(msg);
        }
      } catch {
        setError("Failed to parse server response");
        toast.error("Failed to parse server response");
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError("Network error — could not reach the server");
      toast.error("Network error — could not reach the server");
    };

    xhr.open("POST", url);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.send(formData);
  };

  const handleIntegrityFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selected = Array.from(e.target.files ?? []);
    const valid = selected.filter((f) => {
      if (!f.name.endsWith(".xlsx")) {
        toast.error(`${f.name} is not an .xlsx file`);
        return false;
      }
      return true;
    });
    if (valid.length > 0) {
      setIntegrityFiles((prev) => [...prev, ...valid]);
    }
    if (e.target) e.target.value = "";
  };

  const handleIntegrityDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files ?? []);
    const valid = dropped.filter((f) => {
      if (!f.name.endsWith(".xlsx")) {
        toast.error(`${f.name} is not an .xlsx file`);
        return false;
      }
      return true;
    });
    if (valid.length > 0) {
      setIntegrityFiles((prev) => [...prev, ...valid]);
    }
  };

  const removeIntegrityFile = (index: number) => {
    setIntegrityFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIntegrityCheck = async (withFile: boolean) => {
    if (withFile && integrityFiles.length === 0) {
      toast.error("Please select at least one Excel file first");
      return;
    }

    setIntegrityLoading(true);
    setIntegrityError(null);
    setIntegrityResult(null);

    const token = authService.getToken();
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/v1.0/planning/integrity-check/`;

    try {
      let body: FormData | undefined;
      if (withFile && integrityFiles.length > 0) {
        body = new FormData();
        integrityFiles.forEach((f) => body!.append("file", f));
      }

      const response = await fetch(url, {
        method: withFile ? "POST" : "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body,
      });

      const json = (await response.json()) as IntegrityResult;

      if (!response.ok || !json.success) {
        const msg = json.message || `Server error (${response.status})`;
        setIntegrityError(msg);
        toast.error(msg);
        return;
      }

      setIntegrityResult(json);
      toast.success(json.message);
    } catch {
      setIntegrityError("Failed to run integrity check");
      toast.error("Failed to run integrity check");
    } finally {
      setIntegrityLoading(false);
    }
  };

  const handleBackToSelect = () => {
    setStep("select");
    setPreviewResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Import & Data Integrity"
        description="Upload Excel data, preview before importing, and verify database integrity"
      />

      <Tabs defaultValue="import">
        <TabsList>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Data
          </TabsTrigger>
          <TabsTrigger value="integrity" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Integrity Check
          </TabsTrigger>
        </TabsList>

        {/* ─── Import Tab ─── */}
        <TabsContent value="import" className="space-y-6">
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`flex items-center gap-2 ${step === "select" ? "font-semibold" : "text-green-600"}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${step === "select" ? "bg-primary text-primary-foreground" : "bg-green-600 text-white"}`}
              >
                {step === "select" ? "1" : <CheckCircle2 className="h-4 w-4" />}
              </span>
              Select &amp; Preview
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div
              className={`flex items-center gap-2 ${step === "previewed" ? "font-semibold" : step === "imported" ? "text-green-600" : "text-muted-foreground"}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${step === "previewed" ? "bg-primary text-primary-foreground" : step === "imported" ? "bg-green-600 text-white" : "bg-muted"}`}
              >
                {step === "imported" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  "2"
                )}
              </span>
              Review Preview
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div
              className={`flex items-center gap-2 ${step === "imported" ? "font-semibold text-green-600" : "text-muted-foreground"}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${step === "imported" ? "bg-green-600 text-white" : "bg-muted"}`}
              >
                {step === "imported" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  "3"
                )}
              </span>
              Import Complete
            </div>
          </div>

          {/* Step 1: File selection & preview */}
          {step === "select" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Step 1 — Select Excel File
                </CardTitle>
                <CardDescription>
                  Each sheet in the workbook represents a Division. The file is
                  parsed and mapped to Targets, Activities, Tasks, and more.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Budget type selection */}
                <div className="space-y-2">
                  <Label>Budget Type</Label>
                  <Select
                    value={budgetType}
                    onValueChange={(v) =>
                      setBudgetType(v as "development" | "recurring")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Select the budget type for this import before uploading the
                    file.
                  </p>
                </div>

                {/* Financial year selection */}
                <div className="space-y-2">
                  <Label>Financial Year</Label>
                  <Select
                    value={financialYearId}
                    onValueChange={setFinancialYearId}
                    disabled={loadingFinancialYears || financialYears.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingFinancialYears
                            ? "Loading financial years…"
                            : financialYears.length === 0
                              ? "No financial years available"
                              : "Select financial year"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {financialYears.map((fy) => (
                        <SelectItem key={fy.id} value={String(fy.id)}>
                          {fy.name}
                          {fy.is_current ? " (current)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose which financial year the imported data should be
                    filled into.
                  </p>
                </div>

                {/* File upload area */}
                <div className="space-y-2">
                  <Label>Excel File</Label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center transition-colors hover:border-muted-foreground/50"
                  >
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileSpreadsheet
                          className={`h-8 w-8 ${validateBudgetTypeMatch(file, budgetType) ? "text-green-600" : "text-amber-500"}`}
                        />
                        <span className="font-medium">{file.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        {!validateBudgetTypeMatch(file, budgetType) && (
                          <span className="text-sm font-medium text-amber-600">
                            Warning: This file name does not contain "
                            {budgetType === "development" ? "dev" : "rec"}". It
                            may not match the selected budget type.
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="font-medium">
                          Click to browse or drag &amp; drop
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Only .xlsx files are supported
                        </span>
                      </div>
                    )}
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Upload progress */}
                {uploading && uploadAction === "preview" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        Uploading for preview…
                      </span>
                      <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpload("preview")}
                    disabled={
                      !file ||
                      !financialYearId ||
                      uploading ||
                      (file && !validateBudgetTypeMatch(file, budgetType))
                    }
                    className="flex items-center gap-2"
                  >
                    {uploading && uploadAction === "preview" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    Preview Data
                  </Button>
                  {file && !uploading && (
                    <Button variant="outline" onClick={resetForm}>
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error display */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="flex items-start gap-3 pt-6">
                <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">
                    Import Failed
                  </p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Preview results & import confirmation */}
          {step === "previewed" && previewResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Step 2 — Review Preview
                </CardTitle>
                <CardDescription>
                  {previewResult.message}. Review the parsed data below, then
                  confirm to import into the selected financial year.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sheet tabs */}
                {previewResult.data?.sheets &&
                  previewResult.data.sheets.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {previewResult.data.sheets.map((sheet) => (
                        <Button
                          key={sheet.sheet_name}
                          type="button"
                          variant={
                            activeSheet === sheet.sheet_name
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveSheet(sheet.sheet_name)}
                        >
                          {sheet.sheet_name}
                          <Badge variant="secondary" className="ml-2">
                            {sheet.row_count}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  )}

                {/* Data table for active sheet */}
                {previewResult.data?.sheets &&
                  previewResult.data.sheets.find(
                    (s) => s.sheet_name === activeSheet,
                  ) && (
                    <div className="max-h-[60vh] overflow-auto rounded-lg border">
                      <Table className="w-max min-w-full table-auto">
                        <TableHeader className="bg-background sticky top-0 z-10">
                          <TableRow>
                            {PREVIEW_COLUMNS.map((col) => (
                              <TableHead
                                key={col.key}
                                className="overflow-visible text-clip whitespace-nowrap"
                              >
                                {col.label}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewResult.data.sheets
                            .find((s) => s.sheet_name === activeSheet)
                            ?.rows.map((row, i) => (
                              <TableRow key={i}>
                                {PREVIEW_COLUMNS.map((col) => (
                                  <TableCell
                                    key={col.key}
                                    className="overflow-visible text-clip whitespace-nowrap"
                                  >
                                    {col.key.startsWith("implementation_q")
                                      ? row[col.key]
                                        ? "✓"
                                        : "—"
                                      : String(row[col.key] ?? "")}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                {/* Budget type & financial year reminder */}
                <div className="rounded-lg bg-muted/50 space-y-1 p-3">
                  <p className="text-sm text-muted-foreground">
                    Budget Type:{" "}
                    <span className="font-medium text-foreground capitalize">
                      {budgetType}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Financial Year:{" "}
                    <span className="font-medium text-foreground">
                      {selectedFinancialYear?.name ?? "—"}
                    </span>
                  </p>
                </div>

                {/* Import progress */}
                {uploading && uploadAction === "import" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Importing…</span>
                      <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpload("import")}
                    disabled={uploading || !financialYearId}
                    className="flex items-center gap-2"
                  >
                    {uploading && uploadAction === "import" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4" />
                    )}
                    Confirm Import
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBackToSelect}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Import result */}
          {step === "imported" && importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Step 3 — Import Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                    <CheckCircle2
                      className="h-14 w-14 text-green-600"
                      strokeWidth={2.5}
                    />
                  </div>
                  <p className="text-lg font-semibold text-green-600">
                    Import Completed Successfully
                  </p>
                </div>
                <p className="font-medium">{importResult.message}</p>
                {importResult.data?.created && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold">
                      Records Created
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(importResult.data.created).map(
                        ([key, count]) => (
                          <Badge
                            key={key}
                            variant="secondary"
                            className="capitalize"
                          >
                            {key}: {count}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}
                {importResult.data?.errors &&
                  importResult.data.errors.length > 0 && (
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Errors ({importResult.data.errors.length})
                      </h3>
                      <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg bg-muted p-3">
                        {importResult.data.errors.map((err, i) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            <span className="font-medium">{err.sheet}</span> —
                            Row {err.row}: {err.error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                {importResult.data && (
                  <p className="text-sm text-muted-foreground">
                    Skipped: {importResult.data.skipped}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import Another File
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── Integrity Check Tab ─── */}
        <TabsContent value="integrity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Data Integrity Check
              </CardTitle>
              <CardDescription>
                Run orphan checks on the database, or compare the selected Excel
                file against what is stored in the database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File upload for comparison */}
              <div className="space-y-2">
                <Label>Excel Files (for comparison)</Label>
                <div
                  onDrop={handleIntegrityDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => integrityFileRef.current?.click()}
                  className="flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 text-center transition-colors hover:border-muted-foreground/50"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="h-7 w-7 text-muted-foreground" />
                    <span className="font-medium">
                      Click to browse or drag &amp; drop
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Upload one or more .xlsx files (e.g. Dev &amp; Rec)
                    </span>
                  </div>
                  <Input
                    ref={integrityFileRef}
                    type="file"
                    accept=".xlsx"
                    multiple
                    onChange={handleIntegrityFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Selected files list */}
                {integrityFiles.length > 0 && (
                  <div className="space-y-2">
                    {integrityFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-muted/50 p-2"
                      >
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{f.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(f.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIntegrityFile(i)}
                          className="h-7 w-7 p-0"
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleIntegrityCheck(false)}
                  disabled={integrityLoading}
                  className="flex items-center gap-2"
                >
                  {integrityLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  Check Database
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleIntegrityCheck(true)}
                  disabled={integrityFiles.length === 0 || integrityLoading}
                  className="flex items-center gap-2"
                >
                  {integrityLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  Compare With Selected Files
                </Button>
              </div>

              {integrityError && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive p-3">
                  <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                  <p className="text-sm text-muted-foreground">
                    {integrityError}
                  </p>
                </div>
              )}

              {integrityResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="font-medium text-green-700 dark:text-green-400">
                      {integrityResult.message}
                    </p>
                  </div>
                  {integrityResult.data && (
                    <IntegrityDataRenderer data={integrityResult.data} />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
