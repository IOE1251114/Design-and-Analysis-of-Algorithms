/**
 * Subjects shown on the landing page. To add a subject, add an entry here;
 * set `path` once its lab exists, and leave it undefined to show "Coming soon".
 */
export type Subject = {
  id: string;
  title: string;
  short: string;
  description: string;
  glyph: string;
  path?: string;
};

export const subjects: Subject[] = [
  {
    id: "daa",
    title: "Design & Analysis of Algorithms",
    short: "Algorithms",
    description:
      "Asymptotic analysis, sorting, graphs, greedy and dynamic programming, and NP-completeness — five units, fully visual.",
    glyph: "O(n)",
    path: "/lab",
  },
  {
    id: "ds",
    title: "Data Structures",
    short: "Data Structures",
    description:
      "Arrays, linked lists, stacks, queues, trees and graphs, built and modified one operation at a time.",
    glyph: "[ ]",
  },
  {
    id: "la",
    title: "Linear Algebra",
    short: "Linear Algebra",
    description:
      "Vectors, matrices, transformations, eigenvalues and decompositions you can drag and see.",
    glyph: "Ax=b",
  },
];
