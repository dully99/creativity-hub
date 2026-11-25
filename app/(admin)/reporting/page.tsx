"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeading from "@/components/headers/page-heading";
import {
  ReportingStepper,
  StepItem,
} from "@/components/reporting/reporting-stepper";
import {
  SelectionStep,
  SelectionOption,
} from "@/components/reporting/selection-step";
import { TaskAssessmentStep } from "@/components/reporting/task-assessment-step";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  dodosoService,
  BudgetTypeOption,
  UserContext,
  DodosoItem,
  TaskAssessmentData,
  ActivityAssessmentData,
  DodosoReport,
} from "@/lib/api/dodoso.service";
import { Quarter } from "@/lib/api/quarter.service";
import { divisionService } from "@/lib/api/division.service";
import {
  completionStatusLabel,
  deriveCompletionStatus,
} from "@/lib/derive-completion-status";
import { toast } from "sonner";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  AlertCircle,
  Send,
  Save,
} from "lucide-react";

type WizardStep =
  | "budget_type"
  | "project"
  | "objective"
  | "target"
  | "activity"
  | "task"
  | "review";

interface WizardState {
  budgetType: string | null;
  budgetTypeLabel: string;
  projectId: number | null;
  projectName: string;
  objectiveId: number | null;
  objectiveName: string;
  targetId: number | null;
  targetName: string;
  targetDataType: string;
  activityId: number | null;
  activityName: string;
  activityFinancialYear: number | null;
  activityAssessment: ActivityAssessmentData;
  selectedTaskIds: number[];
  assessments: Record<number, TaskAssessmentData>;
  reportId: number | null;
  editingSubmitted: boolean;
}

const INITIAL_ACTIVITY_ASSESSMENT: ActivityAssessmentData = {
  activity_quarter: null,
  activity_completion_status: "not_started",
  activity_progress_percentage: 0,
};

const INITIAL_STATE: WizardState = {
  budgetType: null,
  budgetTypeLabel: "",
  projectId: null,
  projectName: "",
  objectiveId: null,
  objectiveName: "",
  targetId: null,
  targetName: "",
  targetDataType: "percentage",
  activityId: null,
  activityName: "",
  activityFinancialYear: null,
  activityAssessment: INITIAL_ACTIVITY_ASSESSMENT,
  selectedTaskIds: [],
  assessments: {},
  reportId: null,
  editingSubmitted: false,
};

function getCurrentQuarter(quarters: Quarter[]): Quarter | undefined {
  return (
    quarters.find((q) => q.is_current) ??
    quarters.find((q) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(q.start_date);
      const end = new Date(q.end_date);
      return today >= start && today <= end;
    })
  );
}

function getStepSequence(budgetType: string | null): WizardStep[] {
  if (budgetType === "development") {
    return [
      "budget_type",
      "project",
      "objective",
      "target",
      "activity",
      "task",
      "review",
    ];
  }
  return ["budget_type", "objective", "target", "activity", "task", "review"];
}

const STEP_LABELS: Record<WizardStep, string> = {
  budget_type: "Budget Type",
  project: "Project",
  objective: "Objective",
  target: "Target",
  activity: "Activity",
  task: "Tasks",
  review: "Review",
};

export default function ReportingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <ReportingPageContent />
    </Suspense>
  );
}

function ReportingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasResumedRef = useRef(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>("budget_type");
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  // Division id used for dodoso queries. When the focal person's assigned
  // org unit is a section, the API expects the parent division id instead.
  const [queryDivisionId, setQueryDivisionId] = useState<number | null>(null);
  const [budgetTypes, setBudgetTypes] = useState<BudgetTypeOption[]>([]);
  const [projects, setProjects] = useState<DodosoItem[]>([]);
  const [objectives, setObjectives] = useState<DodosoItem[]>([]);
  const [targets, setTargets] = useState<DodosoItem[]>([]);
  const [activities, setActivities] = useState<DodosoItem[]>([]);
  const [tasks, setTasks] = useState<DodosoItem[]>([]);
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStepLoading, setIsStepLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  const steps = useMemo(() => {
    return getStepSequence(state.budgetType).map(
      (id): StepItem => ({ id, label: STEP_LABELS[id] }),
    );
  }, [state.budgetType]);

  const activityQuarters = useMemo(() => {
    if (!state.activityFinancialYear) return quarters;
    return quarters.filter(
      (q) => q.financial_year === state.activityFinancialYear,
    );
  }, [quarters, state.activityFinancialYear]);

  // Quarters come from task configuration (add task), not a wizard step.
  const assignedActivityQuarters = useMemo(() => {
    const fromTasks = new Set<number>();
    tasks.forEach((task) => {
      (task.implementation_quarters ?? []).forEach((id) => fromTasks.add(id));
    });
    if (fromTasks.size > 0) {
      return quarters.filter((q) => fromTasks.has(q.id));
    }
    return activityQuarters;
  }, [tasks, quarters, activityQuarters]);

  const currentAssignedQuarter = useMemo(
    () =>
      getCurrentQuarter(assignedActivityQuarters) ??
      getCurrentQuarter(activityQuarters),
    [assignedActivityQuarters, activityQuarters],
  );

  useEffect(() => {
    setState((s) => {
      if (s.activityAssessment.activity_quarter) return s;
      const defaultQuarterId =
        currentAssignedQuarter?.id ?? assignedActivityQuarters[0]?.id ?? null;
      if (!defaultQuarterId) return s;
      return {
        ...s,
        activityAssessment: {
          ...s.activityAssessment,
          activity_quarter: defaultQuarterId,
        },
      };
    });
  }, [currentAssignedQuarter, assignedActivityQuarters]);

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    try {
      const [context, types, quarterRes] = await Promise.all([
        dodosoService.getUserContext(),
        dodosoService.getBudgetTypes(),
        dodosoService.getQuarters(),
      ]);
      setUserContext(context);
      setBudgetTypes(types);
      setQuarters(quarterRes);

      let resolvedDivisionId = context.division_id;
      if (resolvedDivisionId != null) {
        try {
          const divisions = await divisionService.getDivisions();
          const assigned = divisions.find((d) => d.id === resolvedDivisionId);
          if (assigned?.division_type === "section") {
            resolvedDivisionId =
              assigned.parent ?? assigned.parent_id ?? resolvedDivisionId;
          }
        } catch {
          // Fall back to the raw context division id.
        }
      }
      setQueryDivisionId(resolvedDivisionId);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reporting context.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const resumeToTaskStep = useCallback(async () => {
    if (hasResumedRef.current || isLoading || queryDivisionId == null) return;
    if (searchParams.get("step") !== "task") return;

    const activityId = Number(searchParams.get("activityId") || "");
    if (!activityId) return;

    hasResumedRef.current = true;
    setIsResuming(true);

    try {
      const reportIdParam = searchParams.get("reportId");
      const reportId = reportIdParam ? Number(reportIdParam) : null;
      const taskIdParam = searchParams.get("taskId");
      const focusTaskId = taskIdParam ? Number(taskIdParam) : null;

      let report: DodosoReport | undefined;
      if (reportId) {
        try {
          report = await dodosoService.getReport(reportId);
        } catch {
          report = undefined;
        }
      }
      if (!report) {
        try {
          const drafts = await dodosoService.getDrafts();
          report = Array.isArray(drafts)
            ? drafts.find((d) => d.activity === activityId)
            : undefined;
        } catch (draftError) {
          console.warn(
            "Could not load drafts while resuming assessment:",
            draftError,
          );
        }
      }

      const editingSubmitted =
        searchParams.get("editSubmitted") === "1" ||
        report?.status === "submitted";

      const budgetType =
        report?.budget_type || searchParams.get("budgetType") || "recurring";
      const budgetTypeLabel =
        budgetTypes.find((b) => b.value === budgetType)?.label ||
        (budgetType === "development" ? "Development" : "Recurring");
      const projectId =
        report?.project ??
        (searchParams.get("projectId")
          ? Number(searchParams.get("projectId"))
          : null);
      const objectiveId =
        report?.objective ??
        (searchParams.get("objectiveId")
          ? Number(searchParams.get("objectiveId"))
          : null);
      const targetId =
        report?.target ??
        (searchParams.get("targetId")
          ? Number(searchParams.get("targetId"))
          : null);
      const activityName =
        report?.activity_name ||
        searchParams.get("activityName") ||
        `Activity #${activityId}`;
      const objectiveName =
        report?.objective_name || searchParams.get("objectiveName") || "";
      const targetName =
        report?.target_name || searchParams.get("targetName") || "";
      const projectName =
        report?.project_name || searchParams.get("projectName") || "";
      const financialYear = searchParams.get("financialYear")
        ? Number(searchParams.get("financialYear"))
        : null;

      if (!objectiveId || !targetId) {
        toast.error(
          "Cannot open this assessment — missing objective or target.",
        );
        return;
      }

      if (budgetType === "development") {
        try {
          const projectData = await dodosoService.getProjects(
            queryDivisionId,
          );
          setProjects(projectData);
        } catch (projectError) {
          console.warn("Could not load projects while resuming:", projectError);
        }
      }

      const [objectiveData, targetData, activityData, taskData] =
        await Promise.all([
          dodosoService.getObjectives({
            divisionId: queryDivisionId,
            budgetType,
            projectId: projectId ?? undefined,
          }),
          dodosoService.getTargets(objectiveId, queryDivisionId),
          dodosoService.getActivities(targetId, queryDivisionId),
          dodosoService.getTasks(activityId),
        ]);
      setObjectives(objectiveData);
      setTargets(targetData);
      setActivities(activityData);
      setTasks(taskData);

      const assessments: Record<number, TaskAssessmentData> = {};
      let selectedTaskIds: number[] = [];

      if (report?.report_tasks?.length) {
        for (const rt of report.report_tasks) {
          const taskMeta = taskData.find((t) => t.id === rt.task);
          if (taskMeta?.completed_in_prior_quarter) continue;
          selectedTaskIds.push(rt.task);
          assessments[rt.task] = {
            task: rt.task,
            completion_status: rt.completion_status || "not_started",
            progress_percentage: rt.progress_percentage ?? null,
            progress_date: rt.progress_date || undefined,
            achievement_description: rt.achievement_description || undefined,
            challenges: rt.challenges || undefined,
            remarks: rt.remarks || undefined,
          };
        }
      } else if (focusTaskId) {
        const focusTask = taskData.find((t) => t.id === focusTaskId);
        if (!focusTask?.completed_in_prior_quarter) {
          selectedTaskIds = [focusTaskId];
          assessments[focusTaskId] = {
            task: focusTaskId,
            completion_status: "not_started",
            progress_percentage: null,
            quarters: focusTask?.implementation_quarters ?? [],
          };
        }
      }

      const matchedActivity = activityData.find((a) => a.id === activityId);
      const matchedTarget = targetData.find((t) => t.id === targetId);

      setState({
        budgetType,
        budgetTypeLabel,
        projectId,
        projectName,
        objectiveId,
        objectiveName,
        targetId,
        targetName,
        targetDataType: matchedTarget?.data_type ?? "percentage",
        activityId,
        activityName: matchedActivity?.name ?? activityName,
        activityFinancialYear: matchedActivity?.financial_year ?? financialYear,
        activityAssessment: {
          activity_quarter: report?.activity_quarter ?? null,
          activity_completion_status:
            report?.activity_completion_status || "not_started",
          activity_progress_percentage:
            report?.activity_progress_percentage ?? 0,
          activity_progress_date: report?.activity_progress_date,
          activity_achievement_description:
            report?.activity_achievement_description,
          activity_challenges: report?.activity_challenges,
          activity_remarks: report?.activity_remarks,
        },
        selectedTaskIds,
        assessments,
        reportId: report?.id ?? reportId,
        editingSubmitted,
      });
      setCurrentStep("task");
      router.replace("/reporting");
    } catch (error) {
      console.error(error);
      hasResumedRef.current = false;
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to open task assessment.";
      toast.error(message);
    } finally {
      setIsResuming(false);
    }
  }, [budgetTypes, isLoading, router, searchParams, queryDivisionId]);

  useEffect(() => {
    void resumeToTaskStep();
  }, [resumeToTaskStep]);

  const goNext = () => {
    const sequence = getStepSequence(state.budgetType);
    const idx = sequence.indexOf(currentStep);
    if (idx < sequence.length - 1) setCurrentStep(sequence[idx + 1]);
  };

  const goBack = () => {
    const sequence = getStepSequence(state.budgetType);
    const idx = sequence.indexOf(currentStep);
    if (idx > 0) setCurrentStep(sequence[idx - 1]);
  };

  const handleBudgetTypeSelect = async (value: string, label: string) => {
    setState((s) => ({
      ...s,
      budgetType: value,
      budgetTypeLabel: label,
      projectId: null,
      projectName: "",
      objectiveId: null,
      objectiveName: "",
      targetId: null,
      targetName: "",
      activityId: null,
      activityName: "",
      activityFinancialYear: null,
      activityAssessment: INITIAL_ACTIVITY_ASSESSMENT,
      selectedTaskIds: [],
      assessments: {},
      reportId: null,
      editingSubmitted: false,
    }));

    if (value === "development" && queryDivisionId != null) {
      setIsStepLoading(true);
      try {
        const data = await dodosoService.getProjects(queryDivisionId);
        setProjects(data);
      } catch {
        toast.error("Failed to load projects.");
      } finally {
        setIsStepLoading(false);
      }
    }
  };

  const handleProjectSelect = async (id: number) => {
    const project = projects.find((p) => p.id === id);
    setState((s) => ({
      ...s,
      projectId: id,
      projectName: project?.name ?? "",
      objectiveId: null,
      objectiveName: "",
      targetId: null,
      targetName: "",
      activityId: null,
      activityName: "",
      activityFinancialYear: null,
      activityAssessment: INITIAL_ACTIVITY_ASSESSMENT,
      selectedTaskIds: [],
      assessments: {},
      reportId: null,
      editingSubmitted: false,
    }));

    if (queryDivisionId != null && state.budgetType) {
      setIsStepLoading(true);
      try {
        const data = await dodosoService.getObjectives({
          divisionId: queryDivisionId,
          budgetType: state.budgetType,
          projectId: id,
        });
        setObjectives(data);
      } catch {
        toast.error("Failed to load objectives.");
      } finally {
        setIsStepLoading(false);
      }
    }
  };

  const handleObjectiveSelect = async (id: number) => {
    const objective = objectives.find((o) => o.id === id);
    setState((s) => ({
      ...s,
      objectiveId: id,
      objectiveName: objective?.name ?? "",
      targetId: null,
      targetName: "",
      activityId: null,
      activityName: "",
      activityFinancialYear: null,
      activityAssessment: INITIAL_ACTIVITY_ASSESSMENT,
      selectedTaskIds: [],
      assessments: {},
      reportId: null,
      editingSubmitted: false,
    }));

    setIsStepLoading(true);
    try {
      const data = await dodosoService.getTargets(id, queryDivisionId);
      setTargets(data);
    } catch {
      toast.error("Failed to load targets.");
    } finally {
      setIsStepLoading(false);
    }
  };

  const handleTargetSelect = async (id: number) => {
    const target = targets.find((t) => t.id === id);
    setState((s) => ({
      ...s,
      targetId: id,
      targetName: target?.name ?? "",
      targetDataType: target?.data_type ?? "percentage",
      activityId: null,
      activityName: "",
      activityFinancialYear: null,
      activityAssessment: INITIAL_ACTIVITY_ASSESSMENT,
      selectedTaskIds: [],
      assessments: {},
      reportId: null,
      editingSubmitted: false,
    }));

    setIsStepLoading(true);
    try {
      const data = await dodosoService.getActivities(
        id,
        queryDivisionId,
      );
      setActivities(data);
    } catch {
      toast.error("Failed to load activities.");
    } finally {
      setIsStepLoading(false);
    }
  };

  const handleActivitySelect = async (id: number) => {
    const activity = activities.find((a) => a.id === id);
    setState((s) => ({
      ...s,
      activityId: id,
      activityName: activity?.name ?? "",
      activityFinancialYear: activity?.financial_year ?? null,
      activityAssessment: INITIAL_ACTIVITY_ASSESSMENT,
      selectedTaskIds: [],
      assessments: {},
      reportId: null,
      editingSubmitted: false,
    }));

    setIsStepLoading(true);
    try {
      const data = await dodosoService.getTasks(id);
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks.");
    } finally {
      setIsStepLoading(false);
    }
  };

  const loadObjectivesForRecurring = async (budgetType: string) => {
    if (queryDivisionId == null) return;
    setIsStepLoading(true);
    try {
      const data = await dodosoService.getObjectives({
        divisionId: queryDivisionId,
        budgetType,
      });
      setObjectives(data);
    } catch {
      toast.error("Failed to load objectives.");
    } finally {
      setIsStepLoading(false);
    }
  };

  const saveDraft = async (options?: {
    stayOnStep?: boolean;
    silent?: boolean;
  }): Promise<number | null> => {
    if (
      !state.budgetType ||
      !state.objectiveId ||
      !state.targetId ||
      !state.activityId
    ) {
      toast.error("Select budget type through activity before saving a draft.");
      return null;
    }
    if (state.selectedTaskIds.length === 0) {
      toast.error("Please select at least one task.");
      return null;
    }
    if (!state.activityAssessment.activity_quarter) {
      toast.error("No active reporting quarter is available for these tasks.");
      return null;
    }

    const closedTasks = tasks.filter(
      (task) =>
        state.selectedTaskIds.includes(task.id) &&
        task.reporting_frequency === "weekly" &&
        task.reporting_window_open === false &&
        !state.editingSubmitted,
    );
    if (closedTasks.length > 0) {
      toast.error(
        `Reporting window is closed for: ${closedTasks.map((t) => t.name).join(", ")}`,
      );
      return null;
    }

    const priorCompletedTasks = tasks.filter(
      (task) =>
        state.selectedTaskIds.includes(task.id) &&
        task.completed_in_prior_quarter === true,
    );
    if (priorCompletedTasks.length > 0) {
      toast.error(
        `Already fully completed in an earlier quarter: ${priorCompletedTasks
          .map((t) =>
            t.prior_completion_quarter_name
              ? `${t.name} (${t.prior_completion_quarter_name})`
              : t.name,
          )
          .join(", ")}`,
      );
      return null;
    }

    for (const taskId of state.selectedTaskIds) {
      const task = tasks.find((t) => t.id === taskId);
      const assessment = state.assessments[taskId];
      if (!task || !assessment) continue;
      const dataType = task.data_type ?? "percentage";
      const progress = assessment.progress_percentage ?? 0;
      if (progress < 0) {
        toast.error(`Progress for "${task.name}" cannot be negative.`);
        return null;
      }
      if (dataType === "percentage" && progress > 100) {
        toast.error(`Progress for "${task.name}" cannot exceed 100%.`);
        return null;
      }
      if (
        dataType === "number" &&
        task.target_value != null &&
        progress > task.target_value
      ) {
        toast.error(
          `Progress for "${task.name}" cannot exceed the target of ${task.target_value}.`,
        );
        return null;
      }
      if (task.reporting_frequency === "weekly") {
        const previousTotal = task.previous_total ?? 0;
        const max =
          dataType === "percentage"
            ? Math.max(0, 100 - previousTotal)
            : task.target_value != null
              ? Math.max(0, task.target_value - previousTotal)
              : undefined;
        if (max != null && progress > max) {
          toast.error(
            dataType === "percentage"
              ? `Progress for "${task.name}" cannot exceed ${max}% left this period (max 100%).`
              : `Progress for "${task.name}" cannot exceed ${max} left against the target.`,
          );
          return null;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const taskData = state.selectedTaskIds
        .map((id) => {
          const task = tasks.find((t) => t.id === id);
          const assessment = state.assessments[id];
          if (!assessment) return null;
          const dataType = task?.data_type ?? state.targetDataType;
          const isWeekly = task?.reporting_frequency === "weekly";
          const thisWeek = assessment.progress_percentage ?? 0;
          const previousTotal = isWeekly ? (task?.previous_total ?? 0) : 0;
          const effective = isWeekly ? previousTotal + thisWeek : thisWeek;
          return {
            ...assessment,
            progress_percentage: assessment.progress_percentage ?? 0,
            completion_status: deriveCompletionStatus(
              effective,
              dataType,
              task?.target_value,
            ),
            remarks: assessment.remarks?.trim() || undefined,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item != null);
      const payload = {
        budget_type: state.budgetType,
        project: state.projectId,
        objective: state.objectiveId,
        target: state.targetId,
        activity: state.activityId,
        ...state.activityAssessment,
        task_data: taskData,
      };

      let reportId = state.reportId;
      if (reportId) {
        await dodosoService.updateReport(reportId, payload);
      } else {
        const report = await dodosoService.createReport(payload);
        reportId = report.id;
        setState((s) => ({ ...s, reportId }));
      }

      if (options?.stayOnStep && !options?.silent) {
        toast.success(
          state.editingSubmitted ? "Changes saved." : "Draft saved.",
        );
      }
      return reportId;
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : null;
      toast.error(message || "Failed to save report draft.");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const reportId = await saveDraft({ stayOnStep: true, silent: true });
    if (!reportId) return;
    if (state.editingSubmitted) {
      toast.success("Changes saved.");
      return;
    }
    toast.success("Draft saved.");
    router.push("/draft-reports");
  };

  const handleContinue = async () => {
    if (currentStep === "budget_type") {
      if (!state.budgetType) {
        toast.error("Please select a budget type.");
        return;
      }
      if (state.budgetType === "recurring") {
        await loadObjectivesForRecurring(state.budgetType);
      }
      goNext();
      return;
    }

    if (currentStep === "project" && !state.projectId) {
      toast.error("Please select a project.");
      return;
    }
    if (currentStep === "objective" && !state.objectiveId) {
      toast.error("Please select an objective.");
      return;
    }
    if (currentStep === "target" && !state.targetId) {
      toast.error("Please select a target.");
      return;
    }
    if (currentStep === "activity" && !state.activityId) {
      toast.error("Please select an activity.");
      return;
    }

    if (currentStep === "task") {
      const reportId = await saveDraft();
      if (reportId) goNext();
      return;
    }

    goNext();
  };

  const handleSubmit = async () => {
    const closedTasks = tasks.filter(
      (task) =>
        state.selectedTaskIds.includes(task.id) &&
        task.reporting_frequency === "weekly" &&
        task.reporting_window_open === false &&
        !state.editingSubmitted,
    );
    if (closedTasks.length > 0) {
      toast.error(
        `Cannot submit outside the reporting window for: ${closedTasks
          .map((t) => t.name)
          .join(", ")}`,
      );
      return;
    }

    const reportId = await saveDraft({ stayOnStep: true, silent: true });
    if (!reportId) return;

    if (state.editingSubmitted) {
      toast.success("Report updated successfully!");
      setState(INITIAL_STATE);
      setCurrentStep("budget_type");
      router.push("/submitted-reports");
      return;
    }

    setIsSubmitting(true);
    try {
      await dodosoService.submitReport(reportId);
      toast.success("Report submitted successfully!");
      setState(INITIAL_STATE);
      setCurrentStep("budget_type");
      router.push("/submitted-reports");
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : null;
      toast.error(message || "Failed to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildTaskAssessment = (taskId: number): TaskAssessmentData => {
    const task = tasks.find((t) => t.id === taskId);
    return {
      task: taskId,
      quarters: task?.implementation_quarters ?? [],
      completion_status: "not_started",
      // Leave progress empty until the user enters a value (including 0).
      progress_percentage: null,
    };
  };

  const handleToggleTask = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task?.completed_in_prior_quarter) {
      toast.error(
        `"${task.name}" was fully completed${
          task.prior_completion_quarter_name
            ? ` in ${task.prior_completion_quarter_name}`
            : " in an earlier quarter"
        } and cannot be answered again.`,
      );
      return;
    }
    const isWeekly = task?.reporting_frequency === "weekly";
    if (
      isWeekly &&
      task &&
      task.reporting_window_open === false &&
      !state.editingSubmitted
    ) {
      toast.error(
        `Reporting window is closed for "${task.name}"${
          task.reporting_window_label ? ` (${task.reporting_window_label})` : ""
        }.`,
      );
      return;
    }
    if (isWeekly && task?.reported_this_week && !state.editingSubmitted) {
      toast.error(`You already submitted "${task.name}" for this week.`);
      return;
    }
    setState((s) => {
      const isSelected = s.selectedTaskIds.includes(taskId);
      const selectedTaskIds = isSelected
        ? s.selectedTaskIds.filter((id) => id !== taskId)
        : [...s.selectedTaskIds, taskId];
      const assessments = { ...s.assessments };
      if (!isSelected) {
        assessments[taskId] = buildTaskAssessment(taskId);
      } else {
        delete assessments[taskId];
      }
      return { ...s, selectedTaskIds, assessments };
    });
  };

  const handleSetSelectedTaskIds = (taskIds: number[]) => {
    const allowedIds = taskIds.filter((id) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return false;
      if (task.completed_in_prior_quarter) return false;
      if (state.editingSubmitted) return true;
      const isWeekly = task.reporting_frequency === "weekly";
      if (isWeekly && task.reporting_window_open === false) return false;
      if (isWeekly && task.reported_this_week) return false;
      return true;
    });
    setState((s) => {
      const assessments: Record<number, TaskAssessmentData> = {};
      for (const id of allowedIds) {
        assessments[id] = s.assessments[id] ?? buildTaskAssessment(id);
      }
      return { ...s, selectedTaskIds: allowedIds, assessments };
    });
  };

  const handleUpdateAssessment = (
    taskId: number,
    data: Partial<TaskAssessmentData>,
  ) => {
    setState((s) => ({
      ...s,
      assessments: {
        ...s.assessments,
        [taskId]: { ...s.assessments[taskId], ...data, task: taskId },
      },
    }));
  };

  const toOptions = (items: DodosoItem[]): SelectionOption[] =>
    items.map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: item.description,
      meta: item.code,
    }));

  const toObjectiveOptions = (items: DodosoItem[]): SelectionOption[] =>
    items.map((item) => {
      const linkedProjects =
        item.project_names && item.project_names.length > 0
          ? item.project_names.join(", ")
          : (item.project_name ?? undefined);
      return {
        id: item.id,
        title: item.name,
        subtitle: linkedProjects
          ? `Projects: ${linkedProjects}`
          : item.description,
        meta: item.code,
      };
    });

  const toTargetOptions = (items: DodosoItem[]): SelectionOption[] =>
    items.map((item) => {
      const linkedObjectives =
        item.objective_names && item.objective_names.length > 0
          ? item.objective_names.join(", ")
          : (item.objective_name ?? undefined);
      return {
        id: item.id,
        title: item.name,
        subtitle: linkedObjectives
          ? `Objectives: ${linkedObjectives}`
          : item.description,
        meta: item.code,
      };
    });

  const toActivityOptions = (items: DodosoItem[]): SelectionOption[] =>
    items.map((item) => {
      const parts: string[] = [];
      if (item.project_names && item.project_names.length > 0)
        parts.push(`Projects: ${item.project_names.join(", ")}`);
      else if (item.project_name) parts.push(`Project: ${item.project_name}`);
      if (item.objective_names && item.objective_names.length > 0)
        parts.push(`Objectives: ${item.objective_names.join(", ")}`);
      else if (item.objective_name)
        parts.push(`Objective: ${item.objective_name}`);
      return {
        id: item.id,
        title: item.name,
        subtitle: parts.length > 0 ? parts.join(" · ") : item.description,
        meta: item.code,
      };
    });

  const canContinue = useMemo(() => {
    switch (currentStep) {
      case "budget_type":
        return !!state.budgetType;
      case "project":
        return !!state.projectId;
      case "objective":
        return !!state.objectiveId;
      case "target":
        return !!state.targetId;
      case "activity":
        return !!state.activityId;
      case "task":
        return state.selectedTaskIds.length > 0;
      default:
        return true;
    }
  }, [currentStep, state]);

  if (isLoading || isResuming) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <PageHeading
        title="Report Assessment"
        description="Complete the questionnaire to report activity and task progress"
      />

      {!userContext?.division_id && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your account has no division assigned. Contact an administrator
            before reporting.
          </AlertDescription>
        </Alert>
      )}

      {userContext?.division_id && (
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="flex flex-wrap items-center gap-4 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Unit/Division:</span>
              <span className="font-medium">{userContext.division_name}</span>
              {userContext.division_code && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {userContext.division_code}
                </Badge>
              )}
            </div>
            {userContext.position_name && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">
                  Responsible Office:
                </span>
                <span className="font-medium">{userContext.position_name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6 space-y-6">
          <ReportingStepper steps={steps} currentStep={currentStep} />

          <div className="min-h-[320px]">
            {currentStep === "budget_type" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold">
                    Which action plan are you reporting for?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Select the budget type for this assessment.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {budgetTypes.length === 0 ? (
                    <Alert className="sm:col-span-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No plan budget types are configured. Ask an
                        administrator to add them under Plan Budget Types before
                        reporting.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    budgetTypes.map((bt) => {
                      const isSelected = state.budgetType === bt.value;
                      return (
                        <button
                          key={bt.value}
                          type="button"
                          onClick={() =>
                            handleBudgetTypeSelect(bt.value, bt.label)
                          }
                          className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:bg-accent/50 ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : ""
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {isSelected && (
                              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <p className="text-sm font-medium leading-snug">
                              {bt.label}
                            </p>
                            {bt.description && (
                              <p className="text-xs text-muted-foreground leading-snug">
                                {bt.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {currentStep === "project" && (
              <SelectionStep
                title="Select Project"
                description="Choose the development project you are reporting on."
                options={toOptions(projects)}
                selectedId={state.projectId}
                onSelect={handleProjectSelect}
                isLoading={isStepLoading}
                onSearch={(query) => {
                  if (queryDivisionId == null) return;
                  void dodosoService
                    .getProjects(queryDivisionId, query)
                    .then(setProjects)
                    .catch(() => toast.error("Failed to search projects."));
                }}
              />
            )}

            {currentStep === "objective" && (
              <SelectionStep
                title="Select Objective"
                description="Choose the strategic objective."
                options={toObjectiveOptions(objectives)}
                selectedId={state.objectiveId}
                onSelect={handleObjectiveSelect}
                isLoading={isStepLoading}
                onSearch={(query) => {
                  if (queryDivisionId == null || !state.budgetType) return;
                  void dodosoService
                    .getObjectives({
                      divisionId: queryDivisionId,
                      budgetType: state.budgetType,
                      projectId: state.projectId ?? undefined,
                      search: query,
                    })
                    .then(setObjectives)
                    .catch(() => toast.error("Failed to search objectives."));
                }}
              />
            )}

            {currentStep === "target" && (
              <SelectionStep
                title="Select Target"
                description="Choose the measurable target under this objective."
                options={toTargetOptions(targets)}
                selectedId={state.targetId}
                onSelect={handleTargetSelect}
                isLoading={isStepLoading}
                onSearch={(query) => {
                  if (!state.objectiveId) return;
                  void dodosoService
                    .getTargets(state.objectiveId, queryDivisionId, query)
                    .then(setTargets)
                    .catch(() => toast.error("Failed to search targets."));
                }}
              />
            )}

            {currentStep === "activity" && (
              <SelectionStep
                title="Select Activity"
                description="Choose the activity linked to this target."
                options={toActivityOptions(activities)}
                selectedId={state.activityId}
                onSelect={handleActivitySelect}
                isLoading={isStepLoading}
                onSearch={(query) => {
                  if (!state.targetId) return;
                  void dodosoService
                    .getActivities(state.targetId, queryDivisionId, query)
                    .then(setActivities)
                    .catch(() => toast.error("Failed to search activities."));
                }}
              />
            )}

            {currentStep === "task" && (
              <TaskAssessmentStep
                tasks={tasks}
                selectedTaskIds={state.selectedTaskIds}
                assessments={state.assessments}
                onToggleTask={handleToggleTask}
                onSetSelectedTaskIds={handleSetSelectedTaskIds}
                onUpdateAssessment={handleUpdateAssessment}
                targetDataType={state.targetDataType}
                isLoading={isStepLoading}
                forceSelectableTaskIds={
                  state.editingSubmitted ? tasks.map((t) => t.id) : []
                }
              />
            )}

            {currentStep === "review" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold">Review & Submit</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Confirm your selections before submitting the report.
                  </p>
                </div>
                <dl className="divide-y rounded-lg border">
                  {[
                    { label: "Budget Type", value: state.budgetTypeLabel },
                    state.projectName
                      ? { label: "Project", value: state.projectName }
                      : null,
                    { label: "Objective", value: state.objectiveName },
                    { label: "Target", value: state.targetName },
                    { label: "Activity", value: state.activityName },
                  ]
                    .filter(
                      (row): row is { label: string; value: string } =>
                        row !== null,
                    )
                    .map((row) => (
                      <div
                        key={row.label}
                        className="flex gap-4 px-4 py-3 text-sm"
                      >
                        <dt className="w-32 shrink-0 text-muted-foreground">
                          {row.label}
                        </dt>
                        <dd className="font-medium">{row.value}</dd>
                      </div>
                    ))}
                </dl>

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Tasks ({state.selectedTaskIds.length})
                  </p>
                  {state.selectedTaskIds.length === 0 ? (
                    <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                      No tasks selected.
                    </p>
                  ) : (
                    <div className="divide-y rounded-lg border">
                      {state.selectedTaskIds.map((taskId) => {
                        const task = tasks.find((t) => t.id === taskId);
                        const assessment = state.assessments[taskId];
                        const dataType =
                          task?.data_type ?? state.targetDataType;
                        const isWeekly = task?.reporting_frequency === "weekly";
                        const thisWeek = assessment?.progress_percentage ?? 0;
                        const previousTotal = isWeekly
                          ? (task?.previous_total ?? 0)
                          : 0;
                        const total = isWeekly
                          ? previousTotal + thisWeek
                          : thisWeek;
                        const status = completionStatusLabel(
                          deriveCompletionStatus(
                            total,
                            dataType,
                            task?.target_value,
                          ),
                        );
                        const formatProgress = (value: number) =>
                          dataType === "number"
                            ? task?.target_value != null
                              ? `${value} / ${task.target_value}`
                              : String(value)
                            : `${value}%`;

                        return (
                          <div
                            key={taskId}
                            className="space-y-1.5 px-4 py-3 text-sm"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">
                                {task?.name ?? `Task #${taskId}`}
                              </p>
                              {task?.code ? (
                                <span className="font-mono text-[11px] text-muted-foreground">
                                  {task.code}
                                </span>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span>
                                Status:{" "}
                                <span className="font-medium text-foreground">
                                  {status}
                                </span>
                              </span>
                              {isWeekly ? (
                                <>
                                  <span>
                                    This week:{" "}
                                    <span className="font-medium tabular-nums text-foreground">
                                      {formatProgress(thisWeek)}
                                    </span>
                                  </span>
                                  <span>
                                    Total:{" "}
                                    <span className="font-medium tabular-nums text-foreground">
                                      {formatProgress(total)}
                                    </span>
                                  </span>
                                </>
                              ) : (
                                <span>
                                  Progress:{" "}
                                  <span className="font-medium tabular-nums text-foreground">
                                    {formatProgress(thisWeek)}
                                  </span>
                                </span>
                              )}
                            </div>
                            {isWeekly &&
                            (task?.weekly_answers?.length ?? 0) > 0 ? (
                              <div className="space-y-0.5 pt-1 text-xs text-muted-foreground">
                                {task?.weekly_answers?.map((week, index) => (
                                  <div
                                    key={`${week.week_start ?? index}-${week.submitted_at ?? index}`}
                                    className="flex justify-between gap-3"
                                  >
                                    <span>
                                      Week{" "}
                                      {week.week_start
                                        ? new Date(
                                            `${week.week_start}T00:00:00`,
                                          ).toLocaleDateString(undefined, {
                                            day: "numeric",
                                            month: "short",
                                          })
                                        : index + 1}
                                    </span>
                                    <span className="tabular-nums text-foreground">
                                      {dataType === "number"
                                        ? String(week.progress_percentage ?? 0)
                                        : `${week.progress_percentage ?? 0}%`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                            {assessment?.remarks ? (
                              <p className="text-xs text-muted-foreground">
                                Comment:{" "}
                                <span className="text-foreground">
                                  {assessment.remarks}
                                </span>
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={currentStep === "budget_type" || isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {(currentStep === "task" || currentStep === "review") && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={
                    isSubmitting ||
                    queryDivisionId == null ||
                    state.selectedTaskIds.length === 0
                  }
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSubmitting
                    ? "Saving..."
                    : state.editingSubmitted
                      ? "Save Changes"
                      : "Save Draft"}
                </Button>
              )}

              {currentStep === "review" ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    (!state.reportId &&
                      !state.editingSubmitted &&
                      state.selectedTaskIds.length === 0)
                  }
                >
                  <Send className="h-4 w-4 mr-1" />
                  {isSubmitting
                    ? "Saving..."
                    : state.editingSubmitted
                      ? "Update Report"
                      : "Submit Report"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={
                    !canContinue || isSubmitting || queryDivisionId == null
                  }
                >
                  {isSubmitting ? "Saving..." : "Continue"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
