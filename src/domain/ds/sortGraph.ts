/* Unit V — elementary sorts, sorting on several keys, external merge sort, and multigraphs. */

export type SortFrame = {
  a: number[];
  compare?: [number, number];
  swap?: [number, number];
  /** Indices already in their final place. */
  done: number[];
  /** Selection sort: index of the current minimum. */
  min?: number;
  comparisons: number;
  swaps: number;
  title: string;
  text: string;
};

export type Elementary = "bubble" | "selection" | "insertion";

export function elementarySort(input: number[], kind: Elementary): SortFrame[] {
  const a = [...input];
  const n = a.length;
  const frames: SortFrame[] = [];
  let comparisons = 0,
    swaps = 0;
  const done = new Set<number>();
  const push = (f: Omit<SortFrame, "a" | "done" | "comparisons" | "swaps">) =>
    frames.push({ ...f, a: [...a], done: [...done], comparisons, swaps });
  const swap = (i: number, j: number) => {
    [a[i], a[j]] = [a[j], a[i]];
    swaps++;
  };

  if (kind === "bubble") {
    for (let pass = 0; pass < n - 1; pass++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - pass; j++) {
        comparisons++;
        if (a[j] > a[j + 1]) {
          swap(j, j + 1);
          swapped = true;
          push({
            swap: [j, j + 1],
            title: `Swap ${a[j + 1]} and ${a[j]}`,
            text: `Pass ${pass + 1}: the larger value bubbles one place right.`,
          });
        } else
          push({
            compare: [j, j + 1],
            title: `${a[j]} ≤ ${a[j + 1]}: keep`,
            text: `Pass ${pass + 1}: adjacent pair already in order.`,
          });
      }
      done.add(n - 1 - pass);
      push({
        title: `Pass ${pass + 1} done`,
        text: `The largest remaining value, ${a[n - 1 - pass]}, has reached position ${n - 1 - pass}.`,
      });
      if (!swapped) {
        for (let k = 0; k < n; k++) done.add(k);
        push({
          title: "No swaps in this pass: sorted",
          text: "With the early-exit flag, an already-sorted array costs only n − 1 comparisons.",
        });
        return frames;
      }
    }
    done.add(0);
  } else if (kind === "selection") {
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      for (let j = i + 1; j < n; j++) {
        comparisons++;
        if (a[j] < a[m]) m = j;
        push({
          compare: [j, m],
          min: m,
          title: `Compare ${a[j]} with current minimum ${a[m]}`,
          text: `Find the smallest value in positions ${i}…${n - 1}.`,
        });
      }
      if (m !== i) swap(i, m);
      done.add(i);
      push({
        swap: m !== i ? [i, m] : undefined,
        title:
          m !== i
            ? `Swap the minimum into position ${i}`
            : `${a[i]} is already the minimum`,
        text: "Selection sort makes at most one swap per pass: n − 1 swaps in total.",
      });
    }
    done.add(n - 1);
  } else {
    done.add(0);
    for (let i = 1; i < n; i++) {
      let j = i;
      push({
        compare: [i - 1, i],
        title: `Insert ${a[i]} into the sorted prefix`,
        text: `Positions 0…${i - 1} are sorted among themselves.`,
      });
      while (j > 0) {
        comparisons++;
        if (a[j - 1] <= a[j]) break;
        swap(j - 1, j);
        push({
          swap: [j - 1, j],
          title: `${a[j]} > ${a[j - 1]}: shift right`,
          text: "Move the larger value right until the new key finds its place.",
        });
        j--;
      }
      done.add(i);
    }
  }
  for (let k = 0; k < n; k++) done.add(k);
  push({
    title: "Sorted",
    text: `${comparisons} comparisons and ${swaps} swaps for n = ${n}.`,
  });
  return frames;
}

/* ---------- Sorting on different keys ---------- */

export type Rec = { name: string; dept: string; marks: number };
export type KeyName = keyof Rec;

const cmp = (k: KeyName) => (x: Rec, y: Rec) =>
  k === "marks" ? y.marks - x.marks : String(x[k]).localeCompare(String(y[k]));

/**
 * Sort by several keys with a stable sort applied from the least significant key to the most
 * significant one (the same idea as LSD radix sort).
 */
export function multiKeySort(records: Rec[], keys: KeyName[]) {
  const passes: { key: KeyName; result: Rec[] }[] = [];
  let cur = [...records];
  for (const k of [...keys].reverse()) {
    cur = [...cur].sort(cmp(k)); // Array.prototype.sort is stable.
    passes.push({ key: k, result: cur });
  }
  return passes;
}

/* ---------- External (two-way merge) sorting ---------- */

export type ExtFrame = {
  runs: number[][];
  phase: "runs" | "merge" | "done";
  pass: number;
  /** Indices of the two runs being merged in this frame. */
  merging?: [number, number];
  reads: number;
  title: string;
  text: string;
};

/**
 * Phase 1 reads `memory` records at a time, sorts them in memory and writes a run.
 * Phase 2 merges runs two at a time until one run remains; each pass reads every record once.
 */
export function externalSort(data: number[], memory: number): ExtFrame[] {
  const frames: ExtFrame[] = [];
  let runs: number[][] = [];
  let reads = 0;
  for (let i = 0; i < data.length; i += memory) {
    runs.push(data.slice(i, i + memory).sort((a, b) => a - b));
    reads += Math.min(memory, data.length - i);
    frames.push({
      runs: runs.map((r) => [...r]),
      phase: "runs",
      pass: 0,
      reads,
      title: `Create run ${runs.length}`,
      text: `Load ${Math.min(memory, data.length - i)} records (memory holds ${memory}), sort them internally and write them out as a sorted run.`,
    });
  }
  let pass = 0;
  while (runs.length > 1) {
    pass++;
    const next: number[][] = [];
    for (let i = 0; i < runs.length; i += 2) {
      if (i + 1 < runs.length) {
        const merged = merge(runs[i], runs[i + 1]);
        reads += merged.length;
        frames.push({
          runs: [...next, merged, ...runs.slice(i + 2)].map((r) => [...r]),
          phase: "merge",
          pass,
          merging: [next.length, next.length],
          reads,
          title: `Pass ${pass}: merge two runs`,
          text: "Only the front record of each run needs to be in memory to merge them.",
        });
        next.push(merged);
      } else next.push(runs[i]);
    }
    runs = next;
  }
  frames.push({
    runs: runs.map((r) => [...r]),
    phase: "done",
    pass,
    reads,
    title: `Sorted in ${pass} merge pass${pass === 1 ? "" : "es"}`,
    text: `⌈log₂(initial runs)⌉ = ${pass}. Every pass reads the whole file once, so fewer, longer runs mean fewer passes.`,
  });
  return frames;
}

function merge(a: number[], b: number[]) {
  const out: number[] = [];
  let i = 0,
    j = 0;
  while (i < a.length || j < b.length)
    out.push(j >= b.length || (i < a.length && a[i] <= b[j]) ? a[i++] : b[j++]);
  return out;
}

/* ---------- Digraphs and multigraphs ---------- */

export type Edge = { u: number; v: number };

/** Adjacency matrix where an entry counts parallel edges (a loop counts once on the diagonal). */
export function countMatrix(n: number, edges: Edge[], directed: boolean) {
  const m = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const { u, v } of edges) {
    m[u][v]++;
    if (!directed && u !== v) m[v][u]++;
  }
  return m;
}

export function degrees(n: number, edges: Edge[]) {
  const inD = new Array(n).fill(0),
    outD = new Array(n).fill(0),
    deg = new Array(n).fill(0);
  for (const { u, v } of edges) {
    outD[u]++;
    inD[v]++;
    deg[u]++;
    deg[v]++; // a loop adds 2 to its vertex's degree
  }
  return { inD, outD, deg };
}

export function classifyGraph(edges: Edge[], directed: boolean) {
  const seen = new Set<string>();
  let parallel = 0,
    loops = 0;
  for (const { u, v } of edges) {
    if (u === v) loops++;
    const k = directed || u <= v ? `${u}-${v}` : `${v}-${u}`;
    if (seen.has(k)) parallel++;
    seen.add(k);
  }
  const kind = loops ? "pseudograph" : parallel ? "multigraph" : "simple graph";
  return { parallel, loops, kind: directed ? `directed ${kind}` : kind };
}
