/* Unit 4 — dynamic programming: binomial coefficient, matrix-chain multiplication, LCS and 0/1 knapsack.
 * Each table is filled in its real dependency order and every cell is one frame. */

export interface Cell { i: number; j: number }
export interface TFrame { table: (number | null)[][]; cur?: Cell; deps?: Cell[]; best?: Cell; title: string; text: string; extra?: Record<string, string | number> }

/* ---------- Binomial coefficient C(n, k) = C(n−1, k−1) + C(n−1, k) ---------- */
export function binomialDP(n: number, k: number) {
  const C: (number | null)[][] = Array.from({ length: n + 1 }, (_, i) => Array(Math.min(i, k) + 1).fill(null))
  const frames: TFrame[] = []
  const snap = (f: Omit<TFrame, 'table'>) => frames.push({ ...f, table: C.map(r => [...r]) })
  snap({ title: `Compute C(${n}, ${k}) bottom-up`, text: 'Fill Pascal’s triangle row by row; each entry needs only two entries of the row above.' })
  for (let i = 0; i <= n; i++) for (let j = 0; j <= Math.min(i, k); j++) {
    if (j === 0 || j === i) { C[i][j] = 1; snap({ cur: { i, j }, title: `C(${i}, ${j}) = 1`, text: j === 0 ? 'Choosing nothing: exactly one way (base case).' : 'Choosing everything: exactly one way (base case).' }) }
    else { C[i][j] = C[i - 1][j - 1]! + C[i - 1][j]!; snap({ cur: { i, j }, deps: [{ i: i - 1, j: j - 1 }, { i: i - 1, j }], title: `C(${i}, ${j}) = ${C[i - 1][j - 1]} + ${C[i - 1][j]} = ${C[i][j]}`, text: `Either item ${i} is chosen (C(${i - 1}, ${j - 1}) ways) or it is not (C(${i - 1}, ${j}) ways).` }) }
  }
  snap({ cur: { i: n, j: k }, title: `C(${n}, ${k}) = ${C[n][k]}`, text: `${frames.length - 1} cells, each O(1): Θ(nk) time. Only the previous row is needed, so O(k) space is enough.` })
  return { frames, value: C[n][k]! }
}
/** Calls made by the plain recursion C(n,k) = C(n−1,k−1) + C(n−1,k), and how many are repeats. */
export function binomialCalls(n: number, k: number) {
  const seen = new Map<string, number>(); let calls = 0
  const rec = (a: number, b: number): number => { calls++; const key = `${a},${b}`; seen.set(key, (seen.get(key) ?? 0) + 1); return b === 0 || b === a ? 1 : rec(a - 1, b - 1) + rec(a - 1, b) }
  rec(n, k)
  return { calls, distinct: seen.size, seen }
}
export interface RNode { a: number; b: number; kids: RNode[]; dup: boolean }
export function binomialTree(n: number, k: number): RNode {
  const count = binomialCalls(n, k).seen
  const build = (a: number, b: number): RNode => ({ a, b, dup: (count.get(`${a},${b}`) ?? 0) > 1, kids: b === 0 || b === a ? [] : [build(a - 1, b - 1), build(a - 1, b)] })
  return build(n, k)
}

/* ---------- Matrix-chain multiplication: m[i][j] = min over k of m[i][k] + m[k+1][j] + p(i−1)·p(k)·p(j) ---------- */
export function matrixChain(p: number[]) {
  const n = p.length - 1
  const m: (number | null)[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(null)), s: (number | null)[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(null))
  const frames: (TFrame & { s: (number | null)[][]; tries?: { k: number; cost: number }[] })[] = []
  const snap = (f: Omit<TFrame, 'table'> & { tries?: { k: number; cost: number }[] }) => frames.push({ ...f, table: m.map(r => [...r]), s: s.map(r => [...r]) })
  for (let i = 1; i <= n; i++) m[i][i] = 0
  snap({ title: 'Chains of length 1 cost 0', text: `m[i][i] = 0: a single matrix needs no multiplication. Aᵢ has dimensions p(i−1) × p(i).` })
  for (let len = 2; len <= n; len++) for (let i = 1; i + len - 1 <= n; i++) {
    const j = i + len - 1; let best = Infinity, bk = -1; const tries: { k: number; cost: number }[] = []
    for (let k = i; k < j; k++) { const c = m[i][k]! + m[k + 1][j]! + p[i - 1] * p[k] * p[j]; tries.push({ k, cost: c }); if (c < best) { best = c; bk = k } }
    m[i][j] = best; s[i][j] = bk
    snap({ cur: { i, j }, deps: [{ i, j: bk }, { i: bk + 1, j }], tries, title: `m[${i}][${j}] = ${best} with split k = ${bk}`, text: `Try every split A${i}…Aₖ | Aₖ₊₁…A${j}: ${tries.map(t => `k=${t.k}: ${t.cost}`).join(', ')}. Best is k = ${bk}: ${m[i][bk]} + ${m[bk + 1][j]} + ${p[i - 1]}·${p[bk]}·${p[j]}.` })
  }
  const paren = (i: number, j: number): string => i === j ? `A${i}` : `(${paren(i, s[i][j]!)}${paren(s[i][j]! + 1, j)})`
  const order = paren(1, n)
  snap({ cur: { i: 1, j: n }, title: `Optimal cost ${m[1][n]}: ${order}`, text: `Θ(n³) time and Θ(n²) space. The split table s[i][j] rebuilds the parenthesisation.` })
  return { frames, cost: m[1][n]!, order, m, s }
}
/** Cost of every full parenthesisation (Catalan(n−1) of them), for the spread chart. */
export function allParenthesizations(p: number[]) {
  const memo = new Map<string, { str: string; cost: number }[]>()
  const go = (i: number, j: number): { str: string; cost: number }[] => {
    const key = `${i},${j}`; if (memo.has(key)) return memo.get(key)!
    if (i === j) return [{ str: `A${i}`, cost: 0 }]
    const out: { str: string; cost: number }[] = []
    for (let k = i; k < j; k++) for (const a of go(i, k)) for (const b of go(k + 1, j)) out.push({ str: `(${a.str}${b.str})`, cost: a.cost + b.cost + p[i - 1] * p[k] * p[j] })
    memo.set(key, out); return out
  }
  return go(1, p.length - 1)
}

/* ---------- Longest common subsequence ---------- */
export function lcs(X: string, Y: string) {
  const m = X.length, n = Y.length
  const c: (number | null)[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 || j === 0 ? 0 : null))
  const b: string[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(''))
  const frames: (TFrame & { arrows: string[][]; path?: Cell[] })[] = []
  const snap = (f: Omit<TFrame, 'table'> & { path?: Cell[] }) => frames.push({ ...f, table: c.map(r => [...r]), arrows: b.map(r => [...r]) })
  snap({ title: 'Row 0 and column 0 are 0', text: 'The LCS of anything with an empty string is empty.' })
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    if (X[i - 1] === Y[j - 1]) { c[i][j] = c[i - 1][j - 1]! + 1; b[i][j] = '↖'; snap({ cur: { i, j }, deps: [{ i: i - 1, j: j - 1 }], title: `X[${i}] = Y[${j}] = '${X[i - 1]}': c = ${c[i - 1][j - 1]} + 1 = ${c[i][j]}`, text: 'Matching characters extend the LCS of both shorter prefixes by one.' }) }
    else if (c[i - 1][j]! >= c[i][j - 1]!) { c[i][j] = c[i - 1][j]; b[i][j] = '↑'; snap({ cur: { i, j }, deps: [{ i: i - 1, j }, { i, j: j - 1 }], title: `'${X[i - 1]}' ≠ '${Y[j - 1]}': c = max(${c[i - 1][j]}, ${c[i][j - 1]}) = ${c[i][j]} (from above)`, text: 'Drop the last character of X or of Y, whichever leaves the longer LCS (ties go up).' }) }
    else { c[i][j] = c[i][j - 1]; b[i][j] = '←'; snap({ cur: { i, j }, deps: [{ i: i - 1, j }, { i, j: j - 1 }], title: `'${X[i - 1]}' ≠ '${Y[j - 1]}': c = max(${c[i - 1][j]}, ${c[i][j - 1]}) = ${c[i][j]} (from the left)`, text: 'Dropping the last character of Y keeps the longer LCS.' }) }
  }
  const path: Cell[] = []; let out = ''
  for (let i = m, j = n; i > 0 && j > 0;) { path.push({ i, j }); if (b[i][j] === '↖') { out = X[i - 1] + out; i--; j-- } else if (b[i][j] === '↑') i--; else j-- }
  for (let k = 1; k <= path.length; k++) snap({ cur: path[k - 1], path: path.slice(0, k), title: `Trace back: ${path.slice(0, k).filter(q => b[q.i][q.j] === '↖').map(q => X[q.i - 1]).reverse().join('') || '—'}`, text: b[path[k - 1].i][path[k - 1].j] === '↖' ? `↖ at (${path[k - 1].i}, ${path[k - 1].j}): '${X[path[k - 1].i - 1]}' belongs to the LCS.` : `${b[path[k - 1].i][path[k - 1].j]}: follow the arrow without adding a character.` })
  snap({ path, title: `LCS = "${out}" (length ${c[m][n]})`, text: `Θ(mn) time and space to fill the table; Θ(m + n) to trace the arrows back.` })
  return { frames, length: c[m][n]!, lcs: out }
}

/* ---------- 0/1 knapsack ---------- */
export interface Item { name: string; w: number; v: number }
export function knapsack01(items: Item[], W: number) {
  const n = items.length, K: (number | null)[][] = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: W + 1 }, () => i === 0 ? 0 : null))
  const frames: (TFrame & { take?: boolean; chosen?: number[]; path?: Cell[] })[] = []
  const snap = (f: Omit<TFrame, 'table'> & { take?: boolean; chosen?: number[]; path?: Cell[] }) => frames.push({ ...f, table: K.map(r => [...r]) })
  snap({ title: 'Row 0 is all 0', text: 'With no items the best value is 0 for every capacity.' })
  for (let i = 1; i <= n; i++) for (let w = 0; w <= W; w++) {
    const it = items[i - 1], skip = K[i - 1][w]!
    if (it.w > w) { K[i][w] = skip; snap({ cur: { i, j: w }, deps: [{ i: i - 1, j: w }], take: false, title: `K[${i}][${w}] = ${skip}: ${it.name} does not fit`, text: `${it.name} weighs ${it.w} > ${w}: copy the value from the row above.` }) }
    else { const take = it.v + K[i - 1][w - it.w]!; K[i][w] = Math.max(skip, take); snap({ cur: { i, j: w }, deps: [{ i: i - 1, j: w }, { i: i - 1, j: w - it.w }], take: take > skip, title: `K[${i}][${w}] = max(skip ${skip}, take ${it.v} + ${K[i - 1][w - it.w]} = ${take}) = ${K[i][w]}`, text: take > skip ? `Taking ${it.name} is better.` : `Leaving ${it.name} out is at least as good.` }) }
  }
  const chosen: number[] = [], path: Cell[] = []
  for (let i = n, w = W; i > 0; i--) { path.push({ i, j: w }); if (K[i][w] !== K[i - 1][w]) { chosen.unshift(i - 1); w -= items[i - 1].w } }
  for (let k = 1; k <= path.length; k++) { const q = path[k - 1], took = K[q.i][q.j] !== K[q.i - 1][q.j]; snap({ cur: q, path: path.slice(0, k), chosen: chosen.filter(c => c >= q.i - 1), title: `Trace back at K[${q.i}][${q.j}]`, text: took ? `K[${q.i}][${q.j}] ≠ K[${q.i - 1}][${q.j}], so ${items[q.i - 1].name} was taken; capacity drops by ${items[q.i - 1].w}.` : `K[${q.i}][${q.j}] = K[${q.i - 1}][${q.j}], so ${items[q.i - 1].name} was not taken.` }) }
  snap({ path, chosen, title: `Optimal value ${K[n][W]}: take ${chosen.map(c => items[c].name).join(', ')}`, text: `Θ(nW) time and space. This is pseudo-polynomial: it grows with the numeric value W, not with the number of bits needed to write W.` })
  return { frames, value: K[n][W]!, chosen }
}