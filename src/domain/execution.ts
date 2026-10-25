/** Shared execution contracts used by every visualization module. */
export type OperationType =
  "read" | "write" | "compare" | "assign" | "branch" | "visit" | "complete";

export interface ExecutionStep {
  id: string;
  line: string;
  detail: string;
  cost: number;
  operation: OperationType;
  state?: Record<string, string | number | boolean | null>;
  conceptTags: string[];
}

export interface ExecutionTrace {
  algorithmId: string;
  inputSize: number;
  steps: ExecutionStep[];
  assumptions: string[];
  theoreticalComplexity: { best: string; average: string; worst: string };
}

export interface TraceSnapshot {
  stepIndex: number;
  cumulativeCost: number;
  current: ExecutionStep | null;
  finished: boolean;
}

export function snapshotAt(
  trace: ExecutionTrace,
  stepIndex: number,
): TraceSnapshot {
  const safeIndex = Math.max(-1, Math.min(stepIndex, trace.steps.length - 1));
  const visible = trace.steps.slice(0, safeIndex + 1);
  return {
    stepIndex: safeIndex,
    cumulativeCost: visible.reduce((total, step) => total + step.cost, 0),
    current: safeIndex >= 0 ? trace.steps[safeIndex] : null,
    finished: safeIndex === trace.steps.length - 1,
  };
}

export function validateTrace(trace: ExecutionTrace): string[] {
  const issues: string[] = [];
  if (!trace.algorithmId.trim())
    issues.push("Trace must have an algorithm identifier.");
  if (!Number.isInteger(trace.inputSize) || trace.inputSize < 0)
    issues.push("Input size must be a non-negative integer.");
  const ids = new Set<string>();
  trace.steps.forEach((step, index) => {
    if (ids.has(step.id)) issues.push(`Duplicate step id: ${step.id}`);
    ids.add(step.id);
    if (!Number.isFinite(step.cost) || step.cost < 0)
      issues.push(`Step ${index + 1} has an invalid cost.`);
    if (!step.detail.trim())
      issues.push(`Step ${index + 1} needs an explanation.`);
  });
  return issues;
}
