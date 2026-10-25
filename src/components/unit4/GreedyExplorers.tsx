import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Binary, CircleHelp, Gauge, Scale, Waypoints } from 'lucide-react'
import { dijkstraImpl, fractionalKnapsack, freqsFromText, huffman, kruskal, mstGraph, prim, type HNode, type KItem, type KRule } from '../../domain/unit4/greedy'
import { knapsack01 } from '../../domain/unit4/dp'
import { presets } from '../../domain/unit3/graphs'
import { Legend, PlayerBar, SERIES, Tabs, axis, compact, grid, tooltipStyle, usePlayer } from '../unit1/shared'
import { DSPanel, ECOL, GraphView, VCOL } from '../unit3/GraphView'
import { Cells } from '../unit2/views'

/* ---------- Minimum spanning trees ---------- */
export function MSTExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [algo, setAlgo] = useState<'kruskal' | 'prim'>('kruskal')
  const [s, setS] = useState(0)
  const g = mstGraph
  const run = useMemo(() => algo === 'kruskal' ? kruskal(g) : prim(g, s), [algo, s])
  const p = usePlayer(run.frames.length, `${algo}-${s}`, onSteps)
  const f = run.frames[p.step]
  const sorted = [...g.edges].sort((a, b) => a.w - b.w || a.u - b.u || a.v - b.v)
  return <section className="panel">
    <div className="panel-heading"><div><span className="kicker">MINIMUM SPANNING TREES</span><h2>Connect every vertex as cheaply as possible</h2><p>A spanning tree uses V − 1 edges to connect all V vertices without a cycle. Both algorithms are greedy: they repeatedly add the lightest edge that is safe. Kruskal grows a forest over the whole graph; Prim grows a single tree from one vertex.</p></div><span className="panel-icon"><Waypoints size={19}/></span></div>
    <div className="u1-controls">
      <Tabs value={algo} onChange={setAlgo} options={[{ id: 'kruskal', label: "Kruskal (sort edges + union-find)" }, { id: 'prim', label: "Prim (grow from a vertex)" }]}/>
      {algo === 'prim' && <label className="u1-select">start<select value={s} onChange={e => setS(Number(e.target.value))}>{g.labels.map((l, i) => <option key={l} value={i}>{l}</option>)}</select></label>}
    </div>
    <Legend items={[{ id: 't', label: 'MST edge', color: ECOL.tree.c }, ...(algo === 'kruskal' ? [{ id: 'x', label: 'Skipped: would form a cycle', color: '#5d738b', dash: true }, { id: 'c', label: 'Vertex colour = its current set', color: SERIES[0] }] : [{ id: 'f', label: 'In priority queue (number = key)', color: VCOL.frontier.stroke }, { id: 'd', label: 'In the tree', color: VCOL.done.stroke }])]}/>
    <div className="u3-stage">
      <div className="u3-canvas"><GraphView g={g} f={f}/></div>
      <DSPanel ds={f.ds}/>
    </div>
    {algo === 'kruskal' && <div className="u4-edgeorder"><small>EDGES IN SORTED ORDER</small><div>{sorted.map((e, i) => { const k = `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`, st = f.estate[k]; return <span key={i} className={st === 'tree' ? 'take' : st === 'removed' ? 'skip' : f.focusEdge === k ? 'cur' : ''}>{g.labels[e.u]}{g.labels[e.v]}<b>{e.w}</b></span> })}</div></div>}
    <div className="stage-explanation"><strong>{f.title}</strong><p>{f.text}</p></div>
    <PlayerBar p={p}/>
    <div className="u2-stats">
      <div><small>EDGES CHOSEN</small><strong>{f.chosen} / {g.labels.length - 1}</strong></div>
      <div><small>TREE WEIGHT</small><strong>{f.total}</strong><span>optimum for this graph: 37</span></div>
      <div><small>TIME</small><strong className="u2-mono">{algo === 'kruskal' ? 'O(E log E): the sort dominates' : 'O(E log V) heap · O(V²) array'}</strong></div>
    </div>
    <div className="callout"><CircleHelp size={16}/><p><strong>Why greedy works here (cut property):</strong> split the vertices into any two groups. The lightest edge crossing between them belongs to some minimum spanning tree. Kruskal’s chosen edge is the lightest one joining two different trees, and Prim’s is the lightest one leaving its tree, so each is the lightest edge across some cut.</p></div>
  </section>
}

/* ---------- Dijkstra with an array vs a binary heap ---------- */
export function DijkstraImplExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [impl, setImpl] = useState<'array' | 'heap'>('array')
  const g = presets.dijkstra
  const run = useMemo(() => dijkstraImpl(g, 0, impl), [impl])
  const other = useMemo(() => dijkstraImpl(g, 0, impl === 'array' ? 'heap' : 'array', false).ops, [impl])
  const p = usePlayer(run.frames.length, impl, onSteps)
  const f = run.frames[p.step]
  const frame = { vstate: g.labels.map((_, i) => i === f.current ? 'active' as const : f.settled[i] ? 'done' as const : f.dist[i] < Infinity ? 'frontier' as const : 'unseen' as const), under: f.dist.map(d => d === Infinity ? '∞' : String(d)), estate: {} }
  const V = 100, chart = Array.from({ length: 61 }, (_, i) => { const E = Math.max(V, Math.round((V * (V - 1) * i) / 60)); return { E, array: V * V + E, heap: Math.round((V + E) * Math.log2(V)) } })
  const cross = Math.round((V * V - V * Math.log2(V)) / (Math.log2(V) - 1))
  return <>
    <section className="panel">
      <div className="panel-heading"><div><span className="kicker">DIJKSTRA: ARRAYS VS HEAPS</span><h2>Same algorithm, two priority queues</h2><p>Dijkstra is greedy: it always settles the closest unsettled vertex. How that “closest” vertex is found decides the running time. A plain array needs a full scan, but updating a distance is free. A binary heap finds the minimum quickly, but every update must sift the vertex up.</p></div><span className="panel-icon"><Gauge size={19}/></span></div>
      <Tabs value={impl} onChange={setImpl} options={[{ id: 'array', label: 'Array (linear scan)' }, { id: 'heap', label: 'Binary min-heap' }]}/>
      <div className="u4-split">
        <div className="u3-canvas"><GraphView g={g} f={frame} maxWidth={560}/></div>
        <div className="u4-pq">
          {impl === 'array'
            ? <Cells label="ARRAY d[v] (gold = examined in this step)" values={g.labels.map((l, i) => `${l}:${f.dist[i] === Infinity ? '∞' : f.dist[i]}`)} mark={f.scan} hi={f.current ?? null} dim={i => f.settled[i] && i !== f.current} sub={i => (f.settled[i] ? 'settled' : '')}/>
            : <MiniHeap heap={f.heap ?? []} labels={g.labels} touched={f.touched ?? []}/>}
          <div className="u2-stats" style={{ marginTop: 10 }}><div><small>BASIC OPERATIONS SO FAR</small><strong>{f.ops}</strong><span>the other version needs {other} in total</span></div></div>
        </div>
      </div>
      <div className="stage-explanation"><strong>{f.title}</strong><p>{f.text}</p></div>
      <PlayerBar p={p}/>
      <div className="u1-table-wrap u1-gap"><table className="u1-table">
        <thead><tr><th>Operation</th><th>How many times</th><th>Array</th><th>Binary heap</th></tr></thead>
        <tbody>
          <tr><td>Extract-min</td><td>V</td><td>Θ(V) scan</td><td>O(log V)</td></tr>
          <tr><td>Decrease-key</td><td>≤ E</td><td>Θ(1)</td><td>O(log V)</td></tr>
          <tr className="u2-row-on"><td>Total</td><td/><td>Θ(V² + E) = Θ(V²)</td><td>O((V + E) log V)</td></tr>
        </tbody>
      </table></div>
    </section>
    <section className="panel u1-gap">
      <div className="panel-heading"><div><span className="kicker">WHICH TO CHOOSE</span><h2>Worst-case work for V = 100 as the graph gets denser</h2><p>These curves are the textbook bounds, not measurements: array V² + E against heap (V + E)·log₂V.</p></div></div>
      <Legend items={[{ id: 'a', label: 'Array: V² + E', color: SERIES[1] }, { id: 'h', label: 'Binary heap: (V + E)·log₂ V', color: SERIES[0] }]}/>
      <div className="u1-chart" style={{ height: 240 }}><ResponsiveContainer width="100%" height="100%">
        <LineChart data={chart} margin={{ top: 10, right: 16, bottom: 6, left: 0 }}>
          <CartesianGrid {...grid}/><XAxis dataKey="E" type="number" domain={[100, 9900]} ticks={[100, 2000, 4000, 6000, 8000, 9900]} {...axis} tickFormatter={compact} label={{ value: 'E', position: 'insideBottomRight', offset: -2, fill: '#8498ae', fontSize: 10 }}/><YAxis {...axis} width={48} tickFormatter={compact}/>
          <Tooltip {...tooltipStyle} labelFormatter={v => `E = ${v}`} formatter={(v: number, k: string) => [compact(v), k === 'array' ? 'Array' : 'Heap']}/>
          <ReferenceLine x={cross} stroke="#f4c56a" strokeDasharray="4 3" label={{ value: `crossover E ≈ ${cross}`, fill: '#e7d3a6', fontSize: 10, position: 'insideTopRight' }}/>
          <Line dataKey="array" stroke={SERIES[1]} strokeWidth={2.2} dot={false} isAnimationActive={false}/>
          <Line dataKey="heap" stroke={SERIES[0]} strokeWidth={2.2} dot={false} isAnimationActive={false}/>
        </LineChart></ResponsiveContainer></div>
      <div className="callout"><CircleHelp size={16}/><p>Sparse graphs (E close to V, like road maps) favour the heap: about V log V instead of V². Dense graphs (E close to V²) favour the simple array, because then E·log V &gt; V². The crossover sits around E ≈ V² / log V.</p></div>
    </section>
  </>
}
function MiniHeap({ heap, labels, touched }: { heap: { v: number; d: number }[]; labels: string[]; touched: number[] }) {
  const W = 300, rowH = 50, levels = Math.max(1, Math.floor(Math.log2(Math.max(1, heap.length))) + 1)
  const pos = (i: number) => { const d = Math.floor(Math.log2(i + 1)), k = i - (2 ** d - 1); return { x: (W * (k + 0.5)) / 2 ** d, y: 22 + d * rowH } }
  return <div><small className="u1-label" style={{ marginTop: 0 }}>BINARY MIN-HEAP (vertex:distance)</small>
    {heap.length ? <svg viewBox={`0 0 ${W} ${levels * rowH + 8}`} className="u1-svg" style={{ maxWidth: 340 }} role="img" aria-label="Binary min-heap">
      {heap.map((_, i) => i > 0 && <line key={`e${i}`} x1={pos((i - 1) >> 1).x} y1={pos((i - 1) >> 1).y} x2={pos(i).x} y2={pos(i).y} stroke="#2f4560"/>)}
      {heap.map((h, i) => { const p = pos(i), t = touched.includes(i); return <g key={i}><rect x={p.x - 26} y={p.y - 13} width={52} height={26} rx={13} fill={t ? '#2a2412' : '#13273a'} stroke={t ? '#f4c56a' : SERIES[0]} strokeWidth={t ? 2.2 : 1.2}/><text x={p.x} y={p.y + 4} fontSize="11" textAnchor="middle" fill="#f0f8ff">{labels[h.v]}:{h.d === Infinity ? '∞' : h.d}</text></g> })}
    </svg> : <p className="u1-small">Empty: every vertex is settled.</p>}
    <Cells values={heap.map(h => `${labels[h.v]}:${h.d === Infinity ? '∞' : h.d}`)} mark={touched}/>
  </div>
}

/* ---------- Fractional knapsack ---------- */
const kPresets: Record<string, { label: string; items: KItem[]; cap: number }> = {
  clrs: { label: 'Textbook (3 items)', cap: 50, items: [{ name: 'Item 1', w: 10, v: 60 }, { name: 'Item 2', w: 20, v: 100 }, { name: 'Item 3', w: 30, v: 120 }] },
  five: { label: '5 items', cap: 60, items: [{ name: 'A', w: 5, v: 30 }, { name: 'B', w: 10, v: 40 }, { name: 'C', w: 15, v: 45 }, { name: 'D', w: 22, v: 77 }, { name: 'E', w: 25, v: 90 }] },
}
export function FractionalExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [pid, setPid] = useState('clrs')
  const [rule, setRule] = useState<KRule>('ratio')
  const P = kPresets[pid]
  const [cap, setCap] = useState(P.cap)
  const run = useMemo(() => fractionalKnapsack(P.items, cap, rule), [pid, cap, rule])
  const p = usePlayer(run.frames.length, `${pid}-${cap}-${rule}`, onSteps)
  const f = run.frames[p.step]
  const rules: KRule[] = ['ratio', 'value', 'weight']
  const compare = rules.map(r => ({ r, v: fractionalKnapsack(P.items, cap, r).value }))
  const zeroOne = knapsack01(P.items, cap).value
  const maxV = Math.max(...compare.map(c => c.v), zeroOne, 1)
  let x = 0
  return <section className="panel">
    <div className="panel-heading"><div><span className="kicker">FRACTIONAL KNAPSACK</span><h2>Fill the bag with the best value per kilogram first</h2><p>Items can be cut, so you may take any fraction of an item. Taking items in decreasing value/weight order is provably optimal; the other two “obvious” rules are not.</p></div><span className="panel-icon"><Scale size={19}/></span></div>
    <div className="u1-controls">
      <Tabs value={pid} onChange={v => { setPid(v); setCap(kPresets[v].cap) }} options={Object.entries(kPresets).map(([k, v]) => ({ id: k, label: v.label }))}/>
      <Tabs value={rule} onChange={setRule} options={[{ id: 'ratio', label: 'Greedy by value/weight' }, { id: 'value', label: 'Greedy by value' }, { id: 'weight', label: 'Greedy by lightest' }]}/>
    </div>
    <div className="input-row"><label>Capacity W <strong>{cap}</strong></label><input type="range" min={5} max={P.items.reduce((s, i) => s + i.w, 0)} value={cap} onChange={e => setCap(Number(e.target.value))}/></div>
    <div className="item-table"><div className="item-row item-header"><span>Item</span><span>Weight · value</span><span>Value / weight</span><span>Taken</span></div>
      {P.items.map((it, i) => { const t = f.taken.find(t => t.i === i); return <div className={`item-row ${f.consider === i ? 'selected-edge' : ''}`} key={it.name}><span>{it.name}</span><span>{it.w} · {it.v}</span><span>{(it.v / it.w).toFixed(2)}</span><span>{t ? (t.frac === 1 ? 'all' : `${(t.frac * 100).toFixed(0)}%`) : '—'}</span></div> })}</div>
    <span className="u1-label">THE KNAPSACK (capacity {cap})</span>
    <svg viewBox="0 0 640 54" className="u1-svg" style={{ maxWidth: 760 }} role="img" aria-label={`Knapsack holds value ${f.value.toFixed(1)}`}>
      <rect x={0} y={6} width={640} height={40} rx={8} fill="#0f1b29" stroke="#2a3d51"/>
      {f.taken.map((t, k) => { const it = P.items[t.i], w = (640 * t.frac * it.w) / cap, el = <g key={k}><rect x={x + 1} y={8} width={Math.max(2, w - 2)} height={36} rx={6} fill={SERIES[k % SERIES.length]} fillOpacity={0.85}/>{w > 40 && <text x={x + w / 2} y={31} fontSize="11" textAnchor="middle" fill="#06121b" fontWeight={600}>{it.name}{t.frac < 1 ? ` ${(t.frac * 100).toFixed(0)}%` : ''}</text>}</g>; x += w; return el })}
    </svg>
    <div className="stage-explanation"><strong>{f.title}</strong><p>{f.text}</p></div>
    <PlayerBar p={p}/>
    <span className="u1-label">VALUE REACHED BY EACH RULE (capacity {cap})</span>
    <div className="u1-strat-bars">{compare.map(c => <div key={c.r} className={c.r === rule ? 'on' : ''}><span>{c.r === 'ratio' ? 'By value/weight' : c.r === 'value' ? 'By value' : 'By lightest'}</span><i><b style={{ width: `${(c.v / maxV) * 100}%` }}/></i><em>{+c.v.toFixed(2)}</em></div>)}
      <div><span>0/1 version (no cutting), best possible</span><i><b style={{ width: `${(zeroOne / maxV) * 100}%`, background: '#9582db' }}/></i><em>{zeroOne}</em></div></div>
    <div className="callout"><CircleHelp size={16}/><p>The value/weight rule is optimal for the <b>fractional</b> problem: an exchange argument swaps any lower-ratio material for higher-ratio material without losing value. It is <b>not</b> optimal for the 0/1 problem, where items cannot be cut. That one needs dynamic programming (see the 0/1 knapsack topic).</p></div>
  </section>
}

/* ---------- Huffman coding ---------- */
const hPresets: Record<string, { label: string; freqs?: [string, number][]; text?: string }> = {
  clrs: { label: 'Textbook frequencies', freqs: [['a', 45], ['b', 13], ['c', 12], ['d', 16], ['e', 9], ['f', 5]] },
  abra: { label: '“ABRACADABRA”', text: 'ABRACADABRA' },
  mine: { label: 'Your own text' },
}
export function HuffmanExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [pid, setPid] = useState('clrs')
  const [text, setText] = useState('MISSISSIPPI RIVER')
  const freqs = pid === 'clrs' ? hPresets.clrs.freqs! : freqsFromText((pid === 'abra' ? 'ABRACADABRA' : text || 'AB').slice(0, 40))
  const ok = freqs.length >= 2
  const run = useMemo(() => huffman(ok ? freqs : [['A', 1], ['B', 1]]), [pid, text])
  const p = usePlayer(run.frames.length, `${pid}-${text}`, onSteps)
  const f = run.frames[p.step]
  const done = p.step === p.last
  return <section className="panel">
    <div className="panel-heading"><div><span className="kicker">HUFFMAN CODING</span><h2>Give frequent symbols short codes</h2><p>Huffman builds an optimal prefix-free code bottom-up. A min-priority queue holds trees keyed by total frequency, and the two least frequent trees are merged again and again. Each symbol’s code is the 0/1 path from the root to its leaf.</p></div><span className="panel-icon"><Binary size={19}/></span></div>
    <Tabs value={pid} onChange={setPid} options={Object.entries(hPresets).map(([k, v]) => ({ id: k, label: v.label }))}/>
    {pid === 'mine' && <div className="u2-input"><label>Text (up to 40 characters, at least 2 different ones)<input value={text} onChange={e => setText(e.target.value)}/></label></div>}
    <div className="u4-freqs">{freqs.map(([s, c]) => <span key={s}><b>{s === ' ' ? '␣' : s}</b>{c}</span>)}</div>
    <span className="u1-label">PRIORITY QUEUE OF TREES (smallest frequency on the left)</span>
    <Forest forest={f.forest} made={f.made} picked={f.picked}/>
    <div className="stage-explanation"><strong>{f.title}</strong><p>{f.text}</p></div>
    <PlayerBar p={p}/>
    {done && <>
      <div className="u1-table-wrap u1-gap"><table className="u1-table">
        <thead><tr><th>Symbol</th><th>Frequency</th><th>Huffman code</th><th>Bits used</th><th>Fixed-length code</th></tr></thead>
        <tbody>{freqs.map(([s, c], i) => <tr key={s}><td>{s === ' ' ? '␣ (space)' : s}</td><td>{c}</td><td className="u2-mono">{run.codes[s]}</td><td>{c} × {run.codes[s].length} = {c * run.codes[s].length}</td><td className="u2-mono">{i.toString(2).padStart(run.fixed, '0')}</td></tr>)}</tbody>
      </table></div>
      <div className="u1-strat-bars u1-gap">
        <div><span>Fixed-length ({run.fixed} bits each)</span><i><b style={{ width: '100%', background: '#ce7b2c' }}/></i><em>{run.fixedTotal} bits</em></div>
        <div className="on"><span>Huffman</span><i><b style={{ width: `${(run.total / run.fixedTotal) * 100}%` }}/></i><em>{run.total} bits ({(run.total / run.count).toFixed(2)} per symbol)</em></div>
        <div><span>Entropy (theoretical minimum)</span><i><b style={{ width: `${(run.entropy * run.count / run.fixedTotal) * 100}%`, background: '#9582db' }}/></i><em>{(run.entropy * run.count).toFixed(1)} bits ({run.entropy.toFixed(2)} per symbol)</em></div>
      </div>
    </>}
    <div className="callout"><CircleHelp size={16}/><p>No code is a prefix of another, so a bit string decodes in only one way: walk from the root and output a symbol at each leaf. With a binary heap as the priority queue, n symbols need n − 1 merges of O(log n) each: <b>O(n log n)</b>. Greedy is safe here because the two rarest symbols can always be placed as deepest siblings in some optimal tree.</p></div>
  </section>
}
function Forest({ forest, made, picked }: { forest: HNode[]; made?: HNode; picked?: [HNode, HNode] }) {
  type P = { t: HNode; x: number; y: number; px?: number; py?: number; bit?: string }
  const nodes: P[] = []; let slot = 0
  const dx = 46, dy = 54
  const lay = (t: HNode, d: number, parent?: { x: number; y: number }, bit?: string): number => {
    let x: number
    if (t.sym !== undefined) x = 26 + slot++ * dx
    else { const a = lay(t.left!, d + 1, undefined, '0'), b = lay(t.right!, d + 1, undefined, '1'); x = (a + b) / 2 }
    nodes.push({ t, x, y: 24 + d * dy, bit }); return x
  }
  const roots: number[] = []
  forest.forEach(t => { roots.push(lay(t, 0)); slot += 0.4 })
  // connect parents to children
  const byId = new Map(nodes.map(n => [n.t.id, n]))
  nodes.forEach(n => { if (n.t.left) { const l = byId.get(n.t.left.id)!, r = byId.get(n.t.right!.id)!; l.px = r.px = n.x; l.py = r.py = n.y } })
  const W = Math.max(300, slot * dx + 20), H = Math.max(...nodes.map(n => n.y)) + 34
  const inMade = new Set(made ? collectIds(made) : [])
  return <div className="u1-tree-scroll"><svg width={W > 700 ? W : undefined} viewBox={`0 0 ${W} ${H}`} className="u1-svg" style={W > 700 ? undefined : { maxWidth: Math.min(760, W * 1.4) }} role="img" aria-label={`Forest of ${forest.length} Huffman trees`}>
    {nodes.filter(n => n.px !== undefined).map(n => <g key={`e${n.t.id}`}><line x1={n.px} y1={n.py! + 14} x2={n.x} y2={n.y - 14} stroke={inMade.has(n.t.id) ? '#f4c56a' : '#2f4560'} strokeWidth={1.6}/><text x={(n.px! + n.x) / 2 + (n.bit === '0' ? -7 : 7)} y={(n.py! + n.y) / 2 + 2} fontSize="10" textAnchor="middle" fill="#9be4ff">{n.bit}</text></g>)}
    {nodes.map(n => { const leaf = n.t.sym !== undefined, hot = made?.id === n.t.id, was = picked?.some(q => q.id === n.t.id)
      return <g key={n.t.id}>{leaf ? <rect x={n.x - 18} y={n.y - 14} width={36} height={28} rx={6} fill="#10302a" stroke={was ? '#f4c56a' : SERIES[2]} strokeWidth={was ? 2.4 : 1.3}/> : <circle cx={n.x} cy={n.y} r={15} fill={hot ? '#2a2412' : '#13273a'} stroke={hot ? '#f4c56a' : was ? '#f4c56a' : SERIES[0]} strokeWidth={hot || was ? 2.4 : 1.3}/>}
        {leaf && <text x={n.x} y={n.y - 1} fontSize="10.5" textAnchor="middle" fill="#f0f8ff" fontWeight={600}>{n.t.sym === ' ' ? '␣' : n.t.sym}</text>}
        <text x={n.x} y={n.y + (leaf ? 10 : 4)} fontSize={leaf ? 8.5 : 10} textAnchor="middle" fill={leaf ? '#b6ffe0' : '#e7f4ff'}>{n.t.f}</text></g> })}
  </svg></div>
}
const collectIds = (t: HNode): number[] => [t.id, ...(t.left ? collectIds(t.left) : []), ...(t.right ? collectIds(t.right) : [])]