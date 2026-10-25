/* Unit 2 — binary heaps (priority queues) and hash tables. */

/* ---------- Binary heap stored in an array (0-based: children 2i+1, 2i+2; parent ⌊(i−1)/2⌋) ---------- */
export type HeapKind = 'max' | 'min'
export type HeapOp = { kind: 'insert'; key: number } | { kind: 'extract' } | { kind: 'build'; keys: number[] }
export interface HeapFrame { a: number[]; compare?: [number, number]; swap?: [number, number]; focus?: number; removed?: number; text: string; title: string; comparisons: number; swaps: number }
export function heapOp(base: number[], op: HeapOp, kind: HeapKind = 'max') {
  const before = (x: number, y: number) => kind === 'max' ? x > y : x < y // x should sit above y
  const word = kind === 'max' ? 'larger' : 'smaller', top = kind === 'max' ? 'maximum' : 'minimum'
  let a = op.kind === 'build' ? [...op.keys] : [...base]
  const frames: HeapFrame[] = []
  let comparisons = 0, swaps = 0
  const snap = (f: Omit<HeapFrame, 'a' | 'comparisons' | 'swaps'>) => frames.push({ ...f, a: [...a], comparisons, swaps })
  const swap = (i: number, j: number) => { [a[i], a[j]] = [a[j], a[i]]; swaps++ }
  const siftDown = (i: number, n: number, label: string) => {
    for (;;) {
      const l = 2 * i + 1, r = l + 1
      if (l >= n) { snap({ focus: i, title: `${label}: ${a[i]} is a leaf`, text: 'No children, so it cannot move further down.' }); return }
      let c = l
      if (r < n) { comparisons++; if (before(a[r], a[l])) c = r }
      comparisons++
      if (before(a[c], a[i])) { const x = a[i], y = a[c]; snap({ compare: [i, c], title: `${label}: compare ${x} with child ${y}`, text: `${y} is the ${word} child and beats ${x}: swap them.` }); swap(i, c); snap({ swap: [i, c], focus: c, title: `${label}: swapped`, text: `${x} moves down to index ${c}.` }); i = c }
      else { snap({ compare: [i, c], focus: i, title: `${label}: ${a[i]} stays`, text: `${a[i]} already beats its ${word} child ${a[c]}: the heap property holds.` }); return }
    }
  }
  if (op.kind === 'insert') {
    a.push(op.key); let i = a.length - 1
    snap({ focus: i, title: `Insert ${op.key}`, text: `Append ${op.key} at the next free slot, index ${i}, which keeps the tree complete.` })
    while (i > 0) {
      const p = (i - 1) >> 1; comparisons++
      if (before(a[i], a[p])) { snap({ compare: [i, p], title: `Sift up: ${a[i]} vs parent ${a[p]}`, text: `${a[i]} beats its parent: swap.` }); swap(i, p); snap({ swap: [i, p], focus: p, title: 'Sift up: swapped', text: `${a[p]} moved up to index ${p}.` }); i = p }
      else { snap({ compare: [i, p], focus: i, title: `Sift up: ${a[i]} vs parent ${a[p]}`, text: `${a[i]} does not beat ${a[p]}: stop. At most ⌊log₂ n⌋ swaps.` }); break }
    }
    if (i === 0) snap({ focus: 0, title: `${a[0]} is the new root`, text: `It is the ${top} of the heap.` })
  } else if (op.kind === 'extract') {
    if (!a.length) { snap({ title: 'Heap is empty', text: 'Nothing to extract.' }) }
    else {
      const out = a[0]
      snap({ focus: 0, title: `Extract ${top}: ${out}`, text: `The ${top} is always at the root, a[0].` })
      const last = a.pop()!
      if (a.length) { a[0] = last; swaps++; snap({ focus: 0, removed: out, title: `Move last key ${last} to the root`, text: 'This keeps the tree complete; now sift it down to restore the heap.' }); siftDown(0, a.length, 'Sift down') }
      snap({ removed: out, title: `Removed ${out}`, text: `Extract costs O(log n): one root-to-leaf path.` })
    }
  } else {
    snap({ title: `Build heap from ${a.length} keys`, text: `Leaves (indices ${a.length >> 1}…${a.length - 1}) are already heaps. Sift down each internal node from index ${(a.length >> 1) - 1} back to 0.` })
    for (let i = (a.length >> 1) - 1; i >= 0; i--) { snap({ focus: i, title: `Heapify index ${i} (key ${a[i]})`, text: 'Both of its subtrees are heaps; sift this key down into place.' }); siftDown(i, a.length, `Heapify ${i}`) }
    snap({ title: 'Heap built', text: `${comparisons} comparisons and ${swaps} swaps. Bottom-up building is O(n), cheaper than n separate inserts (O(n log n)).` })
  }
  return { frames, result: a, comparisons, swaps }
}
export const isHeap = (a: number[], kind: HeapKind = 'max') => a.every((v, i) => i === 0 || (kind === 'max' ? a[(i - 1) >> 1] >= v : a[(i - 1) >> 1] <= v))
/** Build-heap cost: bottom-up heapify vs inserting one key at a time, on ascending input (the insert worst case for a max-heap). */
export function buildStudy() {
  return Array.from({ length: 16 }, (_, k) => {
    const n = (k + 1) * 4, keys = Array.from({ length: n }, (_, i) => i + 1)
    const bottomUp = heapOp([], { kind: 'build', keys }).comparisons
    let inserts = 0, h: number[] = []
    for (const x of keys) { const r = heapOp(h, { kind: 'insert', key: x }); inserts += r.comparisons; h = r.result }
    return { n, bottomUp, inserts, twoN: 2 * n }
  })
}

/* ---------- Hash tables ---------- */
export type HashMethod = 'chaining' | 'linear' | 'quadratic' | 'double'
export const hashInfo: Record<HashMethod, { name: string; probe: string }> = {
  chaining: { name: 'Separate chaining', probe: 'h(k) = k mod m; colliding keys share a linked list' },
  linear: { name: 'Linear probing', probe: 'h(k, i) = (h(k) + i) mod m' },
  quadratic: { name: 'Quadratic probing', probe: 'h(k, i) = (h(k) + i + 3i²) mod m' },
  double: { name: 'Double hashing', probe: 'h(k, i) = (h(k) + i·h₂(k)) mod m, h₂(k) = 1 + (k mod (m − 1))' },
}
export const probeAt = (method: HashMethod, k: number, i: number, m: number) => {
  const h1 = k % m
  if (method === 'quadratic') return (h1 + i + 3 * i * i) % m
  if (method === 'double') return (h1 + i * (1 + (k % (m - 1)))) % m
  return (h1 + i) % m
}
export interface HashFrame { table: (number | null)[]; chains: number[][]; key: number; probes: number[]; slot: number | null; status: 'probe' | 'placed' | 'failed' | 'found' | 'missing'; text: string; title: string }
export function hashTrace(keys: number[], m: number, method: HashMethod, search?: number) {
  const table: (number | null)[] = Array(m).fill(null), chains: number[][] = Array.from({ length: m }, () => [])
  const frames: HashFrame[] = [], probeCounts: number[] = []
  const snap = (f: Omit<HashFrame, 'table' | 'chains'>) => frames.push({ ...f, table: [...table], chains: chains.map(c => [...c]) })
  for (const k of keys) {
    if (method === 'chaining') {
      const s = k % m, len = chains[s].length
      chains[s].unshift(k); probeCounts.push(1)
      snap({ key: k, probes: [s], slot: s, status: 'placed', title: `Insert ${k}`, text: `h(${k}) = ${k} mod ${m} = ${s}. ${len ? `Collision with ${len} key${len > 1 ? 's' : ''}: put ${k} at the front of the chain in O(1).` : 'Empty slot: start a chain.'}` })
      continue
    }
    const probes: number[] = []
    let placed = false
    for (let i = 0; i < m; i++) {
      const s = probeAt(method, k, i, m); probes.push(s)
      if (table[s] === null) { table[s] = k; placed = true; probeCounts.push(i + 1); snap({ key: k, probes: [...probes], slot: s, status: 'placed', title: `Insert ${k}`, text: `${i === 0 ? `h(${k}) = ${s} is free.` : `Probe ${i + 1}: slot ${s} is free.`} ${i ? `${i} collision${i > 1 ? 's' : ''} before finding a slot.` : ''}` }); break }
      snap({ key: k, probes: [...probes], slot: null, status: 'probe', title: `Insert ${k}: probe ${i + 1}`, text: `Slot ${s} holds ${table[s]}: collision, try the next position in the probe sequence.` })
    }
    if (!placed) { probeCounts.push(m); snap({ key: k, probes, slot: null, status: 'failed', title: `Cannot insert ${k}`, text: `The probe sequence visited ${new Set(probes).size} distinct slots out of ${m} and found none free. ${method === 'quadratic' ? 'Quadratic probing does not always reach every slot.' : 'The table is full.'}` }) }
  }
  if (search !== undefined) {
    if (method === 'chaining') {
      const s = search % m, idx = chains[s].indexOf(search)
      snap({ key: search, probes: [s], slot: idx >= 0 ? s : null, status: idx >= 0 ? 'found' : 'missing', title: `Search ${search}`, text: `h(${search}) = ${s}; scan its chain of ${chains[s].length} key${chains[s].length === 1 ? '' : 's'}: ${idx >= 0 ? `found after ${idx + 1} comparison${idx ? 's' : ''}` : 'not present'}.` })
    } else {
      const probes: number[] = []
      for (let i = 0; i < m; i++) {
        const s = probeAt(method, search, i, m); probes.push(s)
        if (table[s] === search) { snap({ key: search, probes: [...probes], slot: s, status: 'found', title: `Search ${search}: found`, text: `Found in slot ${s} after ${i + 1} probe${i ? 's' : ''}.` }); break }
        if (table[s] === null) { snap({ key: search, probes: [...probes], slot: null, status: 'missing', title: `Search ${search}: not present`, text: `Slot ${s} is empty, so ${search} cannot be further along its probe sequence. ${i + 1} probe${i ? 's' : ''}.` }); break }
        snap({ key: search, probes: [...probes], slot: null, status: 'probe', title: `Search ${search}: probe ${i + 1}`, text: `Slot ${s} holds ${table[s]}, not ${search}: keep probing.` })
        if (i === m - 1) snap({ key: search, probes: [...probes], slot: null, status: 'missing', title: `Search ${search}: not present`, text: 'Every probe position checked.' })
      }
    }
  }
  const n = keys.length
  return { frames, table, chains, loadFactor: n / m, avgProbes: probeCounts.length ? probeCounts.reduce((s, x) => s + x, 0) / probeCounts.length : 0 }
}
/** Expected probes for an UNSUCCESSFUL search at load factor α (classical results under uniform-hashing assumptions). */
export const expectedProbes = (alpha: number) => ({ chaining: 1 + alpha, linear: 0.5 * (1 + 1 / (1 - alpha) ** 2), uniform: 1 / (1 - alpha) })