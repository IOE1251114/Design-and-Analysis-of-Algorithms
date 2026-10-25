/* Unit 5 — P, NP and NP-completeness: solving vs verifying (subset sum), growth of running times,
 * where well-known problems sit, and how hardness spreads along polynomial reductions. */

/* ---------- Subset sum: search all 2ⁿ subsets vs check one certificate ---------- */
export interface SFrame {
  mask: number;
  sum: number;
  checked: number;
  found: boolean;
  title: string;
  text: string;
}
export function subsetSumSearch(nums: number[], target: number) {
  const n = nums.length,
    frames: SFrame[] = [];
  let solution: number | null = null;
  for (let mask = 0; mask < 2 ** n; mask++) {
    let sum = 0;
    for (let i = 0; i < n; i++) if (mask & (1 << i)) sum += nums[i];
    const found = sum === target;
    const pick = nums.filter((_, i) => mask & (1 << i));
    frames.push({
      mask,
      sum,
      checked: mask + 1,
      found,
      title: `Subset ${mask + 1} of ${2 ** n}: {${pick.join(", ")}} → sum ${sum}`,
      text: found
        ? `Sum equals the target ${target}. The search can stop: this subset is a certificate.`
        : `${sum} ≠ ${target}. Try the next subset.`,
    });
    if (found) {
      solution = mask;
      break;
    }
  }
  if (solution === null)
    frames.push({
      mask: 2 ** n - 1,
      sum: -1,
      checked: 2 ** n,
      found: false,
      title: `All ${2 ** n} subsets fail`,
      text: `No subset adds up to ${target}, so the answer is NO. Proving a NO needs the whole search (or a cleverer argument).`,
    });
  return { frames, solution, checked: frames[frames.length - 1].checked };
}
export interface VFrame {
  i: number;
  running: number;
  title: string;
  text: string;
  done?: boolean;
  ok?: boolean;
}
export function verifySubset(nums: number[], target: number, chosen: number[]) {
  const frames: VFrame[] = [
    {
      i: -1,
      running: 0,
      title: "Verifier gets the instance and a certificate",
      text: `Certificate: the positions {${chosen.map((i) => i + 1).join(", ") || "∅"}}. Check each once, then compare with ${target}.`,
    },
  ];
  let s = 0;
  chosen.forEach((i, k) => {
    s += nums[i];
    frames.push({
      i,
      running: s,
      title: `Add ${nums[i]} → running sum ${s}`,
      text: `Step ${k + 1} of ${chosen.length}. One addition per chosen number.`,
    });
  });
  frames.push({
    i: -1,
    running: s,
    done: true,
    ok: s === target,
    title:
      s === target
        ? `Sum ${s} = ${target}: certificate accepted`
        : `Sum ${s} ≠ ${target}: certificate rejected`,
    text: `${chosen.length + 1} steps in total: O(n) time. That polynomial-time check is what puts SUBSET-SUM in NP.`,
  });
  return frames;
}

/* ---------- Growth: how big an input can each running time handle? ---------- */
export const growthFns: {
  id: string;
  label: string;
  f: (n: number) => number;
}[] = [
  { id: "n2", label: "n²", f: (n) => n * n },
  { id: "n3", label: "n³", f: (n) => n ** 3 },
  { id: "exp", label: "2ⁿ", f: (n) => 2 ** n },
  {
    id: "fact",
    label: "n!",
    f: (n) => {
      let r = 1;
      for (let i = 2; i <= n; i++) r *= i;
      return r;
    },
  },
];
/** Largest n whose step count fits in a budget (e.g. 10⁹ steps ≈ one second). */
export function largestN(f: (n: number) => number, budget: number) {
  let n = 1;
  while (f(n + 1) <= budget && n < 1e7) n++;
  return n;
}

/* ---------- Where problems sit ---------- */
export type PClass = "P" | "NP" | "NPC" | "NPH";
export interface ProblemInfo {
  id: string;
  name: string;
  cls: PClass;
  why: string;
}
export const problemCatalog: ProblemInfo[] = [
  {
    id: "sort",
    name: "Sorting",
    cls: "P",
    why: "Merge sort decides it in O(n log n).",
  },
  {
    id: "path",
    name: "Shortest path",
    cls: "P",
    why: "Dijkstra / Bellman–Ford run in polynomial time (decision version: is there a path of length ≤ k?).",
  },
  {
    id: "mst",
    name: "MST",
    cls: "P",
    why: "Kruskal and Prim run in O(E log V).",
  },
  {
    id: "2sat",
    name: "2-SAT",
    cls: "P",
    why: "With two literals per clause, strongly connected components solve it in linear time.",
  },
  {
    id: "euler",
    name: "Euler circuit",
    cls: "P",
    why: "Exists iff the graph is connected and every degree is even: an O(V + E) check.",
  },
  {
    id: "factor",
    name: "Factoring",
    cls: "NP",
    why: "In NP (a factor is a certificate) but not known to be NP-complete, and not known to be in P.",
  },
  {
    id: "gi",
    name: "Graph isomorphism",
    cls: "NP",
    why: "In NP; believed not NP-complete; no polynomial algorithm is known.",
  },
  {
    id: "sat",
    name: "SAT",
    cls: "NPC",
    why: "Cook–Levin theorem: the first problem proved NP-complete.",
  },
  {
    id: "3sat",
    name: "3-SAT",
    cls: "NPC",
    why: "SAT ≤p 3-SAT by splitting long clauses with new variables.",
  },
  {
    id: "clique",
    name: "Clique",
    cls: "NPC",
    why: "3-SAT ≤p CLIQUE (one vertex per literal, edges between compatible literals).",
  },
  {
    id: "vc",
    name: "Vertex cover",
    cls: "NPC",
    why: "CLIQUE ≤p VERTEX-COVER through the complement graph.",
  },
  {
    id: "ham",
    name: "Hamiltonian cycle",
    cls: "NPC",
    why: "VERTEX-COVER ≤p HAM-CYCLE (gadget construction).",
  },
  {
    id: "tspd",
    name: "TSP (decision)",
    cls: "NPC",
    why: "HAM-CYCLE ≤p TSP: “is there a tour of cost ≤ k?” is verified by adding up a tour.",
  },
  {
    id: "subset",
    name: "Subset sum",
    cls: "NPC",
    why: "3-SAT ≤p SUBSET-SUM with digit-encoded numbers.",
  },
  {
    id: "tspo",
    name: "TSP (optimisation)",
    cls: "NPH",
    why: "Finding the cheapest tour is at least as hard as the decision version, but it is not a yes/no problem, so it is not in NP.",
  },
  {
    id: "halt",
    name: "Halting problem",
    cls: "NPH",
    why: "Undecidable, yet every NP problem reduces to it: NP-hard but not in NP.",
  },
];

/* ---------- The reduction tree (CLRS Figure 34.13, plus subset sum) ---------- */
export interface RNodeInfo {
  id: string;
  name: string;
  x: number;
  y: number;
  how: string;
}
export const redNodes: RNodeInfo[] = [
  {
    id: "np",
    name: "Any NP problem",
    x: 330,
    y: 30,
    how: "Cook–Levin: a polynomial-time verifier can be written as a Boolean circuit/formula that is satisfiable exactly when a certificate exists.",
  },
  {
    id: "sat",
    name: "SAT",
    x: 330,
    y: 95,
    how: "SAT is in NP (check an assignment) and every NP problem reduces to it.",
  },
  {
    id: "3sat",
    name: "3-SAT",
    x: 330,
    y: 160,
    how: "Rewrite each clause so it has exactly three literals, adding fresh variables to split long clauses. Satisfiability is preserved.",
  },
  {
    id: "clique",
    name: "CLIQUE",
    x: 170,
    y: 225,
    how: "One vertex per literal occurrence; join literals from different clauses that are not x and ¬x. A k-clique (k = clauses) picks one true literal per clause.",
  },
  {
    id: "subset",
    name: "SUBSET-SUM",
    x: 500,
    y: 225,
    how: "Encode each literal and clause as a decimal number with one digit per variable and clause; the target forces one value per variable and every clause covered.",
  },
  {
    id: "vc",
    name: "VERTEX-COVER",
    x: 170,
    y: 290,
    how: "G has a clique of size k iff the complement graph has a vertex cover of size |V| − k.",
  },
  {
    id: "ham",
    name: "HAM-CYCLE",
    x: 170,
    y: 355,
    how: "Replace each edge by a 12-vertex gadget so a Hamiltonian cycle exists iff a vertex cover of size k exists.",
  },
  {
    id: "tsp",
    name: "TSP",
    x: 170,
    y: 420,
    how: "Complete graph with cost 0 on edges of G and 1 on non-edges: a tour of cost ≤ 0 exists iff G has a Hamiltonian cycle.",
  },
];
export const redEdges: [string, string][] = [
  ["np", "sat"],
  ["sat", "3sat"],
  ["3sat", "clique"],
  ["3sat", "subset"],
  ["clique", "vc"],
  ["vc", "ham"],
  ["ham", "tsp"],
];

/** Breadth-first spread along reduction arrows. 'down': NP-hardness flows from A to every B with A ≤p B.
 *  'up': a polynomial algorithm for B gives one for every A with A ≤p B. */
export function spread(start: string, dir: "down" | "up") {
  const order: string[][] = [[start]],
    seen = new Set([start]);
  for (;;) {
    const next: string[] = [];
    for (const a of order[order.length - 1])
      for (const [x, y] of redEdges) {
        const to = dir === "down" ? (x === a ? y : null) : y === a ? x : null;
        if (to && !seen.has(to)) {
          seen.add(to);
          next.push(to);
        }
      }
    if (!next.length) return order;
    order.push(next);
  }
}
