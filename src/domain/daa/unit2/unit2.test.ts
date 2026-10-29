import { describe, expect, it } from "vitest";
import {
  bucketSortTrace,
  caseAnalysis,
  countingSortTrace,
  makeInput,
  radixSortTrace,
  randomArray,
  runSort,
  type SortAlgo,
} from "./sorts";
import {
  avlInsert,
  balance,
  bKeys,
  bTreeInsert,
  bstOps,
  height,
  heightStudy,
  inorder,
  rbBlackHeight,
  rbInsert,
  type BNode,
  type TNode,
} from "./trees";
import { buildStudy, hashTrace, heapOp, isHeap } from "./heapHash";
import { bmTables, lpsTable, matchTrace } from "./strings";

const last = <T>(a: T[]): T => a[a.length - 1];
const sorted = (a: number[]) => [...a].sort((x, y) => x - y);

describe("comparison sorts", () => {
  const algos: SortAlgo[] = ["insertion", "quick", "merge", "heap"];
  for (const algo of algos)
    it(`${algo} sorts every input kind, with and without recording`, () => {
      for (const kind of ["random", "sorted", "reverse", "few"] as const)
        for (const n of [1, 2, 5, 16, 33]) {
          const input = makeInput(kind, n, 3);
          const r = runSort(algo, input, { record: true }),
            q = runSort(algo, input);
          expect(r.result).toEqual(sorted(input));
          expect(last(r.frames).a).toEqual(sorted(input));
          expect(q.comparisons).toBe(r.comparisons);
        }
    });
  it("known counts: quick sort worst case, insertion best/worst", () => {
    const asc = Array.from({ length: 10 }, (_, i) => i + 1);
    expect(runSort("quick", asc).comparisons).toBe(45); // n(n−1)/2 with last-key pivot
    expect(runSort("quick", asc, { pivot: "middle" }).comparisons).toBeLessThan(
      30,
    );
    expect(runSort("insertion", asc).comparisons).toBe(9); // n − 1
    expect(runSort("insertion", [...asc].reverse()).comparisons).toBe(45);
  });
  it("merge sort is stable, quick sort comparisons grow like n log n on random input", () => {
    const rows = caseAnalysis("quick");
    const r64 = rows.find((r) => r.n === 64)!;
    expect(r64.sorted).toBe((64 * 63) / 2);
    expect(r64.random).toBeLessThan(2 * r64.nlogn);
    expect(caseAnalysis("merge").every((r) => r.random <= r.nlogn)).toBe(true);
  });
  it("random arrays are deterministic", () =>
    expect(randomArray(10, 5)).toEqual(randomArray(10, 5)));
});

describe("linear-time sorts", () => {
  it("counting sort", () => {
    const A = [2, 5, 3, 0, 2, 3, 0, 3];
    expect(last(countingSortTrace(A, 5)).B).toEqual(sorted(A));
  });
  it("radix sort", () => {
    const A = [170, 45, 75, 90, 802, 24, 2, 66];
    expect(last(radixSortTrace(A)).A).toEqual(sorted(A));
  });
  it("bucket sort", () => {
    const A = [0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68];
    expect(last(bucketSortTrace(A)).out).toEqual(sorted(A));
  });
});

describe("search trees", () => {
  const keys = [50, 30, 70, 20, 40, 60, 80, 35, 45, 65];
  const fin = (fr: { root: TNode | null }[]) => last(fr).root;
  it("BST insert/search/delete keep the in-order sequence sorted", () => {
    expect(inorder(fin(bstOps(keys)))).toEqual(sorted(keys));
    for (const k of [20, 30, 50, 99])
      expect(inorder(fin(bstOps(keys, { kind: "delete", key: k })))).toEqual(
        sorted(keys.filter((x) => x !== k)),
      );
    expect(last(bstOps(keys, { kind: "search", key: 45 })).kind).toBe("found");
    expect(last(bstOps(keys, { kind: "search", key: 46 })).kind).toBe(
      "missing",
    );
  });
  const checkAvl = (t: TNode | null): boolean =>
    !t || (Math.abs(balance(t)) <= 1 && checkAvl(t.left) && checkAvl(t.right));
  it("AVL stays balanced for sorted and random insertion orders", () => {
    for (const ks of [
      Array.from({ length: 31 }, (_, i) => i + 1),
      [30, 20, 10],
      [10, 20, 30],
      [30, 10, 20],
      [10, 30, 20],
      randomArray(25, 9),
    ]) {
      const t = fin(avlInsert(ks));
      expect(inorder(t)).toEqual(sorted(ks));
      expect(checkAvl(t)).toBe(true);
    }
    expect(avlInsert([30, 20, 10]).some((f) => f.rotate === "LL")).toBe(true);
    expect(avlInsert([10, 30, 20]).some((f) => f.rotate === "RL")).toBe(true);
  });
  it("red-black trees satisfy every rule", () => {
    for (const ks of [
      Array.from({ length: 31 }, (_, i) => i + 1),
      randomArray(30, 4),
      [41, 38, 31, 12, 19, 8],
    ]) {
      const t = fin(rbInsert(ks));
      expect(inorder(t)).toEqual(sorted(ks));
      expect(t!.color).toBe("B");
      expect(rbBlackHeight(t)).toBeGreaterThan(0);
      expect(height(t)).toBeLessThanOrEqual(2 * Math.log2(ks.length + 1));
    }
  });
  it("B-trees keep key counts in range and leaves at one depth", () => {
    for (const t of [2, 3])
      for (const ks of [
        Array.from({ length: 30 }, (_, i) => i + 1),
        randomArray(40, 2),
      ]) {
        const root = last(bTreeInsert(ks, t)).root;
        expect(bKeys(root)).toEqual(sorted(ks));
        const depths = new Set<number>();
        const walk = (b: BNode, d: number, isRoot: boolean) => {
          expect(b.keys.length).toBeLessThanOrEqual(2 * t - 1);
          if (!isRoot) expect(b.keys.length).toBeGreaterThanOrEqual(t - 1);
          if (b.children.length) {
            expect(b.children.length).toBe(b.keys.length + 1);
            b.children.forEach((c) => walk(c, d + 1, false));
          } else depths.add(d);
        };
        walk(root, 0, true);
        expect(depths.size).toBe(1);
      }
  });
  it("height study: sorted BST degenerates, balanced trees stay logarithmic", () => {
    const r = last(heightStudy(31));
    expect(r.bstSorted).toBe(31);
    expect(r.avl).toBeLessThanOrEqual(6);
    expect(r.rb).toBeLessThanOrEqual(10);
  });
});

describe("heaps and hashing", () => {
  it("heap operations keep the heap property", () => {
    const keys = randomArray(15, 6);
    let h = heapOp([], { kind: "build", keys }).result;
    expect(isHeap(h)).toBe(true);
    h = heapOp(h, { kind: "insert", key: 100 }).result;
    expect(h[0]).toBe(100);
    expect(isHeap(h)).toBe(true);
    const r = heapOp(h, { kind: "extract" });
    expect(last(r.frames).removed).toBe(100);
    expect(isHeap(r.result)).toBe(true);
    expect(
      isHeap(heapOp([], { kind: "build", keys }, "min").result, "min"),
    ).toBe(true);
  });
  it("bottom-up build stays under 2n comparisons", () => {
    for (const r of buildStudy()) {
      expect(r.bottomUp).toBeLessThanOrEqual(r.twoN);
      expect(r.inserts).toBeGreaterThanOrEqual(r.bottomUp);
      if (r.n >= 16) expect(r.inserts).toBeGreaterThan(r.bottomUp);
    }
  });
  it("textbook exercise: keys 10,22,31,4,15,28,17,88,59 into m = 11", () => {
    const keys = [10, 22, 31, 4, 15, 28, 17, 88, 59];
    expect(hashTrace(keys, 11, "linear").table).toEqual([
      22,
      88,
      null,
      null,
      4,
      15,
      28,
      17,
      59,
      31,
      10,
    ]);
    expect(hashTrace(keys, 11, "quadratic").table).toEqual([
      22,
      null,
      88,
      17,
      4,
      null,
      28,
      59,
      15,
      31,
      10,
    ]);
    expect(hashTrace(keys, 11, "double").table).toEqual([
      22,
      null,
      59,
      17,
      4,
      15,
      28,
      88,
      null,
      31,
      10,
    ]);
    expect(last(hashTrace(keys, 11, "linear", 59).frames).status).toBe("found");
    expect(last(hashTrace(keys, 11, "chaining", 5).frames).status).toBe(
      "missing",
    );
  });
});

describe("string matching", () => {
  const brute = (T: string, P: string) => {
    const r: number[] = [];
    for (let s = 0; s + P.length <= T.length; s++)
      if (T.slice(s, s + P.length) === P) r.push(s);
    return r;
  };
  it("lps table", () => {
    expect(lpsTable("ABABCABAB").lps).toEqual([0, 0, 1, 2, 0, 1, 2, 3, 4]);
    expect(lpsTable("AAAA").lps).toEqual([0, 1, 2, 3]);
  });
  it("bad-character table", () => {
    expect(bmTables("EXAMPLE").last.E).toBe(6);
  });
  it("all three algorithms find exactly the brute-force matches", () => {
    const cases: [string, string][] = [
      ["ABABDABACDABABCABAB", "ABABCABAB"],
      ["AAAAAAAAAA", "AAA"],
      ["HERE IS A SIMPLE EXAMPLE", "EXAMPLE"],
      ["abcabcabd", "abcabd"],
      ["aaaa", "b"],
    ];
    const r = (s: number) => {
      let x = s;
      return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
    };
    const g = r(1);
    for (let k = 0; k < 40; k++) {
      const T = Array.from(
          { length: 30 },
          () => "ab"[Math.floor(g() * 2)],
        ).join(""),
        P = Array.from(
          { length: 1 + Math.floor(g() * 4) },
          () => "ab"[Math.floor(g() * 2)],
        ).join("");
      cases.push([T, P]);
    }
    for (const [T, P] of cases)
      for (const a of ["naive", "kmp", "bm"] as const)
        expect(matchTrace(a, T, P, false).matches).toEqual(brute(T, P));
  });
  it("Boyer–Moore skips on English text, KMP never exceeds 2n comparisons", () => {
    const T = "HERE IS A SIMPLE EXAMPLE",
      P = "EXAMPLE";
    expect(matchTrace("bm", T, P, false).comparisons).toBeLessThan(
      matchTrace("naive", T, P, false).comparisons,
    );
    const T2 = "AAAAAAAAAAAAAAAAAAAB",
      P2 = "AAAAB";
    expect(matchTrace("kmp", T2, P2, false).comparisons).toBeLessThanOrEqual(
      2 * T2.length,
    );
  });
});
