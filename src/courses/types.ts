import type { ReactNode } from "react";
import type { Unit } from "../domain/course";

export type StepHandler = (k: number) => void;

/** Everything the shared lab page needs to run one subject. */
export type Course = {
  /** Matches an id in domain/subjects.ts. */
  subjectId: string;
  units: Unit[];
  /** One-paragraph "the idea" summary per topic id. */
  ideas: Record<string, string>;
  /** The interactive visualizer for each topic id. */
  explorers: Record<string, (onSteps: StepHandler) => ReactNode>;
  /** Syllabus theory notes for a topic, or null when it has none. */
  notes: (topic: string) => ReactNode;
  footer: string;
};
