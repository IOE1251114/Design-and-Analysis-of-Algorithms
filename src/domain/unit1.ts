/* Unit 1 — algorithm analysis.
 * Every visual in Unit 1 is drawn from these pure, deterministic functions (no randomness),
 * so the same input always produces the same trace, chart and count.
 * unit1.test.ts checks each trace against its closed-form formula. */

/* ---------- Growth classes (shared by every chart; colour follows the class) ---------- */
export type GrowthId = 'one' | 'log' | 'n' | 'nlogn' | 'n2' | 'exp'
export const growthOrder: GrowthId[] = ['one', 'log', 'n', 'nlogn', 'n2', 'exp']
export const growth: Record<GrowthId, { label: string; theta: string; f: (n: number) => number; doubling: string }> = {
  one: { label: '1', theta: 'Θ(1)', f: () => 1, doubling: 'stays the same' },
  log: { label: 'log₂ n', theta: 'Θ(log n)', f: n => Math.log2(n), doubling: 'grows by +1' },
  n: { label: 'n', theta: 'Θ(n)', f: n => n, doubling: 'doubles (×2)' },
  nlogn: { label: 'n log₂ n', theta: 'Θ(n log n)', f: n => n * Math.log2(n), doubling: 'slightly more than doubles' },
  n2: { label: 'n²', theta: 'Θ(n²)', f: n => n * n, doubling: 'quadruples (×4)' },
  exp: { label: '2ⁿ', theta: 'Θ(2ⁿ)', f: n => 2 ** n, doubling: 'squares' },
}

/* ---------- RAM model: line-by-line cost traces ---------- */
export type RamProgramId = 'constant' | 'linear' | 'quadratic'
export interface RamLine { code: string; cost: number; why: string }
export interface RamStep { line: number; cost: number; total: number; vars: Record<string, number | string>; arr: number[]; active: number[]; note: string }
export interface RamProgram { title: string; growth: GrowthId; lines: RamLine[]; formula: string; count: (n: number) => number }

export const ramInput = (n: number) => [7, 3, 9, 2, 8, 4, 6, 1, 5, 10, 12, 11].slice(0, Math.max(1, Math.min(12, n)))

export const ramPrograms: Record<RamProgramId, RamProgram> = {
  constant: {
    title: 'Swap first and last', growth: 'one', formula: 'T(n) = 2 + 2 + 2 = 6',
    count: () => 6,
    lines: [
      { code: 't ← A[1]', cost: 2, why: 'read A[1], assign t' },
      { code: 'A[1] ← A[n]', cost: 2, why: 'read A[n], write A[1]' },
      { code: 'A[n] ← t', cost: 2, why: 'read t, write A[n]' },
    ],
  },
  linear: {
    title: 'Sum an array', growth: 'n', formula: 'T(n) = 1 + (n+1) + 3n + 1 = 4n + 3',
    count: n => 4 * n + 3,
    lines: [
      { code: 's ← 0', cost: 1, why: 'one assignment' },
      { code: 'for i ← 1 to n', cost: 1, why: 'one test of i ≤ n (runs n+1 times)' },
      { code: '    s ← s + A[i]', cost: 3, why: 'read A[i], add, assign' },
      { code: 'return s', cost: 1, why: 'one return' },
    ],
  },
  quadratic: {
    title: 'Visit every pair', growth: 'n2', formula: 'T(n) = 1 + (n+1) + n(n+1) + 2n² + 1 = 3n² + 2n + 3',
    count: n => 3 * n * n + 2 * n + 3,
    lines: [
      { code: 'c ← 0', cost: 1, why: 'one assignment' },
      { code: 'for i ← 1 to n', cost: 1, why: 'one test of i ≤ n (runs n+1 times)' },
      { code: '    for j ← 1 to n', cost: 1, why: 'one test of j ≤ n (n+1 times per i)' },
      { code: '        c ← c + 1', cost: 2, why: 'add, assign' },
      { code: 'return c', cost: 1, why: 'one return' },
    ],
  },
}

export function ramTrace(id: RamProgramId, n: number): RamStep[] {
  const arr = ramInput(n), len = arr.length, lines = ramPrograms[id].lines
  const steps: RamStep[] = []
  let total = 0
  const push = (line: number, vars: Record<string, number | string>, a: number[], active: number[], note: string) => {
    total += lines[line].cost
    steps.push({ line, cost: lines[line].cost, total, vars: { ...vars }, arr: [...a], active, note })
  }
  if (id === 'constant') {
    const a = [...arr]
    const t = a[0]; push(0, { t }, a, [0], `Copy A[1] = ${t} into t.`)
    a[0] = a[len - 1]; push(1, { t }, a, [0, len - 1], `Overwrite A[1] with A[n] = ${a[0]}.`)
    a[len - 1] = t; push(2, { t }, a, [len - 1], `Write t = ${t} into A[n]. The cost never depended on n.`)
  } else if (id === 'linear') {
    let s = 0
    push(0, { s }, arr, [], 'Initialise the running sum.')
    for (let i = 1; ; i++) {
      const ok = i <= len
      push(1, { s, i }, arr, [], ok ? `Test ${i} ≤ ${len}: true, enter the body.` : `Test ${i} ≤ ${len}: false, leave the loop.`)
      if (!ok) break
      s += arr[i - 1]
      push(2, { s, i }, arr, [i - 1], `Add A[${i}] = ${arr[i - 1]}; s is now ${s}.`)
    }
    push(3, { s }, arr, [], `Return ${s}.`)
  } else {
    let c = 0
    push(0, { c }, arr, [], 'Initialise the counter.')
    for (let i = 1; ; i++) {
      const okI = i <= len
      push(1, { c, i }, arr, [], okI ? `Test ${i} ≤ ${len}: true, start row i = ${i}.` : `Test ${i} ≤ ${len}: false, leave the outer loop.`)
      if (!okI) break
      for (let j = 1; ; j++) {
        const okJ = j <= len
        push(2, { c, i, j }, arr, okJ ? [i - 1, j - 1] : [], okJ ? `Test ${j} ≤ ${len}: true, visit pair (${i}, ${j}).` : `Test ${j} ≤ ${len}: false, row i = ${i} done.`)
        if (!okJ) break
        c++
        push(3, { c, i, j }, arr, [i - 1, j - 1], `Count pair (${i}, ${j}); c = ${c}.`)
      }
    }
    push(4, { c }, arr, [], `Return ${c} = n².`)
  }
  return steps
}

/* ---------- Asymptotic bounds: find the real n₀ for f(n) ≤ c·g(n) or f(n) ≥ c·g(n) ---------- */
export type BoundG = 'n' | 'n2' | 'n3'
export const boundG: Record<BoundG, { label: string; f: (n: number) => number }> = {
  n: { label: 'n', f: n => n }, n2: { label: 'n²', f: n => n * n }, n3: { label: 'n³', f: n => n ** 3 },
}
export interface Quad { a: number; b: number; c: number }
export const quad = (q: Quad) => (n: number) => q.a * n * n + q.b * n + q.c
/** The difference is a polynomial whose real roots lie below ~1 + 50/0.5 = 101 for the slider ranges,
 *  so scanning to 2000 and testing at 10⁶ gives the exact eventual behaviour and the exact smallest n₀. */
const SCAN = 2000
export function witness(q: Quad, g: BoundG, k: number, kind: 'upper' | 'lower'): { holds: boolean; n0: number | null } {
  const f = quad(q), gf = boundG[g].f
  const ok = (n: number) => kind === 'upper' ? f(n) <= k * gf(n) : f(n) >= k * gf(n)
  if (!ok(1e6)) return { holds: false, n0: null }
  let n0 = 1
  for (let n = SCAN; n >= 1; n--) if (!ok(n)) { n0 = n + 1; break }
  return { holds: true, n0 }
}

/* ---------- Loop patterns: every iteration as a cell, in execution order ---------- */
export type PatternId = 'constant' | 'linear' | 'log' | 'triangular' | 'nlogn' | 'quadratic'
export interface Pattern { label: string; code: string[]; growth: GrowthId; sum: string; closed: string; count: (n: number) => number }
const lg = (n: number) => Math.floor(Math.log2(n)) + 1 // iterations of "while i ≥ 1: i ← ⌊i/2⌋" starting at n
export const patterns: Record<PatternId, Pattern> = {
  constant: { label: 'Constant', growth: 'one', code: ['x ← A[1]', 'y ← A[2]', 'z ← x + y'], sum: '1 + 1 + 1', closed: '3', count: () => 3 },
  linear: { label: 'Linear', growth: 'n', code: ['for i ← 1 to n', '    work()'], sum: 'Σᵢ₌₁ⁿ 1', closed: 'n', count: n => n },
  log: { label: 'Logarithmic', growth: 'log', code: ['i ← n', 'while i ≥ 1', '    work()', '    i ← ⌊i / 2⌋'], sum: '1 per halving', closed: '⌊log₂ n⌋ + 1', count: lg },
  triangular: { label: 'Triangular', growth: 'n2', code: ['for i ← 1 to n', '    for j ← 1 to i', '        work()'], sum: 'Σᵢ₌₁ⁿ i', closed: 'n(n+1)/2', count: n => n * (n + 1) / 2 },
  nlogn: { label: 'Linearithmic', growth: 'nlogn', code: ['for i ← 1 to n', '    j ← n', '    while j ≥ 1', '        work(); j ← ⌊j / 2⌋'], sum: 'Σᵢ₌₁ⁿ (⌊log₂ n⌋ + 1)', closed: 'n(⌊log₂ n⌋ + 1)', count: n => n * lg(n) },
  quadratic: { label: 'Quadratic', growth: 'n2', code: ['for i ← 1 to n', '    for j ← 1 to n', '        work()'], sum: 'Σᵢ₌₁ⁿ n', closed: 'n²', count: n => n * n },
}
/** Iterations in execution order. row/col place each one on the grid; label says which loop values it ran with. */
export function patternCells(id: PatternId, n: number): { row: number; col: number; label: string }[] {
  const out: { row: number; col: number; label: string }[] = []
  if (id === 'constant') for (let k = 0; k < 3; k++) out.push({ row: 0, col: k, label: `statement ${k + 1}` })
  if (id === 'linear') for (let i = 1; i <= n; i++) out.push({ row: 0, col: i - 1, label: `i = ${i}` })
  if (id === 'log') { let r = 0; for (let i = n; i >= 1; i = Math.floor(i / 2)) out.push({ row: r++, col: 0, label: `i = ${i}` }) }
  if (id === 'triangular') for (let i = 1; i <= n; i++) for (let j = 1; j <= i; j++) out.push({ row: i - 1, col: j - 1, label: `i = ${i}, j = ${j}` })
  if (id === 'quadratic') for (let i = 1; i <= n; i++) for (let j = 1; j <= n; j++) out.push({ row: i - 1, col: j - 1, label: `i = ${i}, j = ${j}` })
  if (id === 'nlogn') for (let i = 1; i <= n; i++) { let r = 0; for (let j = n; j >= 1; j = Math.floor(j / 2)) out.push({ row: r++, col: i - 1, label: `i = ${i}, j = ${j}` }) }
  return out
}

/* ---------- Recursion trees and the Master Theorem (T(n) = a·T(n/2) + n^d, T(1) = 1) ---------- */
export interface Recurrence { id: string; a: number; d: 0 | 1 | 2; name: string; example: string }
export const recurrences: Recurrence[] = [
  { id: 'bsearch', a: 1, d: 0, name: 'T(n) = T(n/2) + 1', example: 'Binary search' },
  { id: 'halve', a: 1, d: 1, name: 'T(n) = T(n/2) + n', example: 'Halve, then scan' },
  { id: 'tree', a: 2, d: 0, name: 'T(n) = 2T(n/2) + 1', example: 'Tree traversal / max of array' },
  { id: 'merge', a: 2, d: 1, name: 'T(n) = 2T(n/2) + n', example: 'Merge sort' },
  { id: 'mult', a: 4, d: 1, name: 'T(n) = 4T(n/2) + n', example: 'Naive divide-and-conquer multiply' },
  { id: 'sq', a: 2, d: 2, name: 'T(n) = 2T(n/2) + n²', example: 'Quadratic combine step' },
]
const pow = (d: number) => d === 0 ? '1' : d === 1 ? 'n' : `n${d === 2 ? '²' : '³'}`
export function recursionTree(r: Recurrence, n: number) {
  const depth = Math.round(Math.log2(n))
  const levels = Array.from({ length: depth + 1 }, (_, k) => {
    const nodes = r.a ** k, size = n / 2 ** k, perNode = size ** r.d
    return { k, nodes, size, perNode, total: nodes * perNode }
  })
  const total = levels.reduce((s, l) => s + l.total, 0)
  const crit = Math.log2(r.a) // log_b a with b = 2
  const caseNo = r.d < crit ? 1 : r.d === crit ? 2 : 3
  const theta = caseNo === 1 ? `Θ(${pow(crit)})` : caseNo === 2 ? (r.d === 0 ? 'Θ(log n)' : `Θ(${pow(r.d)} log n)`) : `Θ(${pow(r.d)})`
  const shape = caseNo === 1 ? 'Level costs grow toward the leaves: the leaves dominate.' : caseNo === 2 ? 'Every level costs the same: total = (one level) × (number of levels).' : 'Level costs shrink toward the leaves: the root dominates.'
  return { levels, total, crit, critLabel: pow(crit), caseNo, theta, shape, fLabel: pow(r.d) }
}

/* ---------- Divide and conquer: merge sort frames ---------- */
export interface MsNode { lo: number; hi: number; depth: number; values: number[]; sorted: boolean }
export function mergeSortFrames(input: number[]) {
  const nodes: MsNode[] = []
  const build = (lo: number, hi: number, depth: number) => { nodes.push({ lo, hi, depth, values: input.slice(lo, hi), sorted: hi - lo <= 1 }); if (hi - lo > 1) { const m = (lo + hi) >> 1; build(lo, m, depth + 1); build(m, hi, depth + 1) } }
  build(0, input.length, 0)
  const maxDepth = Math.max(...nodes.map(x => x.depth))
  const sortedAt = new Map<string, { values: number[]; comparisons: number }>()
  const sortRange = (lo: number, hi: number): { values: number[]; comparisons: number } => {
    if (hi - lo <= 1) return { values: input.slice(lo, hi), comparisons: 0 }
    const m = (lo + hi) >> 1, L = sortRange(lo, m), R = sortRange(m, hi)
    const out: number[] = []; let i = 0, j = 0, cmp = 0
    while (i < L.values.length && j < R.values.length) { cmp++; out.push(L.values[i] <= R.values[j] ? L.values[i++] : R.values[j++]) }
    const res = { values: [...out, ...L.values.slice(i), ...R.values.slice(j)], comparisons: cmp }
    sortedAt.set(`${lo}-${hi}`, res); return res
  }
  sortRange(0, input.length)
  // Frames: split down one level at a time, then merge back up one level at a time.
  const frames: { visibleDepth: number; mergedFrom: number; title: string; detail: string }[] = []
  for (let d = 0; d <= maxDepth; d++) frames.push({ visibleDepth: d, mergedFrom: Infinity, title: d === 0 ? 'Input' : `Divide: level ${d}`, detail: d === 0 ? 'One unsorted problem of size n.' : d === maxDepth ? 'Every piece has size 1, which is already sorted (base case).' : `Split each piece in half: ${2 ** d} subproblems of size ≈ n/${2 ** d}.` })
  for (let d = maxDepth - 1; d >= 0; d--) {
    const cmp = nodes.filter(x => x.depth === d && x.hi - x.lo > 1).reduce((s, x) => s + (sortedAt.get(`${x.lo}-${x.hi}`)?.comparisons ?? 0), 0)
    frames.push({ visibleDepth: maxDepth, mergedFrom: d, title: `Combine: merge level ${d}`, detail: `Merge pairs of sorted pieces with ${cmp} comparisons (at most n − 1 per level).` })
  }
  return { nodes, maxDepth, frames, sortedAt }
}

/* ---------- Greedy: coin change, greedy vs optimal ---------- */
export function greedyCoins(coins: number[], amount: number): number[] {
  const out: number[] = []; let left = amount
  for (const c of [...coins].sort((a, b) => b - a)) while (left >= c) { out.push(c); left -= c }
  return left === 0 ? out : []
}
export function optimalCoins(coins: number[], amount: number): number[] {
  const best: (number[] | null)[] = Array(amount + 1).fill(null); best[0] = []
  for (let v = 1; v <= amount; v++) for (const c of coins) { const prev = v >= c ? best[v - c] : null; if (prev && (!best[v] || prev.length + 1 < best[v]!.length)) best[v] = [...prev, c].sort((x, y) => y - x) }
  return best[amount] ?? []
}

/* ---------- Backtracking: N-Queens search trace (stops at the first solution) ---------- */
export type QueenEvent = { kind: 'place' | 'reject' | 'backtrack' | 'solved'; row: number; col: number; queens: number[]; attackers: number[] }
export function queensTrace(N: number): QueenEvent[] {
  const ev: QueenEvent[] = [], q: number[] = []
  const attackers = (r: number, c: number) => q.map((qc, qr) => (qc === c || Math.abs(qc - c) === Math.abs(qr - r)) ? qr : -1).filter(x => x >= 0)
  const solve = (r: number): boolean => {
    if (r === N) { ev.push({ kind: 'solved', row: r - 1, col: q[r - 1], queens: [...q], attackers: [] }); return true }
    for (let c = 0; c < N; c++) {
      const at = attackers(r, c)
      if (at.length) { ev.push({ kind: 'reject', row: r, col: c, queens: [...q], attackers: at }); continue }
      q.push(c); ev.push({ kind: 'place', row: r, col: c, queens: [...q], attackers: [] })
      if (solve(r + 1)) return true
      q.pop(); ev.push({ kind: 'backtrack', row: r, col: c, queens: [...q], attackers: [] })
    }
    return false
  }
  solve(0)
  return ev
}

/* ---------- Branch and bound: 0/1 knapsack with the fractional (greedy) upper bound ---------- */
export interface BBItem { name: string; w: number; v: number }
export interface BBNode { id: string; depth: number; path: number[]; w: number; v: number; bound: number; status: 'expanded' | 'pruned' | 'infeasible' | 'leaf'; incumbent: number; note: string }
export const bbItems: BBItem[] = [{ name: 'Item 1', w: 2, v: 12 }, { name: 'Item 2', w: 3, v: 20 }, { name: 'Item 3', w: 4, v: 24 }, { name: 'Item 4', w: 5, v: 25 }]
export function branchAndBound(items: BBItem[], cap: number) {
  const order = items.map((it, i) => ({ ...it, i })).sort((a, b) => b.v / b.w - a.v / a.w || a.i - b.i)
  const bound = (depth: number, w: number, v: number) => { let b = v, room = cap - w; for (let k = depth; k < order.length && room > 0; k++) { const take = Math.min(1, room / order[k].w); b += take * order[k].v; room -= take * order[k].w } return b }
  const visited: BBNode[] = []
  let best = 0, bestPath: number[] = []
  const visit = (depth: number, path: number[], w: number, v: number) => {
    const id = path.join('') || 'root'
    if (w > cap) { visited.push({ id, depth, path, w, v, bound: 0, status: 'infeasible', incumbent: best, note: `Weight ${w} > capacity ${cap}: infeasible, discard.` }); return }
    const b = bound(depth, w, v)
    if (depth === order.length) {
      const improved = v > best
      if (improved) { best = v; bestPath = path }
      visited.push({ id, depth, path, w, v, bound: v, status: 'leaf', incumbent: best, note: improved ? `Complete solution worth ${v}: new best.` : `Complete solution worth ${v}: not better than ${best}.` }); return
    }
    if (b <= best) { visited.push({ id, depth, path, w, v, bound: b, status: 'pruned', incumbent: best, note: `Bound ${fmt(b)} ≤ best ${best}: no completion can win, prune.` }); return }
    visited.push({ id, depth, path, w, v, bound: b, status: 'expanded', incumbent: best, note: `Bound ${fmt(b)} > best ${best}: branch on ${order[depth].name}.` })
    visit(depth + 1, [...path, 1], w + order[depth].w, v + order[depth].v)
    visit(depth + 1, [...path, 0], w, v)
  }
  visit(0, [], 0, 0)
  return { order, visited, best, bestPath, fullTree: 2 ** (order.length + 1) - 1 }
}
const fmt = (x: number) => Number.isInteger(x) ? String(x) : x.toFixed(1)