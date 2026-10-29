/** Shapes shared by every subject's course data (DAA, Data Structures, …). */
export type Mode = "explore" | "student" | "teacher";

export type Topic = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  complexity: string;
  tags: string[];
};

export type Unit = {
  id: string;
  number: string;
  title: string;
  short: string;
  description: string;
  topics: Topic[];
};

const fallbackIdea =
  "Inspect the structure's state, identify the invariant it keeps, and connect each operation to its cost.";

/** The one-paragraph "the idea" summary for a topic. */
export const ideaFor = (ideas: Record<string, string>, id: string) =>
  ideas[id] ?? fallbackIdea;

export const topicsOf = (units: Unit[]) => units.flatMap((u) => u.topics);
