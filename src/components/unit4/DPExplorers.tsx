import { useMemo, useState, type ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Cell as BarCell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CircleHelp, Grid3x3, Link2, Package, Triangle } from 'lucide-react'
import { allParenthesizations, binomialCalls, binomialDP, binomialTree, knapsack01, lcs, matrixChain, type Cell, type Item, type RNode } from '../../domain/unit4/dp'
import { fractionalKnapsack } from '../../domain/unit4/greedy'
import { Legend, PlayerBar, SERIES, Tabs, axis, compact, grid, tooltipStyle, usePlayer } from '../unit1/shared'

/* ---------- One table drawing for every DP topic ---------- */
const has = (list: Cell[] | undefined, i: number, j: number) => !!list?.some(c => c.i === i && c.j === j)
function DPGrid({ rows, cols, cell, cur, deps, path, corner, rowHead = 'i', colHead = 'j', caption }: {
  rows: { key: number; label: ReactNode }[]; cols: { key: number; label: ReactNode }[]
  cell: (i: number, j: number) => { v: ReactNode; na?: boolean; arrow?: string; take?: boolean }
  cur?: Cell; deps?: Cell[]; path?: Cell[]; corner?: ReactNode; rowHead?: string; colHead?: string; caption?: string
}) {
  return <div className="u4-grid-wrap">{caption && <span className="u1-label" style={{ marginTop: 0 }}>{caption}</span>}
    <table className="u4-grid"><thead><tr><th className="corner">{corner ?? <><i>{rowHead}</i>╲<i>{colHead}</i></>}</th>{cols.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
      <tbody>{rows.map(r => <tr key={r.key}><th>{r.label}</th>{cols.map(c => {
        const x = cell(r.key, c.key)
        const cls = x.na ? 'na' : [cur && cur.i === r.key && cur.j === c.key ? 'cur' : '', has(deps, r.key, c.key) ? 'dep' : '', has(path, r.key, c.key) ? 'path' : '', x.v === null || x.v === '' ? 'empty' : '', x.take ? 'take' : ''].join(' ')
        return <td key={c.key} className={cls}>{!x.na && <>{x.arrow && <i>{x.arrow}</i>}<b>{x.v}</b></>}</td>
      })}</tr>)}</tbody></table></div>
}
const GridLegend = ({ extra = [] }: { extra?: { id: string; label: string; color: string }[] }) => <Legend items={[{ id: 'c', label: 'Cell being filled', color: '#67d9ff' }, { id: 'd', label: 'Cells it reads', color: '#f4c56a' }, ...extra]}/>

/* ---------- Binomial coefficient ---------- */
/** C(n, k) by the multiplicative formula, so the chart never runs the exponential recursion itself. */
const choose = (n: number, k: number) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r) }
export function BinomialExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [n, setN] = useState(6), [k, setK] = useState(3)
  const kk = Math.min(k, n)
  const run = useMemo(() => binomialDP(n, kk), [n, kk])
  const p = usePlayer(run.frames.length, `${n}-${kk}`, onSteps)
  const f = run.frames[p.step]
  const [tn, setTn] = useState('5,2')
  const [ta, tb] = tn.split(',').map(Number)
  const tree = useMemo(() => binomialTree(ta, tb), [tn])
  const tc = binomialCalls(ta, tb)
  const chart = useMemo(() => Array.from({ length: 29 }, (_, i) => { const m = i + 2, h = Math.floor(m / 2); let cells = 0; for (let r = 0; r <= m; r++) cells += Math.min(r, h) + 1; return { n: m, naive: 2 * choose(m, h) - 1, dp: cells } }), [])
  return <>
    <section className="panel">
      <div className="panel-heading"><div><span className="kicker">BINOMIAL COEFFICIENT</span><h2>C(n, k) by filling Pascal’s triangle</h2><p>C(n, k) counts the ways to choose k items from n. It obeys C(n, k) = C(n−1, k−1) + C(n−1, k): either item n is chosen or it is not. Plain recursion recomputes the same sub-answers again and again; dynamic programming stores each one once in a table.</p></div><span className="panel-icon"><Triangle size={19}/></span></div>
      <div className="u2-input">
        <label className="u1-select">n<select value={n} onChange={e => setN(Number(e.target.value))}>{Array.from({ length: 11 }, (_, i) => i + 2).map(v => <option key={v}>{v}</option>)}</select></label>
        <label className="u1-select">k<select value={kk} onChange={e => setK(Number(e.target.value))}>{Array.from({ length: n + 1 }, (_, i) => i).map(v => <option key={v}>{v}</option>)}</select></label>
        <span>C({n}, {kk}) = {run.value}</span>
      </div>
      <GridLegend/>
      <DPGrid rows={f.table.map((_, i) => ({ key: i, label: i }))} cols={Array.from({ length: kk + 1 }, (_, j) => ({ key: j, label: j }))} rowHead="n" colHead="k"
        cell={(i, j) => j > i ? { v: '', na: true } : { v: f.table[i][j] }} cur={f.cur} deps={f.deps}/>
      <div className="stage-explanation"><strong>{f.title}</strong><p>{f.text}</p></div>
      <PlayerBar p={p}/>
    </section>
    <section className="panel u1-gap">
      <div className="panel-heading"><div><span className="kicker">WHY A TABLE: OVERLAPPING SUBPROBLEMS</span><h2>The plain recursion repeats itself</h2><p>Every highlighted node is a sub-problem that is solved more than once. Dynamic programming solves each distinct one exactly once.</p></div></div>
      <Tabs value={tn} onChange={setTn} options={[{ id: '4,2', label: 'C(4, 2)' }, { id: '5,2', label: 'C(5, 2)' }, { id: '6,3', label: 'C(6, 3)' }]}/>
      <Legend items={[{ id: 'u', label: 'Computed once', color: SERIES[0] }, { id: 'r', label: 'Repeated sub-problem', color: SERIES[5] }]}/>
      <RecTree root={tree}/>
      <div className="u2-stats"><div><small>CALLS (PLAIN RECURSION)</small><strong>{tc.calls}</strong><span>always 2·C(n, k) − 1</span></div><div><small>DISTINCT SUB-PROBLEMS</small><strong>{tc.distinct}</strong><span>what DP actually computes</span></div><div><small>WASTED CALLS</small><strong>{tc.calls - tc.distinct}</strong></div></div>
      <span className="u1-label">WORK FOR C(n, ⌊n/2⌋): PLAIN RECURSION VS TABLE (LOG SCALE)</span>
      <Legend items={[{ id: 'a', label: 'Recursive calls 2·C(n, k) − 1', color: SERIES[5] }, { id: 'b', label: 'Table cells Θ(nk)', color: SERIES[2] }]}/>
      <div className="u1-chart" style={{ height: 230 }}><ResponsiveContainer width="100%" height="100%">
        <LineChart data={chart} margin={{ top: 10, right: 16, bottom: 6, left: 0 }}>
          <CartesianGrid {...grid}/><XAxis dataKey="n" {...axis}/><YAxis scale="log" domain={[1, 'auto']} {...axis} width={48} tickFormatter={compact} allowDataOverflow/>
          <Tooltip {...tooltipStyle} labelFormatter={v => `n = ${v}, k = ${Math.floor(Number(v) / 2)}`} formatter={(v: number, k: string) => [compact(v), k === 'naive' ? 'Recursive calls' : 'Table cells']}/>
          <Line dataKey="naive" stroke={SERIES[5]} strokeWidth={2.2} dot={false} isAnimationActive={false}/>
          <Line dataKey="dp" stroke={SERIES[2]} strokeWidth={2.2} dot={false} isAnimationActive={false}/>
        </LineChart></ResponsiveContainer></div>
      <div className="callout"><CircleHelp size={16}/><p>The two DP ingredients are both present: <b>optimal substructure</b> (the answer is built from answers to smaller instances) and <b>overlapping subproblems</b> (the same smaller instances recur). Memoisation (top-down) and tabulation (bottom-up) both bring the cost down to Θ(nk).</p></div>
    </section>
  </>
}
function RecTree({ root }: { root: RNode }) {
  type P = { t: RNode; x: number; y: number }
  const nodes: P[] = [], links: [P, P][] = []; let slot = 0
  const lay = (t: RNode, d: number): P => {
    const kids = t.kids.map(c => lay(c, d + 1))
    const me: P = { t, y: 22 + d * 52, x: kids.length ? (kids[0].x + kids[kids.length - 1].x) / 2 : 28 + slot++ * 50 }
    kids.forEach(k => links.push([me, k])); nodes.push(me); return me
  }
  lay(root, 0)
  const W = slot * 50 + 6, H = Math.max(...nodes.map(o => o.y)) + 24
  return <div className="u1-tree-scroll"><svg viewBox={`0 0 ${W} ${H}`} width={W > 640 ? W : undefined} className="u1-svg" style={W > 640 ? undefined : { maxWidth: W * 1.3 }} role="img" aria-label="Recursion tree of the binomial coefficient">
    {links.map(([a, c], i) => <line key={i} x1={a.x} y1={a.y + 12} x2={c.x} y2={c.y - 12} stroke="#2f4560"/>)}
    {nodes.map((o, i) => <g key={`n${i}`}><rect x={o.x - 23} y={o.y - 12} width={46} height={24} rx={6} fill={o.t.dup ? '#2a1520' : '#13273a'} stroke={o.t.dup ? SERIES[5] : SERIES[0]} strokeWidth={1.4}/><text x={o.x} y={o.y + 4} fontSize="10" textAnchor="middle" fill="#f0f8ff">C({o.t.a},{o.t.b})</text></g>)}
  </svg></div>
}

/* ---------- Matrix-chain multiplication ---------- */
const mcPresets: Record<string, { label: string; p: number[] }> = {
  clrs: { label: 'Textbook: 6 matrices', p: [30, 35, 15, 5, 10, 20, 25] },
  three: { label: '3 matrices', p: [10, 30, 5, 60] },
  four: { label: '4 matrices', p: [5, 10, 3, 12, 5] },
}
export function MatrixChainExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [pid, setPid] = useState('clrs')
  const [txt, setTxt] = useState(mcPresets.clrs.p.join(', '))
  const parsed = txt.split(/[\s,]+/).filter(Boolean).map(Number)
  const valid = parsed.length >= 3 && parsed.length <= 8 && parsed.every(x => Number.isInteger(x) && x >= 1 && x <= 99)
  const [p, setP] = useState(mcPresets.clrs.p)
  const run = useMemo(() => matrixChain(p), [p.join()])
  const pl = usePlayer(run.frames.length, p.join(), onSteps)
  const f = run.frames[pl.step]
  const n = p.length - 1
  const all = useMemo(() => allParenthesizations(p).sort((a, b) => a.cost - b.cost), [p.join()])
  const worst = all[all.length - 1]
  const idx = Array.from({ length: n }, (_, i) => i + 1)
  return <>
    <section className="panel">
      <div className="panel-heading"><div><span className="kicker">MATRIX CHAIN MULTIPLICATION</span><h2>Where to put the brackets</h2><p>Multiplying a p×q matrix by a q×r matrix costs p·q·r scalar multiplications. The product A₁A₂…Aₙ gives the same answer however it is bracketed, but the cost can differ enormously. m[i][j] is the cheapest cost for Aᵢ…Aⱼ; the table is filled by chain length, so every sub-chain is ready before it is needed.</p></div><span className="panel-icon"><Link2 size={19}/></span></div>
      <div className="u1-controls"><Tabs value={pid} onChange={v => { setPid(v); setP(mcPresets[v].p); setTxt(mcPresets[v].p.join(', ')) }} options={Object.entries(mcPresets).map(([k, v]) => ({ id: k, label: v.label }))}/></div>
      <div className="u2-input"><label>Dimensions p₀, p₁, …, pₙ (3 to 8 numbers, each 1–99)<input value={txt} onChange={e => setTxt(e.target.value)}/></label><button className="btn btn-secondary" disabled={!valid} onClick={() => { setPid(''); setP(parsed) }}>Use these</button></div>
      <div className="u4-dims">{idx.map(i => <span key={i}><b>A{i}</b>{p[i - 1]}×{p[i]}</span>)}</div>
      <GridLegend extra={[{ id: 'o', label: 'Split chosen for this cell', color: '#1aab80' }]}/>
      <div className="u4-two">
        <DPGrid caption="m[i][j]: MINIMUM COST OF Aᵢ…Aⱼ" rows={idx.map(i => ({ key: i, label: i }))} cols={idx.map(j => ({ key: j, label: j }))} cell={(i, j) => j < i ? { v: '', na: true } : { v: f.table[i][j] === null ? "" : f.table[i][j]!.toLocaleString() }} cur={f.cur} deps={f.deps}/>
        <DPGrid caption="s[i][j]: BEST SPLIT k" rows={idx.map(i => ({ key: i, label: i }))} cols={idx.map(j => ({ key: j, label: j }))} cell={(i, j) => j <= i ? { v: '', na: true } : { v: f.s[i][j] ?? '' }} cur={f.cur}/>
      </div>
      {f.tries && <div className="u4-tries">{f.tries.map(t => <span key={t.k} className={f.s[f.cur!.i][f.cur!.j] === t.k ? 'best' : ''}>k = {t.k}<b>{t.cost.toLocaleString()}</b></span>)}</div>}
      <div className="stage-explanation"><strong>{f.title}</strong><p>{f.text}</p></div>
      <PlayerBar p={pl}/>
      <div className="u2-stats"><div><small>OPTIMAL ORDER</small><strong className="u2-mono">{run.order}</strong></div><div><small>OPTIMAL COST</small><strong>{run.cost.toLocaleString()}</strong></div><div><small>WORST ORDER COSTS</small><strong>{worst.cost.toLocaleString()}</strong><span>{(worst.cost / Math.max(1, run.cost)).toFixed(1)}× more</span></div></div>
    </section>
    <section className="panel u1-gap">
      <div className="panel-heading"><div><span className="kicker">WHY NOT TRY THEM ALL</span><h2>All {all.length} ways to bracket {n} matrices</h2><p>The number of bracketings is the Catalan number C(n−1), which grows like 4ⁿ. The bars are sorted by cost; green is the one DP finds in Θ(n³).</p></div></div>
      <div className="u1-chart" style={{ height: 230 }}><ResponsiveContainer width="100%" height="100%">
        <BarChart data={all.map((a, i) => ({ ...a, i }))} margin={{ top: 10, right: 12, bottom: 6, left: 0 }}>
          <CartesianGrid {...grid}/><XAxis dataKey="i" {...axis} tick={false} label={{ value: 'bracketings, cheapest to dearest', fill: '#8498ae', fontSize: 10, position: 'insideBottom', offset: -2 }}/><YAxis {...axis} width={52} tickFormatter={compact}/>
          <Tooltip {...tooltipStyle} cursor={{ fill: '#ffffff10' }} labelFormatter={() => ''} formatter={(v: number, _k: string, item: { payload?: { str: string } }) => [v.toLocaleString(), item.payload?.str ?? '']}/>
          <Bar dataKey="cost" isAnimationActive={false}>{all.map((a, i) => <BarCell key={i} fill={a.cost === run.cost ? SERIES[2] : SERIES[0]} fillOpacity={a.cost === run.cost ? 1 : 0.55}/>)}</Bar>
        </BarChart></ResponsiveContainer></div>
      <div className="callout"><CircleHelp size={16}/><p>Optimal substructure: if the best bracketing of Aᵢ…Aⱼ splits at k, then its two halves Aᵢ…Aₖ and Aₖ₊₁…Aⱼ must themselves be bracketed optimally. Otherwise swapping in a cheaper half would give a cheaper whole. There are Θ(n²) cells and each tries up to n splits: Θ(n³) time, Θ(n²) space.</p></div>
    </section>
  </>
}

/* ---------- Longest common subsequence ---------- */
const lcsPresets: Record<string, [string, string]> = { clrs: ['ABCBDAB', 'BDCABA'], dna: ['ACCGGTCG', 'GTCGTTCG'], words: ['DYNAMIC', 'PROGRAM'] }
export function LCSExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [x, setX] = useState('ABCBDAB'), [y, setY] = useState('BDCABA')
  const X = x.toUpperCase().replace(/\s/g, '').slice(0, 10) || 'A', Y = y.toUpperCase().replace(/\s/g, '').slice(0, 10) || 'A'
  const run = useMemo(() => lcs(X, Y), [X, Y])
  const p = usePlayer(run.frames.length, `${X}|${Y}`, onSteps)
  const f = run.frames[p.step]
  const onPath = new Set((f.path ?? []).filter(c => f.arrows[c.i][c.j] === '↖').map(c => c.i))
  const onPathY = new Set((f.path ?? []).filter(c => f.arrows[c.i][c.j] === '↖').map(c => c.j))
  return <section className="panel">
    <div className="panel-heading"><div><span className="kicker">LONGEST COMMON SUBSEQUENCE</span><h2>The longest sequence hidden in both strings</h2><p>A subsequence keeps the order of characters but may skip some. c[i][j] is the LCS length of the first i characters of X and the first j of Y. If the last characters match, extend the diagonal; otherwise take the better of dropping one character from X or from Y. The arrows record which choice was made, so the LCS itself can be read back.</p></div><span className="panel-icon"><Grid3x3 size={19}/></span></div>
    <div className="u1-controls"><Tabs value={Object.entries(lcsPresets).find(([, v]) => v[0] === X && v[1] === Y)?.[0] ?? ''} onChange={v => { setX(lcsPresets[v][0]); setY(lcsPresets[v][1]) }} options={[{ id: 'clrs', label: 'Textbook' }, { id: 'dna', label: 'DNA strands' }, { id: 'words', label: 'Two words' }]}/></div>
    <div className="u2-input"><label>X (up to 10 letters)<input value={x} maxLength={10} onChange={e => setX(e.target.value)}/></label><label>Y (up to 10 letters)<input value={y} maxLength={10} onChange={e => setY(e.target.value)}/></label></div>
    <GridLegend extra={[{ id: 'p', label: 'Trace-back path', color: '#1aab80' }]}/>
    <DPGrid rows={Array.from({ length: X.length + 1 }, (_, i) => ({ key: i, label: i ? <><em>{i}</em>{X[i - 1]}</> : <em>0</em> }))} cols={Array.from({ length: Y.length + 1 }, (_, j) => ({ key: j, label: j ? <><em>{j}</em>{Y[j - 1]}</> : <em>0</em> }))}
      corner={<><i>X</i>╲<i>Y</i></>} cell={(i, j) => ({ v: f.table[i][j] ?? '', arrow: f.arrows[i][j] || undefined, take: has(f.path, i, j) && f.arrows[i][j] === '↖' })} cur={f.cur} deps={f.deps} path={f.path}/>
    <div className="u4-strings"><div><small>X</small>{[...X].map((ch, i) => <span key={i} className={onPath.has(i + 1) ? 'on' : ''}>{ch}</span>)}</div><div><small>Y</small>{[...Y].map((ch, j) => <span key={j} className={onPathY.has(j + 1) ? 'on' : ''}>{ch}</span>)}</div></div>
    <div className="stage-explanation"><strong>{f.title}</strong><p>{f.text}</p></div>
    <PlayerBar p={p}/>
    <div className="u2-stats"><div><small>LCS</small><strong className="u2-mono">{run.lcs || '(empty)'}</strong></div><div><small>LENGTH</small><strong>{run.length}</strong></div><div><small>TABLE</small><strong>{(X.length + 1) * (Y.length + 1)} cells</strong><span>brute force would test 2^{X.length} = {2 ** X.length} subsequences of X</span></div></div>
    <div className="callout"><CircleHelp size={16}/><p>Used in <code>diff</code> and version control (which lines stayed the same), in DNA alignment, and in plagiarism checks. When there are ties, different arrow choices can give a different LCS of the same length.</p></div>
  </section>
}

/* ---------- 0/1 knapsack ---------- */
const z1Presets: Record<string, { label: string; items: Item[]; W: number }> = {
  std: { label: '4 items, W = 8', W: 8, items: [{ name: 'I1', w: 2, v: 12 }, { name: 'I2', w: 3, v: 20 }, { name: 'I3', w: 4, v: 24 }, { name: 'I4', w: 5, v: 25 }] },
  clrs: { label: 'Textbook: greedy fails', W: 5, items: [{ name: 'I1', w: 1, v: 6 }, { name: 'I2', w: 2, v: 10 }, { name: 'I3', w: 3, v: 12 }] },
}
export function KnapsackDPExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [pid, setPid] = useState('std')
  const P = z1Presets[pid]
  const [W, setW] = useState(P.W)
  const run = useMemo(() => knapsack01(P.items, W), [pid, W])
  const p = usePlayer(run.frames.length, `${pid}-${W}`, onSteps)
  const f = run.frames[p.step]
  const greedy = (() => { let room = W, v = 0; [...P.items].sort((a, b) => b.v / b.w - a.v / a.w).forEach(it => { if (it.w <= room) { room -= it.w; v += it.v } }); return v })()
  const frac = fractionalKnapsack(P.items, W).value
  const maxV = Math.max(frac, run.value, 1)
  return <section className="panel">
    <div className="panel-heading"><div><span className="kicker">0/1 KNAPSACK</span><h2>Take an item whole or leave it</h2><p>K[i][w] is the best value using only the first i items with capacity w. For each item there are two choices: skip it (K[i−1][w]) or take it (vᵢ + K[i−1][w − wᵢ]). The table is filled row by row; tracing back from K[n][W] reveals which items were taken.</p></div><span className="panel-icon"><Package size={19}/></span></div>
    <div className="u1-controls"><Tabs value={pid} onChange={v => { setPid(v); setW(z1Presets[v].W) }} options={Object.entries(z1Presets).map(([k, v]) => ({ id: k, label: v.label }))}/></div>
    <div className="input-row"><label>Capacity W <strong>{W}</strong></label><input type="range" min={1} max={12} value={W} onChange={e => setW(Number(e.target.value))}/></div>
    <div className="item-table"><div className="item-row item-header"><span>Item</span><span>Weight</span><span>Value</span><span>In the answer</span></div>
      {P.items.map((it, i) => <div className={`item-row ${f.cur?.i === i + 1 ? 'selected-edge' : ''}`} key={it.name}><span>{it.name}</span><span>{it.w}</span><span>{it.v}</span><span>{!f.path || i + 1 < Math.min(...f.path.map(c => c.i)) ? '…' : f.chosen?.includes(i) ? 'taken' : 'left out'}</span></div>)}</div>
    <GridLegend extra={[{ id: 't', label: 'Item taken here (trace-back)', color: '#1aab80' }]}/>
    <DPGrid rows={f.table.map((_, i) => ({ key: i, label: i ? <><em>{i}</em>{P.items[i - 1].name}</> : <em>0</em> }))} cols={Array.from({ length: W + 1 }, (_, j) => ({ key: j, label: j }))} rowHead="i" colHead="w"
      cell={(i, j) => ({ v: f.table[i][j] ?? '', take: has(f.path, i, j) && i > 0 && f.table[i][j] !== f.table[i - 1][j] })} cur={f.cur} deps={f.deps} path={f.path}/>
    <div className="stage-explanation"><strong>{f.title}</strong><p>{f.text}</p></div>
    <PlayerBar p={p}/>
    <span className="u1-label">SAME ITEMS, THREE APPROACHES (capacity {W})</span>
    <div className="u1-strat-bars u4-bars">
      <div><span>Greedy by value/weight, whole items only</span><i><b style={{ width: `${(greedy / maxV) * 100}%`, background: SERIES[3] }}/></i><em>{greedy}{greedy < run.value ? ' (not optimal)' : ''}</em></div>
      <div className="on"><span>Dynamic programming (optimal 0/1)</span><i><b style={{ width: `${(run.value / maxV) * 100}%`, background: SERIES[2] }}/></i><em>{run.value}</em></div>
      <div><span>Fractional (items may be cut)</span><i><b style={{ width: `${(frac / maxV) * 100}%`, background: SERIES[4] }}/></i><em>{+frac.toFixed(2)} (upper bound)</em></div>
    </div>
    <div className="callout"><CircleHelp size={16}/><p>The greedy rule that is optimal for the fractional problem fails here, because a high-ratio item can waste capacity that a better combination would have used. DP considers both choices for every item and every capacity: Θ(nW) time. That is <b>pseudo-polynomial</b>: W written in binary has only log W bits, so the running time is exponential in the input size. 0/1 knapsack is NP-hard in general (Unit V).</p></div>
  </section>
}