import { describe, expect, it } from 'vitest'
import { dijkstraImpl, fractionalKnapsack, freqsFromText, huffman, kruskal, mstGraph, prim } from './greedy'
import { allParenthesizations, binomialCalls, binomialDP, knapsack01, lcs, matrixChain } from './dp'
import { presets, randomGraph } from '../unit3/graphs'
import { dijkstra } from '../unit3/algos'

describe('greedy', () => {
  it('Kruskal and Prim both find the textbook MST weight 37 with 8 edges', () => {
    const k = kruskal(mstGraph), p = prim(mstGraph)
    expect(k.total).toBe(37); expect(p.total).toBe(37); expect(k.edges).toHaveLength(8); expect(p.edges).toHaveLength(8)
  })
  it('Kruskal = Prim on random connected graphs', () => {
    for (let i = 0; i < 15; i++) { const g = { ...randomGraph(10, 20, 40 + i, false, true) }; expect(kruskal(g).total).toBe(prim(g).total) }
  })
  it('array and heap Dijkstra agree with the Unit 3 Dijkstra', () => {
    for (let i = 0; i < 10; i++) { const g = randomGraph(12, 30, 70 + i, true, true), ref = dijkstra(g, 0).dist; expect(dijkstraImpl(g, 0, 'array', false).dist).toEqual(ref); expect(dijkstraImpl(g, 0, 'heap', false).dist).toEqual(ref) }
    expect(dijkstraImpl(presets.dijkstra, 0, 'heap').dist).toEqual([0, 8, 9, 5, 7])
  })
  it('heap needs fewer operations than the array on a sparse graph', () => {
    const sparse = randomGraph(200, 600, 5, true, true)
    expect(dijkstraImpl(sparse, 0, 'heap', false).ops).toBeLessThan(dijkstraImpl(sparse, 0, 'array', false).ops)
  })
  it('worst-case bounds cross: heap better when sparse, array better when dense', () => {
    const V = 100, arr = (E: number) => V * V + E, heap = (E: number) => (V + E) * Math.log2(V)
    expect(heap(3 * V)).toBeLessThan(arr(3 * V)); expect(arr(V * (V - 1))).toBeLessThan(heap(V * (V - 1)))
  })
  it('fractional knapsack: textbook 240 by ratio, other rules worse', () => {
    const items = [{ name: 'Item 1', w: 10, v: 60 }, { name: 'Item 2', w: 20, v: 100 }, { name: 'Item 3', w: 30, v: 120 }]
    expect(fractionalKnapsack(items, 50).value).toBe(240)
    expect(fractionalKnapsack(items, 50, 'value').value).toBeLessThan(240)
    expect(fractionalKnapsack(items, 50, 'weight').value).toBeLessThanOrEqual(240)
    const items2 = [{ name: 'A', w: 5, v: 10 }, { name: 'B', w: 10, v: 60 }, { name: 'C', w: 20, v: 80 }]
    expect(fractionalKnapsack(items2, 20, 'weight').value).toBeLessThan(fractionalKnapsack(items2, 20).value)
  })
  it('Huffman: textbook frequencies cost 224 bits, prefix-free codes', () => {
    const r = huffman([['a', 45], ['b', 13], ['c', 12], ['d', 16], ['e', 9], ['f', 5]])
    expect(r.total).toBe(224); expect(r.fixedTotal).toBe(300)
    expect(Object.values(r.codes).map(c => c.length).sort()).toEqual([1, 3, 3, 3, 4, 4])
    const cs = Object.values(r.codes); for (const a of cs) for (const b of cs) if (a !== b) expect(b.startsWith(a)).toBe(false)
    expect(freqsFromText('ABRACADABRA')).toEqual([['A', 5], ['B', 2], ['R', 2], ['C', 1], ['D', 1]])
  })
})

describe('dynamic programming', () => {
  it('binomial coefficients', () => { expect(binomialDP(10, 4).value).toBe(210); expect(binomialDP(20, 10).value).toBe(184756); expect(binomialCalls(5, 2).calls).toBe(2 * 10 - 1) })
  it('matrix chain: textbook dimensions give 15125 and ((A1(A2A3))((A4A5)A6))', () => {
    const p = [30, 35, 15, 5, 10, 20, 25], r = matrixChain(p)
    expect(r.cost).toBe(15125); expect(r.order).toBe('((A1(A2A3))((A4A5)A6))')
    const all = allParenthesizations(p); expect(all).toHaveLength(42); expect(Math.min(...all.map(a => a.cost))).toBe(15125)
  })
  it('LCS: textbook strings give BCBA (length 4)', () => { const r = lcs('ABCBDAB', 'BDCABA'); expect(r.length).toBe(4); expect(r.lcs).toBe('BCBA') })
  it('LCS length equals brute force on small strings', () => {
    const brute = (x: string, y: string) => { let best = 0; for (let mask = 0; mask < 1 << x.length; mask++) { const sub = [...x].filter((_, i) => mask >> i & 1).join(''); let j = 0; for (const ch of y) if (j < sub.length && sub[j] === ch) j++; if (j === sub.length) best = Math.max(best, sub.length) } return best }
    for (const [a, b] of [['AGGTAB', 'GXTXAYB'], ['ABC', 'DEF'], ['AAAA', 'AA'], ['XMJYAUZ', 'MZJAWXU']]) expect(lcs(a, b).length).toBe(brute(a, b))
  })
  it('0/1 knapsack: 45 for the lab items, matches brute force', () => {
    const items = [{ name: 'Item 1', w: 2, v: 12 }, { name: 'Item 2', w: 3, v: 20 }, { name: 'Item 3', w: 4, v: 24 }, { name: 'Item 4', w: 5, v: 25 }]
    const r = knapsack01(items, 8); expect(r.value).toBe(45); expect(r.chosen).toEqual([1, 3])
    for (let W = 0; W <= 14; W++) { let best = 0; for (let m = 0; m < 16; m++) { const s = items.filter((_, i) => m >> i & 1); if (s.reduce((a, x) => a + x.w, 0) <= W) best = Math.max(best, s.reduce((a, x) => a + x.v, 0)) } expect(knapsack01(items, W).value).toBe(best) }
  })
})