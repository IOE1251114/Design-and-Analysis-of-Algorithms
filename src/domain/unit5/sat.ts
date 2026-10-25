/* Unit 5 — Boolean satisfiability: parsing, certificate checking, brute force, DPLL,
 * and the reduction CNF-SAT ≤p INDEPENDENT-SET. Variables are always tried in the order they first
 * appear and "true" before "false", so every run produces the same frames. */
import type { Graph } from '../unit3/graphs'

export interface Lit { v: number; neg: boolean }
export interface CNF { vars: string[]; clauses: Lit[][] }

/** Accepts e.g. "(a ∨ ¬b ∨ c) ∧ (¬a ∨ b)", "(a | ~b) & (b | c)" or one clause per line. */
export function parseCNF(text: string): { cnf?: CNF; error?: string } {
  const vars: string[] = []
  const parts = text.replace(/\)\s*\(/g, ')&(').split(/∧|&|\n|;/).map(s => s.trim()).filter(Boolean)
  if (!parts.length) return { error: 'Type at least one clause.' }
  const clauses: Lit[][] = []
  for (const p of parts) {
    const body = p.replace(/[()]/g, '').trim()
    if (!body) return { error: 'Empty clause.' }
    const lits: Lit[] = []
    for (const raw of body.split(/∨|\||,|\s+v\s+|\bor\b/i).map(s => s.trim()).filter(Boolean)) {
      const m = raw.match(/^([¬~!-]*)\s*([A-Za-z][A-Za-z0-9]{0,2})$/)
      if (!m) return { error: `Cannot read the literal “${raw}”.` }
      const name = m[2].toLowerCase(); let v = vars.indexOf(name)
      if (v < 0) { if (vars.length >= 6) return { error: 'Use at most 6 different variables.' }; vars.push(name); v = vars.length - 1 }
      lits.push({ v, neg: m[1].length % 2 === 1 })
    }
    clauses.push(lits)
  }
  if (clauses.length > 10) return { error: 'Use at most 10 clauses.' }
  return { cnf: { vars, clauses } }
}

export const litStr = (cnf: CNF, l: Lit) => `${l.neg ? '¬' : ''}${cnf.vars[l.v]}`
export const clauseStr = (cnf: CNF, c: Lit[]) => `(${c.map(l => litStr(cnf, l)).join(' ∨ ')})`
export const cnfStr = (cnf: CNF) => cnf.clauses.map(c => clauseStr(cnf, c)).join(' ∧ ')

/** Value of a literal under a (possibly partial) assignment: true, false or null (unassigned). */
export const litVal = (l: Lit, a: (boolean | null)[]) => a[l.v] === null || a[l.v] === undefined ? null : a[l.v] !== l.neg
export type CState = 'sat' | 'unsat' | 'open'
export function clauseState(c: Lit[], a: (boolean | null)[]): CState {
  let open = false
  for (const l of c) { const v = litVal(l, a); if (v === true) return 'sat'; if (v === null) open = true }
  return open ? 'open' : 'unsat'
}
export const satisfies = (cnf: CNF, a: boolean[]) => cnf.clauses.every(c => clauseState(c, a) === 'sat')

/* ---------- Brute force: try all 2ⁿ assignments in binary order (row 0 = all true) ---------- */
export interface BFrame { row: number; assign: boolean[]; states: CState[]; ok: boolean; found: number; title: string; text: string }
export function bruteForceSAT(cnf: CNF) {
  const n = cnf.vars.length, frames: BFrame[] = []; let found = 0, first: boolean[] | null = null
  for (let r = 0; r < 2 ** n; r++) {
    const a = cnf.vars.map((_, i) => ((r >> (n - 1 - i)) & 1) === 0)
    const states = cnf.clauses.map(c => clauseState(c, a)), ok = states.every(s => s === 'sat')
    if (ok) { found++; if (!first) first = a }
    const bad = states.findIndex(s => s !== 'sat')
    frames.push({ row: r, assign: a, states, ok, found, title: `Row ${r + 1} of ${2 ** n}: ${cnf.vars.map((v, i) => `${v}=${a[i] ? 'T' : 'F'}`).join(', ')}`, text: ok ? 'Every clause has a true literal: this assignment is a certificate.' : `Clause ${bad + 1} ${clauseStr(cnf, cnf.clauses[bad])} has no true literal, so this row fails.` })
  }
  return { frames, count: found, solution: first, rows: 2 ** n }
}

/* ---------- DPLL: unit propagation + branching, drawn as a search tree ---------- */
export interface DNode { id: number; parent: number | null; label: string; kind: 'root' | 'decide' | 'unit'; status: 'open' | 'conflict' | 'sat' | 'done' }
export interface DFrame { nodes: DNode[]; cur: number; assign: (boolean | null)[]; states: CState[]; title: string; text: string }
export function dpll(cnf: CNF) {
  const n = cnf.vars.length, nodes: DNode[] = [], frames: DFrame[] = []
  let decisions = 0, units = 0
  const assign: (boolean | null)[] = Array(n).fill(null)
  const order: number[] = []; cnf.clauses.flat().forEach(l => { if (!order.includes(l.v)) order.push(l.v) })
  const add = (parent: number | null, label: string, kind: DNode['kind']) => { nodes.push({ id: nodes.length, parent, label, kind, status: 'open' }); return nodes.length - 1 }
  const snap = (cur: number, title: string, text: string) => frames.push({ nodes: nodes.map(x => ({ ...x })), cur, assign: [...assign], states: cnf.clauses.map(c => clauseState(c, assign)), title, text })
  const root = add(null, 'start', 'root')
  snap(root, 'Start with nothing assigned', 'DPLL alternates two moves: forced assignments from unit clauses, and a guess (branch) when nothing is forced.')
  const solve = (at: number): boolean => {
    const trail: number[] = []
    let node = at
    for (;;) {
      const st = cnf.clauses.map(c => clauseState(c, assign))
      const bad = st.indexOf('unsat')
      if (bad >= 0) { nodes[node].status = 'conflict'; snap(node, `Conflict: clause ${bad + 1} is false`, `${clauseStr(cnf, cnf.clauses[bad])} has every literal false. Undo back to the last guess.`); trail.forEach(v => { assign[v] = null }); return false }
      if (st.every(s => s === 'sat')) { nodes[node].status = 'sat'; snap(node, 'Every clause is satisfied', 'A satisfying assignment was found (unassigned variables can take any value).'); return true }
      const ui = cnf.clauses.findIndex((c, i) => st[i] === 'open' && c.filter(l => litVal(l, assign) === null).length === 1)
      if (ui < 0) break
      const l = cnf.clauses[ui].find(x => litVal(x, assign) === null)!
      assign[l.v] = !l.neg; trail.push(l.v); units++
      node = add(node, `${cnf.vars[l.v]}=${l.neg ? 'F' : 'T'}`, 'unit')
      snap(node, `Unit clause ${ui + 1} forces ${cnf.vars[l.v]} = ${l.neg ? 'false' : 'true'}`, `In ${clauseStr(cnf, cnf.clauses[ui])} every other literal is false, so ${litStr(cnf, l)} must be true.`)
    }
    const v = order.find(x => assign[x] === null)!
    for (const val of [true, false]) {
      assign[v] = val; decisions++
      const child = add(node, `${cnf.vars[v]}=${val ? 'T' : 'F'}`, 'decide')
      snap(child, `Guess ${cnf.vars[v]} = ${val ? 'true' : 'false'}`, val ? `No clause forces anything, so branch on ${cnf.vars[v]}, trying true first.` : `The true branch failed, so try ${cnf.vars[v]} = false.`)
      if (solve(child)) return true
      assign[v] = null
    }
    nodes[node].status = nodes[node].status === 'open' ? 'done' : nodes[node].status
    trail.forEach(x => { assign[x] = null })
    return false
  }
  const ok = solve(root)
  const final = [...assign]
  snap(ok ? frames[frames.length - 1].cur : root, ok ? 'Satisfiable' : 'Unsatisfiable', ok ? `${decisions} guesses and ${units} forced assignments, against ${2 ** n} rows for brute force.` : `Every branch ended in a conflict: no assignment works. ${nodes.length - 1} tree nodes were explored, against ${2 ** n} rows for brute force.`)
  return { frames, sat: ok, assign: final, nodes: nodes.length, decisions, units }
}

/* ---------- Reduction CNF-SAT ≤p INDEPENDENT-SET (k = number of clauses) ---------- */
export interface RFrame { stage: number; title: string; text: string; vstate: ('unseen' | 'active' | 'done' | 'frontier' | 'bad')[]; estate: Record<string, 'tree' | 'back' | 'removed' | 'checked'>; pick?: number[] }
export function satToIS(cnf: CNF) {
  const occ: { c: number; i: number; l: Lit }[] = []
  cnf.clauses.forEach((cl, c) => cl.forEach((l, i) => occ.push({ c, i, l })))
  const m = cnf.clauses.length, pos: [number, number][] = []
  occ.forEach(o => {
    const cx = m === 1 ? 330 : 95 + (470 * o.c) / (m - 1), size = cnf.clauses[o.c].length
    if (size === 1) pos.push([cx, 175])
    else if (size === 2) pos.push([cx, o.i === 0 ? 95 : 255])
    else { const ang = -Math.PI / 2 + (2 * Math.PI * o.i) / size, r = Math.min(70, 210 / Math.max(m, 3) + 14); pos.push([cx + r * Math.cos(ang) * (m > 4 ? 0.75 : 1), 175 + 95 * Math.sin(ang)]) }
  })
  const edges: { u: number; v: number; w: number; kind: 'clause' | 'conflict' }[] = []
  occ.forEach((a, x) => occ.forEach((b, y) => {
    if (y <= x) return
    if (a.c === b.c) edges.push({ u: x, v: y, w: 1, kind: 'clause' })
    else if (a.l.v === b.l.v && a.l.neg !== b.l.neg) edges.push({ u: x, v: y, w: 1, kind: 'conflict' })
  }))
  const g: Graph = { labels: occ.map(o => litStr(cnf, o.l)), pos, edges: edges.map(({ u, v, w }) => ({ u, v, w })), directed: false, weighted: false }
  const key = (u: number, v: number) => `${Math.min(u, v)}-${Math.max(u, v)}`
  const frames: RFrame[] = []
  const vstate = occ.map(() => 'unseen' as RFrame['vstate'][number]), estate: RFrame['estate'] = {}
  edges.forEach(e => { estate[key(e.u, e.v)] = 'removed' })
  const snap = (stage: number, title: string, text: string, pick?: number[]) => frames.push({ stage, title, text, vstate: [...vstate], estate: { ...estate }, pick })
  snap(0, 'One vertex per literal occurrence', `${occ.length} literals in ${m} clauses give ${occ.length} vertices. The target size is k = ${m}, one per clause.`)
  for (let c = 0; c < m; c++) {
    occ.forEach((o, i) => { vstate[i] = o.c === c ? 'active' : vstate[i] === 'active' ? 'unseen' : vstate[i] })
    edges.filter(e => e.kind === 'clause' && occ[e.u].c === c).forEach(e => { estate[key(e.u, e.v)] = 'tree' })
    snap(1, `Clause ${c + 1}: join its literals`, `${clauseStr(cnf, cnf.clauses[c])}: edges inside a clause mean an independent set can take at most one literal from it.`)
  }
  occ.forEach((_, i) => { vstate[i] = 'unseen' })
  const conflicts = edges.filter(e => e.kind === 'conflict')
  conflicts.forEach(e => { estate[key(e.u, e.v)] = 'back' })
  snap(2, `Add ${conflicts.length} conflict edges`, 'Join every x to every ¬x in another clause, so the set can never make a variable both true and false.')
  // largest independent set by brute force (graphs here have ≤ 30 vertices but few clauses)
  const adj = occ.map(() => new Set<number>()); edges.forEach(e => { adj[e.u].add(e.v); adj[e.v].add(e.u) })
  const best = maxIndependentSet(occ.length, adj, occ.map(o => o.c), m)
  const isSat = best.length === m
  best.forEach(i => { vstate[i] = 'done' })
  if (isSat) {
    const a: (boolean | null)[] = cnf.vars.map(() => null); best.forEach(i => { a[occ[i].l.v] = !occ[i].l.neg })
    snap(3, `Independent set of size k = ${m} found`, `Picked ${best.map(i => g.labels[i]).join(', ')}: one per clause and never x with ¬x. Making these literals true gives ${cnf.vars.map((v, i) => `${v}=${a[i] === null ? 'any' : a[i] ? 'T' : 'F'}`).join(', ')}, which satisfies the formula.`, best)
  } else snap(3, `Largest independent set has size ${best.length} < k = ${m}`, 'No independent set has one literal from every clause, which is exactly saying the formula is unsatisfiable. The yes/no answer is preserved.', best)
  return { g, frames, k: m, occ, kinds: edges.map(e => e.kind), best, isSat }
}

/** Exact maximum independent set by branching on one clause group at a time (each group is a clique). */
export function maxIndependentSet(n: number, adj: Set<number>[], group: number[], groups: number) {
  let best: number[] = []
  const go = (gi: number, chosen: number[]) => {
    if (chosen.length + (groups - gi) <= best.length) return
    if (gi === groups) { best = [...chosen]; return }
    for (let i = 0; i < n; i++) if (group[i] === gi && chosen.every(j => !adj[i].has(j))) go(gi + 1, [...chosen, i])
    go(gi + 1, chosen)
  }
  go(0, [])
  return best
}

export const satPresets: Record<string, { label: string; text: string }> = {
  small: { label: 'Satisfiable (3 variables)', text: '(a ∨ ¬b ∨ c) ∧ (¬a ∨ b ∨ c) ∧ (¬a ∨ ¬c) ∧ (b ∨ ¬c)' },
  unsat: { label: 'Unsatisfiable', text: '(a ∨ b) ∧ (a ∨ ¬b) ∧ (¬a ∨ b) ∧ (¬a ∨ ¬b)' },
  four: { label: '4 variables, needs search', text: '(a ∨ b ∨ c) ∧ (¬a ∨ ¬b) ∧ (¬b ∨ ¬c) ∧ (¬a ∨ ¬c) ∧ (¬a ∨ d) ∧ (¬d ∨ ¬c) ∧ (b ∨ ¬d)' },
}