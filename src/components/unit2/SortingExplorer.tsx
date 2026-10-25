import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, BarChart3, CircleHelp } from 'lucide-react'
import { caseAnalysis, makeInput, runSort, sortInfo, type InputKind, type PivotRule, type SortAlgo } from '../../domain/unit2/sorts'
import { Legend, PlayerBar, SERIES, Tabs, axis, compact, grid, tooltipStyle, usePlayer } from '../unit1/shared'
import { ArrayBars, C, HeapTree, type BarState } from './views'

const algos: SortAlgo[] = ['quick', 'merge', 'heap', 'insertion']
const kinds: { id: InputKind; label: string }[] = [{ id: 'random', label: 'Random' }, { id: 'sorted', label: 'Already sorted' }, { id: 'reverse', label: 'Reverse sorted' }, { id: 'few', label: 'Few distinct keys' }]

export function SortingExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [algo, setAlgo] = useState<SortAlgo>('quick')
  const [kind, setKind] = useState<InputKind>('random')
  const [pivot, setPivot] = useState<PivotRule>('last')
  const [n, setN] = useState(10)
  const input = useMemo(() => makeInput(kind, n), [kind, n])
  const run = useMemo(() => runSort(algo, input, { pivot, record: true }), [algo, input, pivot])
  const p = usePlayer(run.frames.length, `${algo}-${kind}-${n}-${pivot}`, onSteps)
  const f = run.frames[p.step]
  const done = new Set(f.done)
  const state = (i: number): BarState => {
    if (done.has(i)) return 'done'
    if (algo === 'quick' && f.part) { if (i === f.part.hi) return 'pivot'; if (i < f.part.lo || i > f.part.hi) return 'idle'; if (i <= f.part.i) return 'le'; if (i < f.part.j) return 'gt'; return 'base' }
    if (algo === 'quick' && f.pivot === i) return 'pivot'
    if (f.range && (i < f.range[0] || i > f.range[1])) return 'idle'
    return 'base'
  }
  const info = sortInfo[algo]
  const legend = algo === 'quick'
    ? [{ id: 'le', label: '≤ pivot region', color: C.region }, { id: 'gt', label: '> pivot region', color: C.other }, { id: 'p', label: 'Pivot', color: C.pivot }, { id: 'u', label: 'Not yet examined', color: C.base }, { id: 'd', label: 'Final position', color: C.done }, { id: 'o', label: 'Outside current call', color: C.idle }]
    : algo === 'heap' ? [{ id: 'h', label: 'Inside the heap', color: C.base }, { id: 'd', label: 'Sorted (removed from heap)', color: C.done }]
    : [{ id: 'a', label: 'Active range', color: C.base }, { id: 'o', label: 'Outside active range', color: C.idle }, { id: 'd', label: 'Sorted', color: C.done }]

  return <>
    <section className="panel">
      <div className="panel-heading"><div><span className="kicker">SORTING LAB</span><h2>Watch comparison sorts work, one step at a time</h2><p>Every frame is a real intermediate state. Gold outlines mark the two keys being compared and rose outlines mark a swap. Switch the input to see the same algorithm behave very differently.</p></div><span className="panel-icon"><Activity size={19}/></span></div>
      <Tabs value={algo} onChange={setAlgo} options={algos.map(a => ({ id: a, label: sortInfo[a].name }))}/>
      <div className="u1-controls">
        <Tabs value={kind} onChange={setKind} options={kinds}/>
        {algo === 'quick' && <Tabs value={pivot} onChange={setPivot} options={[{ id: 'last', label: 'Pivot: last key' }, { id: 'middle', label: 'Pivot: middle key' }]}/>}
      </div>
      <div className="input-row"><label>Number of keys n <strong>{n}</strong></label><input type="range" min="4" max="16" value={n} onChange={e => setN(Number(e.target.value))}/></div>
      <Legend items={[...legend, { id: 'c', label: 'Compared', color: C.compare, dash: true }, { id: 's', label: 'Swapped / moved', color: C.swap, dash: true }]}/>
      <div className="u2-stage">
        <ArrayBars a={f.a} state={state} compare={f.compare} swap={f.swap}/>
        {algo === 'merge' && f.buffer && <div className="u2-buffer"><small>MERGE BUFFER (covers a[{f.bufferAt}…{f.bufferAt! + f.buffer.length - 1}])</small><div>{f.buffer.map((v, k) => <span key={k} className={v === null ? 'empty' : ''}>{v ?? ''}</span>)}</div></div>}
        {algo === 'heap' && f.heapSize !== undefined && <div className="u2-heapmini"><small>THE SAME ARRAY VIEWED AS A HEAP (first {f.heapSize} keys)</small><HeapTree a={f.a} size={f.heapSize} compare={f.compare} swap={f.swap}/></div>}
      </div>
      <div className="stage-explanation"><strong>{f.title}{f.depth !== undefined ? ` · recursion depth ${f.depth}` : ''}</strong><p>{f.text}</p></div>
      <PlayerBar p={p}/>
      <div className="u2-stats">
        <div><small>COMPARISONS</small><strong>{f.comparisons}</strong></div>
        <div><small>DATA MOVES</small><strong>{f.moves}</strong><span>a swap counts as 3</span></div>
        <div><small>BEST · AVERAGE · WORST</small><strong className="u2-mono">{info.best} · {info.avg} · {info.worst}</strong></div>
        <div><small>EXTRA SPACE · STABLE · IN PLACE</small><strong className="u2-mono">{info.space} · {info.stable ? 'yes' : 'no'} · {info.inPlace ? 'yes' : 'no'}</strong></div>
      </div>
    </section>
    <CaseAnalysis algo={algo} pivot={pivot}/>
  </>
}

function CaseAnalysis({ algo, pivot }: { algo: SortAlgo; pivot: PivotRule }) {
  const data = useMemo(() => caseAnalysis(algo, pivot), [algo, pivot])
  const series = [
    { id: 'random', label: 'Random input (mean of 25)', color: SERIES[0] },
    { id: 'sorted', label: 'Already sorted', color: SERIES[2] },
    { id: 'reverse', label: 'Reverse sorted', color: SERIES[5] },
    { id: 'nlogn', label: 'n log₂ n', color: '#8fa3b9', dash: true },
    { id: 'half_n2', label: 'n(n − 1)/2', color: SERIES[4], dash: true },
  ]
  const note: Record<SortAlgo, string> = {
    quick: pivot === 'last' ? 'With the last key as pivot, sorted and reverse inputs give the most lopsided split every time, so they follow the n(n − 1)/2 curve exactly: the Θ(n²) worst case. Random input stays close to the n log₂ n curve: the Θ(n log n) average case. Switch the pivot to the middle key and the worst case disappears for these inputs.' : 'Choosing the middle key splits sorted and reverse inputs evenly, so all three inputs now grow like n log n. A bad input still exists for this rule, but it is unlikely; randomised pivots make the expected time Θ(n log n) for every input.',
    merge: 'All three curves stay at or below n log₂ n. Merge sort always splits exactly in half, so its worst case equals its average case: Θ(n log n). Sorted input is the cheapest, because each merge empties one half early.',
    heap: 'All three curves are close together and grow like n log n. Heap sort does not adapt to the input: building the heap and n extractions cost Θ(n log n) in the best, average and worst case.',
    insertion: 'Sorted input needs only n − 1 comparisons (best case Θ(n)). Reverse input follows n(n − 1)/2 exactly (worst case Θ(n²)), and random input lands near half of that (average case Θ(n²)).',
  }
  return <section className="panel u1-gap">
    <div className="panel-heading"><div><span className="kicker">WORST VS AVERAGE CASE</span><h2>Comparisons counted, not estimated</h2><p>The lab runs {sortInfo[algo].name.toLowerCase()} on inputs of size 4…64 and counts every comparison. The dashed curves are the two growth rates the theory predicts.</p></div><span className="panel-icon"><BarChart3 size={19}/></span></div>
    <Legend items={series}/>
    <div className="u1-chart" style={{ height: 300 }}><ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 6, left: 0 }}>
        <CartesianGrid {...grid}/><XAxis dataKey="n" {...axis} label={{ value: 'n', position: 'insideBottomRight', offset: -2, fill: '#8498ae', fontSize: 10 }}/><YAxis {...axis} width={50} tickFormatter={compact}/>
        <Tooltip {...tooltipStyle} labelFormatter={v => `n = ${v}`} formatter={(v: number, k: string) => [`${v} comparisons`, series.find(s => s.id === k)!.label]}/>
        {series.map(s => <Line key={s.id} dataKey={s.id} stroke={s.color} strokeWidth={s.dash ? 1.5 : 2.2} strokeDasharray={s.dash ? '6 4' : undefined} dot={false} isAnimationActive={false}/>)}
      </LineChart></ResponsiveContainer></div>
    <div className="callout"><CircleHelp size={16}/><p>{note[algo]}</p></div>
    <div className="u1-table-wrap u1-gap"><table className="u1-table">
      <thead><tr><th>Algorithm</th><th>Best</th><th>Average</th><th>Worst</th><th>Extra space</th><th>Stable</th><th>In place</th></tr></thead>
      <tbody>{algos.map(a => { const i = sortInfo[a]; return <tr key={a} className={a === algo ? 'u2-row-on' : ''}><td>{i.name}</td><td>{i.best}</td><td>{i.avg}</td><td>{i.worst}</td><td>{i.space}</td><td>{i.stable ? 'yes' : 'no'}</td><td>{i.inPlace ? 'yes' : 'no'}</td></tr> })}</tbody>
    </table></div>
  </section>
}