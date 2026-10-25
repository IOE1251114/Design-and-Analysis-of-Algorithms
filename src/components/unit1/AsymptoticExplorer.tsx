import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, Check, CircleHelp, Scale, X } from 'lucide-react'
import { boundG, growth, growthOrder, quad, witness, type BoundG, type GrowthId } from '../../domain/unit1'
import { Legend, SERIES, Tabs, axis, compact, grid, growthColor, niceTicks, tooltipStyle } from './shared'

export function AsymptoticExplorer() {
  return <>
    <GrowthRace/>
    <BoundProver/>
  </>
}

function GrowthRace() {
  const [nMax, setNMax] = useState(24)
  const [scale, setScale] = useState<'linear' | 'log'>('linear')
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const visible = growthOrder.filter(g => !hidden.has(g))
  const data = useMemo(() => Array.from({ length: nMax - 1 }, (_, i) => { const n = i + 2; return { n, ...Object.fromEntries(growthOrder.map(g => [g, growth[g].f(n)])) } as { n: number } & Record<GrowthId, number> }), [nMax])
  const capSeries = visible.filter(g => g !== 'exp')
  const cap = scale === 'linear' ? niceTicks(capSeries.length ? Math.max(...capSeries.map(g => growth[g].f(nMax))) : growth.exp.f(nMax)).top : undefined
  const expEscapes = scale === 'linear' && !hidden.has('exp') && cap !== undefined && growth.exp.f(nMax) > cap ? data.find(d => d.exp > cap)?.n : undefined
  const toggle = (id: string) => setHidden(h => { const s = new Set(h); s.has(id) ? s.delete(id) : s.add(id); return s.size === growthOrder.length ? h : s })
  const sorted = [...growthOrder].sort((a, b) => growth[a].f(nMax) - growth[b].f(nMax))

  return <section className="panel">
    <div className="panel-heading"><div><span className="kicker">GROWTH-RATE RACE</span><h2>As n grows, what dominates?</h2><p>Each curve is the function itself, computed exactly. Drag n to the right and watch the order of the curves lock in. Click a legend chip to hide a curve.</p></div><span className="panel-icon"><Activity size={19}/></span></div>
    <div className="u1-controls">
      <div className="input-row"><label>Largest n shown <strong>{nMax}</strong></label><input type="range" min="6" max="64" value={nMax} onChange={e => setNMax(Number(e.target.value))}/></div>
      <Tabs value={scale} onChange={setScale} options={[{ id: 'linear', label: 'Linear scale' }, { id: 'log', label: 'Log scale' }]}/>
    </div>
    <Legend items={growthOrder.map(g => ({ id: g, label: growth[g].label, color: growthColor[g] }))} hidden={hidden} onToggle={toggle}/>
    <div className="u1-chart" style={{ height: 320 }}><ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 16, bottom: 6, left: 0 }}>
        <CartesianGrid {...grid}/>
        <XAxis dataKey="n" type="number" domain={[2, nMax]} ticks={[2, ...niceTicks(nMax, 6).ticks.filter(t => t > 2 && t <= nMax)]} {...axis} allowDecimals={false} label={{ value: 'n', position: 'insideBottomRight', offset: -2, fill: '#8498ae', fontSize: 10 }}/>
        <YAxis {...axis} width={52} scale={scale} domain={scale === 'log' ? [0.5, 'auto'] : [0, cap!]} allowDataOverflow tickFormatter={compact}/>
        <Tooltip {...tooltipStyle} labelFormatter={v => `n = ${v}`} formatter={(v: number, k: string) => [compact(v), growth[k as GrowthId].label]} itemSorter={it => -(it.value as number)}/>
        {visible.map(g => <Line key={g} dataKey={g} type="monotone" stroke={growthColor[g]} strokeWidth={2} dot={false} isAnimationActive={false}/>)}
        {expEscapes && <ReferenceLine x={expEscapes} stroke={growthColor.exp} strokeDasharray="3 4" label={{ value: `2ⁿ off the chart at n=${expEscapes}`, fill: '#c3cfdc', fontSize: 10, position: 'insideTopLeft' }}/>}
      </LineChart>
    </ResponsiveContainer></div>
    <div className="u1-race">
      <div className="u1-race-head"><span>Function</span><span>Value at n = {nMax}</span><span>When n doubles, it…</span></div>
      {sorted.map(g => <div key={g} className={hidden.has(g) ? 'off' : ''}><span><i style={{ background: growthColor[g] }}/>{growth[g].label}</span><b>{compact(growth[g].f(nMax))}</b><span>{growth[g].doubling}</span></div>)}
    </div>
    <div className="callout"><CircleHelp size={16}/><p>{scale === 'linear' ? 'On a linear scale the small functions flatten into the floor. Switch to the log scale to see all six at once: polynomials become straight-ish lines and 2ⁿ is the only curve that keeps bending upward.' : 'On a log scale each step up the axis is ×10. n², n and n log n differ by a near-constant gap that slowly widens, while 2ⁿ climbs away from every polynomial.'}</p></div>
  </section>
}

function BoundProver() {
  const [q, setQ] = useState({ a: 3, b: 8, c: 12 })
  const [g, setG] = useState<BoundG>('n2')
  const [c1, setC1] = useState(2)
  const [c2, setC2] = useState(4)
  const up = witness(q, g, c2, 'upper'), lo = witness(q, g, c1, 'lower')
  const theta = up.holds && lo.holds ? Math.max(up.n0!, lo.n0!) : null
  const N = Math.min(120, Math.max(20, Math.ceil(Math.max(up.n0 ?? 0, lo.n0 ?? 0, 8) * 1.8)))
  const F = quad(q), G = boundG[g].f
  const data = useMemo(() => Array.from({ length: N }, (_, i) => { const n = i + 1; return { n, f: F(n), upper: c2 * G(n), lower: c1 * G(n) } }), [N, q, g, c1, c2])
  const yAxis = niceTicks(Math.max(F(N) * 1.6, 10)), xAxis = niceTicks(N, 6)
  const degF = q.a > 0 ? 2 : q.b > 0 ? 1 : 0, degG = g === 'n' ? 1 : g === 'n2' ? 2 : 3
  const lead = degF === 2 ? q.a : degF === 1 ? q.b : q.c
  const fText = [q.a && `${q.a}n²`, q.b && `${q.b}n`, (q.c || (!q.a && !q.b)) && `${q.c}`].filter(Boolean).join(' + ')
  const why = (kind: 'upper' | 'lower') => {
    if (kind === 'upper') return degG > degF ? `${boundG[g].label} outgrows f, so any c₂ > 0 works eventually.` : degG < degF ? `f grows faster than ${boundG[g].label}; no constant c₂ can keep up.` : `Same degree: c₂ must exceed the leading coefficient ${lead}${c2 === lead ? ' (equal only works if nothing else is added)' : ''}.`
    return degG < degF ? `f outgrows ${boundG[g].label}, so any c₁ > 0 works eventually.` : degG > degF ? `${boundG[g].label} outgrows f; no constant c₁ > 0 stays below it.` : `Same degree: c₁ must be at most the leading coefficient ${lead}.`
  }
  const s = SERIES

  return <section className="panel u1-gap">
    <div className="panel-heading"><div><span className="kicker">PROVE A BOUND</span><h2>Find the constants c and n₀</h2><p>f(n) = O(g(n)) means some c₂ keeps f under c₂·g(n) for every n ≥ n₀. Ω flips the inequality; Θ needs both. Move the sliders and the lab computes the exact smallest n₀, or tells you no n₀ exists.</p></div><span className="panel-icon"><Scale size={19}/></span></div>
    <div className="u1-bound-grid">
      <div>
        <div className="formula-card"><small>YOUR FUNCTION</small><strong>f(n) = {fText}</strong></div>
        {([['a', 'Coefficient of n²', 0, 5, 1], ['b', 'Coefficient of n', 0, 20, 1], ['c', 'Constant term', 0, 50, 1]] as const).map(([k, label, min, max, st]) => <div className="input-row compact" key={k}><label>{label} <strong>{q[k]}</strong></label><input type="range" min={min} max={max} step={st} value={q[k]} onChange={e => setQ(v => ({ ...v, [k]: Number(e.target.value) }))}/></div>)}
        <span className="u1-label">COMPARE AGAINST g(n)</span>
        <Tabs value={g} onChange={setG} options={(['n', 'n2', 'n3'] as BoundG[]).map(id => ({ id, label: `g(n) = ${boundG[id].label}` }))}/>
        <div className="input-row compact"><label>Upper constant c₂ <strong>{c2}</strong></label><input type="range" min="0.5" max="10" step="0.5" value={c2} onChange={e => setC2(Number(e.target.value))}/></div>
        <div className="input-row compact"><label>Lower constant c₁ <strong>{c1}</strong></label><input type="range" min="0.5" max="10" step="0.5" value={c1} onChange={e => setC1(Number(e.target.value))}/></div>
      </div>
      <div>
        <Legend items={[{ id: 'f', label: 'f(n)', color: s[0] }, { id: 'u', label: `c₂·${boundG[g].label}`, color: s[5], dash: true }, { id: 'l', label: `c₁·${boundG[g].label}`, color: s[2], dash: true }]}/>
        <div className="u1-chart" style={{ height: 290 }}><ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 6, left: 0 }}>
            <CartesianGrid {...grid}/>
            <XAxis dataKey="n" type="number" domain={[1, N]} ticks={[1, ...xAxis.ticks.filter(t => t > 1 && t <= N)]} {...axis} allowDecimals={false}/>
            <YAxis {...axis} width={52} domain={[0, yAxis.top]} ticks={yAxis.ticks} allowDataOverflow tickFormatter={compact}/>
            <Tooltip {...tooltipStyle} labelFormatter={v => `n = ${v}`} formatter={(v: number, k: string) => [compact(v), k === 'f' ? 'f(n)' : k === 'upper' ? `c₂·g(n)` : `c₁·g(n)`]}/>
            {theta !== null && <ReferenceArea x1={theta} x2={N} fill="#1aab80" fillOpacity={0.08} stroke="none"/>}
            {up.holds && up.n0! > 1 && <ReferenceLine x={up.n0!} stroke={s[5]} strokeDasharray="2 3" label={{ value: `n₀ = ${up.n0}`, fill: '#c3cfdc', fontSize: 10, position: 'insideTopRight' }}/>}
            {lo.holds && lo.n0! > 1 && lo.n0 !== up.n0 && <ReferenceLine x={lo.n0!} stroke={s[2]} strokeDasharray="2 3" label={{ value: `n₀ = ${lo.n0}`, fill: '#c3cfdc', fontSize: 10, position: 'insideBottomRight' }}/>}
            <Line dataKey="upper" stroke={s[5]} strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false}/>
            <Line dataKey="lower" stroke={s[2]} strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false}/>
            <Line dataKey="f" stroke={s[0]} strokeWidth={2.5} dot={false} isAnimationActive={false}/>
          </LineChart>
        </ResponsiveContainer></div>
        <div className="u1-verdicts">
          <Verdict ok={up.holds} title={`f = O(${boundG[g].label})`} detail={up.holds ? `f(n) ≤ ${c2}·${boundG[g].label} for every n ≥ ${up.n0}` : 'Fails for this c₂'} why={why('upper')}/>
          <Verdict ok={lo.holds} title={`f = Ω(${boundG[g].label})`} detail={lo.holds ? `f(n) ≥ ${c1}·${boundG[g].label} for every n ≥ ${lo.n0}` : 'Fails for this c₁'} why={why('lower')}/>
          <Verdict ok={theta !== null} title={`f = Θ(${boundG[g].label})`} detail={theta !== null ? `Sandwiched from n₀ = ${theta} on (shaded)` : 'Needs both bounds at once'} why={theta !== null ? 'Both constants work, so the bound is tight.' : 'A tight bound needs an upper and a lower witness together.'}/>
        </div>
      </div>
    </div>
    <div className="definition-grid"><div><strong>O(g(n))</strong><span>∃ c₂, n₀: f(n) ≤ c₂·g(n) for all n ≥ n₀ (upper bound)</span></div><div><strong>Ω(g(n))</strong><span>∃ c₁, n₀: f(n) ≥ c₁·g(n) for all n ≥ n₀ (lower bound)</span></div><div><strong>Θ(g(n))</strong><span>Both at once: c₁·g(n) ≤ f(n) ≤ c₂·g(n) (tight bound)</span></div></div>
    <div className="callout"><CircleHelp size={16}/><p>Big-O does not mean “worst case” and Big-Ω does not mean “best case”. They bound a function. The worst-case running time and the best-case running time are two different functions, and each can have its own O, Ω and Θ.</p></div>
  </section>
}

function Verdict({ ok, title, detail, why }: { ok: boolean; title: string; detail: string; why: string }) {
  return <div className={`u1-verdict ${ok ? 'yes' : 'no'}`}><strong>{ok ? <Check size={14}/> : <X size={14}/>}{title}<em>{ok ? 'holds' : 'no'}</em></strong><span>{detail}</span><small>{why}</small></div>
}