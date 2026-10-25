import { describe, expect, it } from 'vitest'
import { bruteForceSAT, clauseState, cnfStr, dpll, maxIndependentSet, parseCNF, satPresets, satisfies, satToIS, type CNF } from './sat'
import { growthFns, largestN, problemCatalog, redEdges, redNodes, spread, subsetSumSearch, verifySubset } from './np'
import { bruteForceTSP, eulerCheck, hamiltonSearch, hamPresets, hamToTsp, heldKarp, makeCities, mstApprox, nearestNeighbour, tourCost } from './hamtsp'

function rng(seed: number) { return () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff } }
function randomCNF(nv: number, m: number, k: number, seed: number): CNF {
  const r = rng(seed)
  return { vars: Array.from({ length: nv }, (_, i) => 'abcdef'[i]), clauses: Array.from({ length: m }, () => { const vs = new Set<number>(); while (vs.size < Math.min(k, nv)) vs.add(Math.floor(r() * nv)); return [...vs].map(v => ({ v, neg: r() < 0.5 })) }) }
}
const last = <T,>(a: T[]) => a[a.length - 1]

describe('SAT', () => {
  it('parses several notations to the same formula', () => {
    const a = parseCNF('(a ∨ ¬b) ∧ (b ∨ c)').cnf!, b = parseCNF('(a | ~b) & (b | c)').cnf!, c = parseCNF('a, !b\nb, c').cnf!
    expect(cnfStr(a)).toBe('(a ∨ ¬b) ∧ (b ∨ c)'); expect(cnfStr(b)).toBe(cnfStr(a)); expect(cnfStr(c)).toBe(cnfStr(a))
    expect(parseCNF('(a ∨ 1b)').error).toBeTruthy()
    expect(parseCNF('').error).toBeTruthy()
  })
  it('clause states under partial assignments', () => {
    const f = parseCNF('(a ∨ ¬b)').cnf!
    expect(clauseState(f.clauses[0], [null, null])).toBe('open')
    expect(clauseState(f.clauses[0], [false, true])).toBe('unsat')
    expect(clauseState(f.clauses[0], [false, false])).toBe('sat')
  })
  it('presets: the small and four-variable ones are satisfiable, the other is not', () => {
    for (const [id, p] of Object.entries(satPresets)) {
      const f = parseCNF(p.text).cnf!, b = bruteForceSAT(f), d = dpll(f)
      expect(d.sat).toBe(b.count > 0)
      expect(d.sat).toBe(id !== 'unsat')
    }
  })
  it('DPLL agrees with brute force on 200 random formulas, and its assignment really satisfies', () => {
    for (let s = 1; s <= 200; s++) {
      const f = randomCNF(3 + (s % 4), 3 + (s % 9), 2 + (s % 2), s), b = bruteForceSAT(f), d = dpll(f)
      expect(d.sat).toBe(b.count > 0)
      if (d.sat) expect(satisfies(f, d.assign.map(x => x ?? true))).toBe(true)
      expect(b.frames.length).toBe(2 ** f.vars.length)
      expect(d.nodes).toBeLessThanOrEqual(2 ** (f.vars.length + 1))
    }
  })
  it('brute force rows are in binary order with all-true first', () => {
    const f = parseCNF('(a ∨ b)').cnf!, b = bruteForceSAT(f)
    expect(b.frames.map(x => x.assign.map(v => (v ? 'T' : 'F')).join(''))).toEqual(['TT', 'TF', 'FT', 'FF'])
    expect(b.count).toBe(3)
  })
})

describe('CNF-SAT ≤p INDEPENDENT-SET', () => {
  it('graph sizes match the construction', () => {
    const f = parseCNF(satPresets.small.text).cnf!, r = satToIS(f)
    expect(r.g.labels.length).toBe(f.clauses.flat().length)
    expect(r.kinds.filter(k => k === 'clause').length).toBe(f.clauses.reduce((s, c) => s + (c.length * (c.length - 1)) / 2, 0))
  })
  it('an independent set of size k exists exactly when the formula is satisfiable (150 random formulas)', () => {
    for (let s = 1; s <= 150; s++) {
      const f = randomCNF(2 + (s % 3), 2 + (s % 6), 2 + (s % 2), 1000 + s), r = satToIS(f)
      expect(r.isSat).toBe(bruteForceSAT(f).count > 0)
      // the chosen set really is independent
      const pairs = new Set(r.g.edges.map(e => `${e.u}-${e.v}`))
      for (const a of r.best) for (const b of r.best) if (a < b) expect(pairs.has(`${a}-${b}`)).toBe(false)
    }
  })
  it('maxIndependentSet matches subset brute force on a small graph', () => {
    const n = 6, groups = [0, 0, 1, 1, 2, 2], E = [[0, 1], [2, 3], [4, 5], [0, 2], [1, 4], [3, 5]]
    const adj = Array.from({ length: n }, () => new Set<number>()); E.forEach(([a, b]) => { adj[a].add(b); adj[b].add(a) })
    let bestSize = 0
    for (let m = 0; m < 64; m++) { const s = [...Array(n).keys()].filter(i => m & (1 << i)); if (s.every(a => s.every(b => a === b || !adj[a].has(b)))) bestSize = Math.max(bestSize, s.length) }
    expect(maxIndependentSet(n, adj, groups, 3).length).toBe(bestSize)
  })
})

describe('P vs NP', () => {
  it('subset sum: search finds a certificate, the verifier accepts it in n + 1 steps', () => {
    const nums = [3, 34, 4, 12, 5, 2], r = subsetSumSearch(nums, 9)
    expect(r.solution).not.toBeNull()
    const chosen = nums.map((_, i) => i).filter(i => r.solution! & (1 << i))
    expect(chosen.reduce((s, i) => s + nums[i], 0)).toBe(9)
    const v = verifySubset(nums, 9, chosen)
    expect(last(v).ok).toBe(true); expect(v.length).toBe(chosen.length + 2)
    expect(last(verifySubset(nums, 9, [0, 1])).ok).toBe(false)
  })
  it('subset sum NO-instance checks all 2ⁿ subsets', () => {
    const r = subsetSumSearch([2, 4, 6, 8], 5)
    expect(r.solution).toBeNull(); expect(r.checked).toBe(16)
  })
  it('largest n within 10⁹ steps', () => {
    const f = Object.fromEntries(growthFns.map(g => [g.id, largestN(g.f, 1e9)]))
    expect(f.n2).toBe(31622); expect(f.n3).toBe(1000); expect(f.exp).toBe(29); expect(f.fact).toBe(12)
  })
  it('catalog and reduction tree are consistent', () => {
    expect(problemCatalog.filter(p => p.cls === 'NPC').length).toBeGreaterThanOrEqual(6)
    for (const [a, b] of redEdges) { expect(redNodes.some(n => n.id === a)).toBe(true); expect(redNodes.some(n => n.id === b)).toBe(true) }
    expect(spread('sat', 'down').flat().sort()).toEqual(['3sat', 'clique', 'ham', 'sat', 'subset', 'tsp', 'vc'])
    expect(spread('tsp', 'up').flat()).toContain('np')
    expect(spread('subset', 'down')).toEqual([['subset']])
  })
})

describe('Hamiltonian cycle', () => {
  const brute = (g: typeof hamPresets.cube.g) => {
    const n = g.labels.length, has = (a: number, b: number) => g.edges.some(e => (e.u === a && e.v === b) || (e.u === b && e.v === a))
    const go = (p: number[], used: Set<number>): boolean => p.length === n ? has(p[n - 1], p[0]) : [...Array(n).keys()].some(v => !used.has(v) && has(p[p.length - 1], v) && go([...p, v], new Set([...used, v])))
    return go([0], new Set([0]))
  }
  it('backtracking agrees with exhaustive search on every preset', () => {
    for (const [id, p] of Object.entries(hamPresets)) {
      const r = hamiltonSearch(p.g)
      expect(!!r.found).toBe(brute(p.g))
      expect(!!r.found).toBe(id === 'cube' || id === 'seven')
      expect(r.truncated).toBe(false)
      if (r.found) { const c = r.found; for (let i = 0; i < c.length; i++) expect(p.g.edges.some(e => (e.u === c[i] && e.v === c[(i + 1) % c.length]) || (e.v === c[i] && e.u === c[(i + 1) % c.length]))).toBe(true); expect(new Set(c).size).toBe(p.g.labels.length) }
    }
  })
  it('Petersen search size is fixed', () => {
    const r = hamiltonSearch(hamPresets.petersen.g)
    expect(r.frames.length).toBeLessThan(2500)
    expect(r.backtracks).toBeGreaterThan(50)
  })
  it('Euler test is polynomial and independent of Hamiltonicity', () => {
    expect(eulerCheck(hamPresets.bowtie.g).euler).toBe(true)   // bow tie: Eulerian but not Hamiltonian
    expect(eulerCheck(hamPresets.cube.g).euler).toBe(false)    // cube: Hamiltonian but degrees are 3
  })
  it('HAM-CYCLE ≤p TSP preserves the answer', () => {
    for (const p of Object.values(hamPresets)) { const t = hamToTsp(p.g); expect(t.yes).toBe(brute(p.g)) }
  })
})

describe('TSP', () => {
  it('brute force equals Held–Karp, checks (n−1)!/2 tours, and is deterministic', () => {
    const fact = (k: number): number => (k <= 1 ? 1 : k * fact(k - 1))
    for (let n = 4; n <= 8; n++) {
      const c = makeCities(n, 7 + n), b = bruteForceTSP(c), h = heldKarp(c.D)
      expect(c.pos.length).toBe(n)
      expect(b.bestCost).toBe(h.cost); expect(tourCost(c.D, h.tour)).toBe(h.cost)
      expect(b.checked).toBe(fact(n - 1) / 2)
      expect(makeCities(n, 7 + n).pos).toEqual(c.pos)
    }
  })
  it('nearest neighbour ≥ optimum, MST ≤ optimum ≤ MST tour ≤ 2·MST', () => {
    for (let s = 1; s <= 30; s++) {
      const c = makeCities(4 + (s % 5), s), opt = heldKarp(c.D).cost, nn = nearestNeighbour(c), ma = mstApprox(c)
      expect(nn.cost).toBeGreaterThanOrEqual(opt)
      expect(ma.mstW).toBeLessThanOrEqual(opt)
      expect(ma.cost).toBeGreaterThanOrEqual(opt)
      expect(ma.cost).toBeLessThanOrEqual(2 * ma.mstW + c.D.length) // rounding of distances can break the triangle inequality by ≤ 1 per edge
      expect(new Set(ma.tour).size).toBe(c.D.length)
    }
  })
})