/** Derive task completion status from entered progress. */

export type DerivedCompletionStatus = "not_started" | "in_progress" | "completed";

/**
 * Percentage tasks are scored out of 100.
 * Number tasks are scored against target_value.
 * For weekly reporting, pass the cumulative total (prior weeks + this week).
 */
export function deriveCompletionStatus(
  progress: number | null | undefined,
  dataType?: string | null,
  targetValue?: number | null
): DerivedCompletionStatus {
  const value = Number(progress ?? 0);
  if (!Number.isFinite(value) || value <= 0) {
    return "not_started";
  }

  if (dataType === "number") {
    const target = Number(targetValue ?? 0);
    if (target > 0 && value >= target) {
      return "completed";
    }
    return "in_progress";
  }

  // percentage (default)
  if (value >= 100) {
    return "completed";
  }
  return "in_progress";
}

export function completionStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case "completed":
      return "Fully completed";
    case "in_progress":
      return "Partly completed";
    case "not_started":
      return "Not started yet";
    default:
      return (status || "not_started").replace(/_/g, " ");
  }
}
