/* Unit 2 — comparison sorts (quick, merge, heap, insertion) and linear-time sorts (counting, radix, bucket).
 * Each algorithm runs once and optionally records a frame per step, so the animation and the operation
 * counts used in the charts come from the same code. Everything is deterministic (seeded inputs). */

export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** n distinct values from 1..99 in a seeded random order. */
export function randomArray(n: number, seed = 7): number[] {
  const r = rng(seed),
    pool = Array.from({ length: 99 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}
export type InputKind = "random" | "sorted" | "reverse" | "few";
export function makeInput(kind: InputKind, n: number, seed = 7): number[] {
  const base = randomArray(n, seed);
  if (kind === "sorted") return [...base].sort((a, b) => a - b);
  if (kind === "reverse") return [...base].sort((a, b) => b - a);
  if (kind === "few") {
    const r = rng(seed + 1);
    return Array.from({ length: n }, () => [20, 50, 80][Math.floor(r() * 3)]);
  }
  return base;
}

/* ---------- Comparison sorts ---------- */
export type SortAlgo = "insertion" | "quick" | "merge" | "heap";
export type PivotRule = "last" | "middle";
export interface SortFrame {
  a: number[];
  compare?: [number, number];
  swap?: [number, number];
  pivot?: number;
  /** Quick sort partition state: a[lo..i] ≤ pivot, a[i+1..j−1] > pivot. */
  part?: { lo: number; i: number; j: number; hi: number };
  range?: [number, number];
  /** Merge buffer and the slice of a[] it covers. */
  buffer?: (number | null)[];
  bufferAt?: number;
  heapSize?: number;
  done: number[];
  depth?: number;
  title: string;
  text: string;
  comparisons: number;
  moves: number;
}
export function runSort(
  algo: SortAlgo,
  input: number[],
  opts: { pivot?: PivotRule; record?: boolean } = {},
) {
  const a = [...input],
    n = a.length,
    frames: SortFrame[] = [],
    done = new Set<number>();
  let comparisons = 0,
    moves = 0;
  const rec = opts.record ?? false;
  const push = (f: Omit<SortFrame, "a" | "done" | "comparisons" | "moves">) => {
    if (rec)
      frames.push({ ...f, a: [...a], done: [...done], comparisons, moves });
  };
  const swap = (i: number, j: number) => {
    if (i !== j) {
      [a[i], a[j]] = [a[j], a[i]];
      moves += 3;
    }
  };
  push({
    title: "Input",
    text: `n = ${n} keys. Watch the comparisons and data moves add up.`,
  });

  if (algo === "insertion") {
    done.add(0);
    for (let i = 1; i < n; i++) {
      const key = a[i];
      let j = i - 1;
      push({
        range: [0, i],
        title: `Insert a[${i}] = ${key}`,
        text: `a[0…${i - 1}] is sorted. Shift larger keys right to make room for ${key}.`,
      });
      while (j >= 0) {
        comparisons++;
        if (a[j] > key) {
          push({
            compare: [j, j + 1],
            title: `${a[j]} > ${key}`,
            text: `Shift ${a[j]} one place right.`,
          });
          a[j + 1] = a[j];
          moves++;
          j--;
        } else {
          push({
            compare: [j, j + 1],
            title: `${a[j]} ≤ ${key}`,
            text: `Stop: ${key} belongs right after ${a[j]}.`,
          });
          break;
        }
      }
      a[j + 1] = key;
      moves++;
      done.add(i);
      push({
        range: [0, i],
        title: `Placed ${key}`,
        text: `a[0…${i}] is now sorted.`,
      });
    }
  }

  if (algo === "quick") {
    const quick = (lo: number, hi: number, depth: number) => {
      if (lo > hi) return;
      if (lo === hi) {
        done.add(lo);
        push({
          range: [lo, hi],
          depth,
          title: `Base case a[${lo}]`,
          text: "One element is already in its final place.",
        });
        return;
      }
      if (opts.pivot === "middle") {
        const mid = (lo + hi) >> 1;
        swap(mid, hi);
        push({
          range: [lo, hi],
          pivot: hi,
          depth,
          title: "Choose the middle key as pivot",
          text: `Move a[${mid}] to the end, then partition as usual.`,
        });
      }
      const pivot = a[hi];
      let i = lo - 1;
      push({
        range: [lo, hi],
        pivot: hi,
        part: { lo, i, j: lo, hi },
        depth,
        title: `Partition a[${lo}…${hi}] around ${pivot}`,
        text: `Pivot ${pivot}. Keys ≤ ${pivot} will collect on the left.`,
      });
      for (let j = lo; j < hi; j++) {
        comparisons++;
        if (a[j] <= pivot) {
          i++;
          swap(i, j);
          push({
            range: [lo, hi],
            pivot: hi,
            part: { lo, i, j: j + 1, hi },
            compare: [j, hi],
            swap: i !== j ? [i, j] : undefined,
            depth,
            title: `${a[i]} ≤ ${pivot}`,
            text:
              i !== j
                ? `Grow the ≤ region and swap ${a[i]} into it.`
                : `${a[i]} is already at the edge of the ≤ region.`,
          });
        } else
          push({
            range: [lo, hi],
            pivot: hi,
            part: { lo, i, j: j + 1, hi },
            compare: [j, hi],
            depth,
            title: `${a[j]} > ${pivot}`,
            text: `Leave ${a[j]} in the > region.`,
          });
      }
      swap(i + 1, hi);
      done.add(i + 1);
      push({
        range: [lo, hi],
        pivot: i + 1,
        swap: [i + 1, hi],
        depth,
        title: `Pivot ${pivot} placed at index ${i + 1}`,
        text: `Left part has ${i + 1 - lo} keys, right part has ${hi - i - 1}. ${i + 1 - lo === 0 || hi - i - 1 === 0 ? "A completely one-sided split: this is what makes the worst case Θ(n²)." : "Recurse on both sides."}`,
      });
      quick(lo, i, depth + 1);
      quick(i + 2, hi, depth + 1);
    };
    quick(0, n - 1, 0);
  }

  if (algo === "merge") {
    const merge = (lo: number, hi: number, depth: number) => {
      if (hi - lo <= 1) return;
      const mid = (lo + hi) >> 1;
      merge(lo, mid, depth + 1);
      merge(mid, hi, depth + 1);
      const buf: (number | null)[] = Array(hi - lo).fill(null);
      let i = lo,
        j = mid,
        k = 0;
      push({
        range: [lo, hi - 1],
        buffer: [...buf],
        bufferAt: lo,
        depth,
        title: `Merge a[${lo}…${mid - 1}] and a[${mid}…${hi - 1}]`,
        text: "Both halves are sorted. Repeatedly copy the smaller front key into the buffer.",
      });
      while (i < mid && j < hi) {
        comparisons++;
        const takeLeft = a[i] <= a[j],
          ci = i,
          cj = j;
        buf[k++] = takeLeft ? a[i++] : a[j++];
        moves++;
        push({
          range: [lo, hi - 1],
          compare: [ci, cj],
          buffer: [...buf],
          bufferAt: lo,
          depth,
          title: `${a[ci]} vs ${a[cj]}`,
          text: `Take ${takeLeft ? a[ci] : a[cj]} (${takeLeft ? "left" : "right"}). Ties take the left key, which keeps merge sort stable.`,
        });
      }
      while (i < mid) {
        buf[k++] = a[i++];
        moves++;
      }
      while (j < hi) {
        buf[k++] = a[j++];
        moves++;
      }
      for (let t = 0; t < buf.length; t++) {
        a[lo + t] = buf[t]!;
        moves++;
      }
      if (lo === 0 && hi === n) for (let t = 0; t < n; t++) done.add(t);
      push({
        range: [lo, hi - 1],
        buffer: [...buf],
        bufferAt: lo,
        depth,
        title: `Copied back a[${lo}…${hi - 1}]`,
        text: "This range is sorted. The O(n) buffer is why merge sort is not in place.",
      });
    };
    merge(0, n, 0);
  }

  if (algo === "heap") {
    let size = n;
    const sift = (i: number, phase: string) => {
      for (;;) {
        const l = 2 * i + 1,
          r = l + 1;
        if (l >= size) return;
        let big = l;
        if (r < size) {
          comparisons++;
          if (a[r] > a[l]) big = r;
        }
        comparisons++;
        if (a[big] > a[i]) {
          const x = a[i],
            y = a[big];
          swap(i, big);
          push({
            heapSize: size,
            compare: [i, big],
            swap: [i, big],
            title: `${phase}: sift ${x} down`,
            text: `Child ${y} is larger than ${x}, so they swap.`,
          });
          i = big;
        } else {
          push({
            heapSize: size,
            compare: [i, big],
            title: `${phase}: ${a[i]} stays`,
            text: `${a[i]} ≥ its larger child ${a[big]}; the heap property holds here.`,
          });
          return;
        }
      }
    };
    push({
      heapSize: size,
      title: "Build a max-heap",
      text: `Heapify every internal node from index ${(n >> 1) - 1} down to 0 (bottom-up). This costs O(n) in total.`,
    });
    for (let i = (n >> 1) - 1; i >= 0; i--) sift(i, "Build heap");
    push({
      heapSize: size,
      title: "Max-heap built",
      text: `The largest key, ${a[0]}, is at the root a[0].`,
    });
    for (let end = n - 1; end > 0; end--) {
      swap(0, end);
      size = end;
      done.add(end);
      push({
        heapSize: size,
        swap: [0, end],
        title: `Extract max ${a[end]}`,
        text: `Swap the root with a[${end}], shrink the heap to ${size}, then restore the heap.`,
      });
      sift(0, "Extract");
    }
    done.add(0);
  }
  for (let t = 0; t < n; t++) done.add(t);
  push({
    title: "Sorted",
    text: `${comparisons} comparisons and ${moves} data moves.`,
  });
  return { frames, comparisons, moves, result: a };
}

export const sortInfo: Record<
  SortAlgo,
  {
    name: string;
    best: string;
    avg: string;
    worst: string;
    space: string;
    stable: boolean;
    inPlace: boolean;
  }
> = {
  insertion: {
    name: "Insertion sort",
    best: "Θ(n)",
    avg: "Θ(n²)",
    worst: "Θ(n²)",
    space: "Θ(1)",
    stable: true,
    inPlace: true,
  },
  quick: {
    name: "Quick sort",
    best: "Θ(n log n)",
    avg: "Θ(n log n)",
    worst: "Θ(n²)",
    space: "Θ(log n) avg stack",
    stable: false,
    inPlace: true,
  },
  merge: {
    name: "Merge sort",
    best: "Θ(n log n)",
    avg: "Θ(n log n)",
    worst: "Θ(n log n)",
    space: "Θ(n)",
    stable: true,
    inPlace: false,
  },
  heap: {
    name: "Heap sort",
    best: "Θ(n log n)",
    avg: "Θ(n log n)",
    worst: "Θ(n log n)",
    space: "Θ(1)",
    stable: false,
    inPlace: true,
  },
};

/** Comparisons for n = 4, 8, …, 64 on each input kind; "random" is the mean of 25 seeded permutations. */
export function caseAnalysis(algo: SortAlgo, pivot: PivotRule = "last") {
  return Array.from({ length: 16 }, (_, k) => {
    const n = (k + 1) * 4;
    const run = (kind: InputKind, seed = 7) =>
      runSort(algo, makeInput(kind, n, seed), { pivot }).comparisons;
    let sum = 0;
    for (let s = 0; s < 25; s++) sum += run("random", 100 + s);
    return {
      n,
      random: Math.round(sum / 25),
      sorted: run("sorted"),
      reverse: run("reverse"),
      nlogn: Math.round(n * Math.log2(n)),
      half_n2: (n * (n - 1)) / 2,
    };
  });
}

/* ---------- Linear-time sorts ---------- */
export interface CountFrame {
  phase: "count" | "prefix" | "place" | "done";
  A: number[];
  C: number[];
  B: (number | null)[];
  i?: number;
  ci?: number;
  bi?: number;
  text: string;
}
/** Counting sort for keys 0..k. Placement walks A from right to left, which is what makes it stable. */
export function countingSortTrace(A: number[], k: number) {
  const C = Array(k + 1).fill(0),
    B: (number | null)[] = Array(A.length).fill(null),
    frames: CountFrame[] = [];
  const snap = (f: Omit<CountFrame, "A" | "C" | "B">) =>
    frames.push({ ...f, A: [...A], C: [...C], B: [...B] });
  snap({
    phase: "count",
    text: `Keys lie in 0…${k}, so the count array C has k + 1 = ${k + 1} slots.`,
  });
  A.forEach((x, i) => {
    C[x]++;
    snap({
      phase: "count",
      i,
      ci: x,
      text: `A[${i}] = ${x}: increment C[${x}] to ${C[x]}.`,
    });
  });
  for (let v = 1; v <= k; v++) {
    C[v] += C[v - 1];
    snap({
      phase: "prefix",
      ci: v,
      text: `C[${v}] += C[${v - 1}] → ${C[v]}: ${C[v]} keys are ≤ ${v}.`,
    });
  }
  for (let i = A.length - 1; i >= 0; i--) {
    const x = A[i],
      pos = C[x] - 1;
    B[pos] = x;
    C[x]--;
    snap({
      phase: "place",
      i,
      ci: x,
      bi: pos,
      text: `A[${i}] = ${x} goes to B[${pos}] (C[${x}] − 1), then C[${x}] becomes ${C[x]}.`,
    });
  }
  snap({
    phase: "done",
    text: `Sorted in Θ(n + k) = Θ(${A.length} + ${k}) time without a single comparison between keys.`,
  });
  return frames;
}
export interface RadixFrame {
  pass: number;
  digitPlace: number;
  A: number[];
  buckets: number[][];
  i?: number;
  phase: "distribute" | "collect" | "done";
  text: string;
}
export function radixSortTrace(input: number[]) {
  const frames: RadixFrame[] = [],
    digits = Math.max(...input.map((x) => String(x).length));
  let A = [...input];
  for (let p = 0; p < digits; p++) {
    const place = 10 ** p,
      buckets: number[][] = Array.from({ length: 10 }, () => []);
    frames.push({
      pass: p + 1,
      digitPlace: place,
      A: [...A],
      buckets: buckets.map((b) => [...b]),
      phase: "distribute",
      text: `Pass ${p + 1}: sort by the ${["ones", "tens", "hundreds", "thousands"][p] ?? `10^${p}`} digit with a stable bucket pass.`,
    });
    A.forEach((x, i) => {
      const d = Math.floor(x / place) % 10;
      buckets[d].push(x);
      frames.push({
        pass: p + 1,
        digitPlace: place,
        A: [...A],
        buckets: buckets.map((b) => [...b]),
        i,
        phase: "distribute",
        text: `${x} has digit ${d} → bucket ${d}.`,
      });
    });
    A = buckets.flat();
    frames.push({
      pass: p + 1,
      digitPlace: place,
      A: [...A],
      buckets: buckets.map((b) => [...b]),
      phase: "collect",
      text: `Collect buckets 0→9 in order. Keys with equal digits keep their previous order (stability).`,
    });
  }
  frames.push({
    pass: digits,
    digitPlace: 10 ** (digits - 1),
    A: [...A],
    buckets: Array.from({ length: 10 }, () => []),
    phase: "done",
    text: `${digits} passes × Θ(n + 10) each = Θ(d(n + k)).`,
  });
  return frames;
}
export interface BucketFrame {
  A: number[];
  buckets: number[][];
  i?: number;
  b?: number;
  phase: "distribute" | "sort" | "concat" | "done";
  out: number[];
  text: string;
}
export function bucketSortTrace(A: number[]) {
  const n = A.length,
    buckets: number[][] = Array.from({ length: n }, () => []),
    frames: BucketFrame[] = [];
  const snap = (f: Omit<BucketFrame, "A" | "buckets">) =>
    frames.push({ ...f, A: [...A], buckets: buckets.map((b) => [...b]) });
  snap({
    phase: "distribute",
    out: [],
    text: `${n} keys in [0, 1): make ${n} buckets, bucket i covers [i/${n}, (i+1)/${n}).`,
  });
  A.forEach((x, i) => {
    const b = Math.floor(n * x);
    buckets[b].push(x);
    snap({
      phase: "distribute",
      i,
      b,
      out: [],
      text: `⌊${n} × ${x.toFixed(2)}⌋ = ${b}: put ${x.toFixed(2)} in bucket ${b}.`,
    });
  });
  buckets.forEach((bk, b) => {
    if (bk.length > 1) {
      bk.sort((x, y) => x - y);
      snap({
        phase: "sort",
        b,
        out: [],
        text: `Insertion-sort bucket ${b}: ${bk.map((v) => v.toFixed(2)).join(", ")}.`,
      });
    }
  });
  const out: number[] = [];
  buckets.forEach((bk, b) => {
    if (bk.length) {
      out.push(...bk);
      snap({ phase: "concat", b, out: [...out], text: `Append bucket ${b}.` });
    }
  });
  snap({
    phase: "done",
    out,
    text: "With uniformly spread keys each bucket holds O(1) keys on average, so the expected time is Θ(n).",
  });
  return frames;
}
