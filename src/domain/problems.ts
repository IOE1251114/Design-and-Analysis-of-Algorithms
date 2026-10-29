import { daaProblems } from "./daa/problems";
import { dsProblems } from "./ds/problems";
import { laProblems } from "./la/problems";
import type { Problem } from "./problemKit";

export type { Problem } from "./problemKit";

/** Every subject's practice problems. Topic ids are unique across subjects. */
export const problems: Problem[] = [
  ...daaProblems,
  ...dsProblems,
  ...laProblems,
];

export const problemsFor = (topic: string) =>
  problems.filter((p) => p.topic === topic);

export function grade(
  p: Problem,
  given: string,
): { correct: boolean; misconception?: string } {
  const value = Number(given);
  if (value === p.answer) return { correct: true };
  return { correct: false, misconception: p.tags?.[String(value)] ?? p.tag };
}
