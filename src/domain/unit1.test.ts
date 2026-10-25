import { describe, expect, it } from 'vitest'
import { bbItems, boundG, branchAndBound, greedyCoins, greedySteps, mergeSortTrace, optimalCoins, patternCells, patterns, queensTrace, queensTree, ramPrograms, ramTrace, recurrences, recursionTree, witness, quad, type PatternId, type RamProgramId } from './unit1'

const last = <T,>(a: T[]): T => a[a.length - 1]
describe('RAM traces', () => {
  for (const id of Object.keys(ramPrograms) as RamProgramId[]) it(`${id}: trace total equals the closed form for n = 1..20`, () => {
    for (let n = 1; n <= 20; n++) {
      const t = ramTrace(id, n)
      expect(t[t.length - 1].total).toBe(ramPrograms[id].count(n))
      expect(t.reduce((s, x) => s + x.cost, 0)).toBe(ramPrograms[id].count(n))
    }
  })
  it('is deterministic', () => expect(ramTrace('quadratic', 7)).toEqual(ramTrace('quadratic', 7)))
  it('sum program returns the real sum', () => expect(last(ramTrace('linear', 4)).vars.s).toBe(7 + 3 + 9 + 2))
})

describe('bound witness', () => {
  const f = { a: 3, b: 8, c: 12 }
  it('3n²+8n+12 ≤ 4n² from n₀ = 10', () => expect(witness(f, 'n2', 4, 'upper')).toEqual({ holds: true, n0: 10 }))
  it('3n²+8n+12 ≥ 3n² for all n ≥ 1', () => expect(witness(f, 'n2', 3, 'lower')).toEqual({ holds: true, n0: 1 }))
  it('is not O(n) for any constant', () => expect(witness(f, 'n', 10, 'upper').holds).toBe(false))
  it('is not Ω(n³)', () => expect(witness(f, 'n3', 0.5, 'lower').holds).toBe(false))
  it('n₀ is the true threshold', () => {
    for (const k of [3.5, 4, 5, 8]) {
      const { n0 } = witness(f, 'n2', k, 'upper'), F = quad(f)
      for (let n = n0!; n < 500; n++) expect(F(n)).toBeLessThanOrEqual(k * boundG.n2.f(n))
      if (n0! > 1) expect(F(n0! - 1)).toBeGreaterThan(k * boundG.n2.f(n0! - 1))
    }
  })
})

describe('loop patterns', () => {
  for (const id of Object.keys(patterns) as PatternId[]) it(`${id}: number of cells equals the closed form`, () => {
    for (let n = 1; n <= 20; n++) expect(patternCells(id, n).length).toBe(patterns[id].count(n))
  })
})

describe('recursion tree', () => {
  const expected: Record<string, string> = { bsearch: 'Θ(log n)', halve: 'Θ(n)', tree: 'Θ(n)', merge: 'Θ(n log n)', mult: 'Θ(n²)', sq: 'Θ(n²)' }
  for (const r of recurrences) it(`${r.id} → ${expected[r.id]}`, () => expect(recursionTree(r, 16).theta).toBe(expected[r.id]))
  it('merge sort total = n log n + n', () => expect(recursionTree(recurrences.find(r => r.id === 'merge')!, 16).total).toBe(16 * 4 + 16))
  it('tree matches the recurrence evaluated directly', () => {
    for (const r of recurrences) {
      const T = (n: number): number => n === 1 ? 1 : r.a * T(n / 2) + n ** r.d
      for (const n of [2, 8, 32]) expect(recursionTree(r, n).total).toBe(T(n))
    }
  })
})

describe('paradigms', () => {
  it('merge sort trace sorts and counts real comparisons', () => {
    const ms = mergeSortTrace([38, 27, 43, 3, 9, 82, 10, 15])
    expect(ms.result).toEqual([3, 9, 10, 15, 27, 38, 43, 82])
    expect(last(ms.frames).done['0-8']).toEqual(ms.result)
    expect(mergeSortTrace([1, 2, 3, 4, 5, 6, 7, 8]).comparisons).toBe(12) // sorted input: n/2·log n
    expect(mergeSortTrace([8, 7, 6, 5, 4, 3, 2, 1]).comparisons).toBe(12)
  })
  it('greedy steps add up to the amount', () => {
    for (let a = 1; a <= 30; a++) { const st = greedySteps([4, 3, 1], a); expect(st.reduce((s, x) => s + x.coin, 0)).toBe(a); expect(st.map(x => x.coin)).toEqual(greedyCoins([4, 3, 1], a)) }
  })
  it('queens tree mirrors the trace', () => {
    for (const N of [4, 5, 6]) {
      const ev = queensTrace(N), t = queensTree(ev)
      expect(t.nodes.length - 1).toBe(ev.filter(e => e.kind !== 'backtrack' && e.kind !== 'solved').length)
      expect(t.nodes.filter(n => n.solution).length).toBe(N)
    }
  })
  it('greedy coin change fails for {4,3,1} at 6', () => {
    expect(greedyCoins([4, 3, 1], 6)).toEqual([4, 1, 1])
    expect(optimalCoins([4, 3, 1], 6)).toHaveLength(2)
  })
  it('greedy is optimal for {25,10,5,1} up to 99', () => {
    for (let a = 1; a < 100; a++) expect(greedyCoins([25, 10, 5, 1], a).length).toBe(optimalCoins([25, 10, 5, 1], a).length)
  })
  it('N-queens finds the first solution', () => {
    expect(last(queensTrace(4)).queens).toEqual([1, 3, 0, 2])
    for (const N of [5, 6]) { const q = last(queensTrace(N)); expect(q.kind).toBe('solved'); expect(new Set(q.queens).size).toBe(N) }
  })
  it('branch and bound finds the DP optimum (45) with every strategy', () => {
    for (const s of ['lifo', 'fifo', 'lc'] as const) {
      const r = branchAndBound(bbItems, 8, s)
      expect(r.best).toBe(45)
      expect(r.visited.length).toBeLessThanOrEqual(r.fullTree)
      expect(last(r.visited).live).toEqual([])
    }
    expect(branchAndBound(bbItems, 8, 'lifo').visited.some(n => n.status === 'pruned')).toBe(true)
  })
})