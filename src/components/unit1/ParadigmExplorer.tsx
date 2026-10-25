import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CircleHelp, GitBranch, ShieldCheck } from 'lucide-react'
import { bbItems, branchAndBound, greedyCoins, mergeSortFrames, optimalCoins, queensTrace } from '../../domain/unit1'
import { Legend, PlayerBar, SERIES, Tabs, axis, grid, tooltipStyle, usePlayer } from './shared'

type ParadigmId = 'divide' | 'greedy' | 'backtracking' | 'bnb'
const info: Record<ParadigmId, { title: string; rule: string; proof: string; steps: string[] }> = {
  divide: { title: 'Divide and conquer', rule: 'Split the problem into smaller instances of itself, solve those recursively, then combine their answers.', proof: 'Show the combine step is correct, then solve the recurrence for the running time.', steps: ['Divide input', 'Solve subproblems', 'Combine results'] },
  greedy: { title: 'Greedy', rule: 'Repeatedly take the choice that looks best right now and never undo it.', proof: 'The greedy-choice property, usually by an exchange argument. Without that proof greedy can be wrong, as the coin demo shows.', steps: ['Check feasibility', 'Take the locally best choice', 'Prove the choice is safe'] },
  backtracking: { title: 'Backtracking', rule: 'Build a solution one decision at a time and undo the last decision as soon as it breaks a constraint.', proof: 'The search must cover every viable candidate; a pruning rule may only cut branches that cannot hold a solution.', steps: ['Choose', 'Check constraints', 'Undo if stuck'] },
  bnb: { title: 'Branch and bound', rule: 'Branch on decisions, compute an optimistic bound for each partial solution, and discard branches whose bound cannot beat the best solution found so far.', proof: 'The bound must be valid for every completion of the partial solution (never underestimate when maximising).', steps: ['Branch', 'Bound', 'Prune or continue'] },
}

export function ParadigmExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [id, setId] = useState<ParadigmId>('divide')
  const d = info[id]
  return <section className="panel">
    <div className="panel-heading"><div><span className="kicker">DESIGN STRATEGIES</span><h2>See each paradigm run on a real problem</h2><p>Every demo below executes the algorithm on the spot. Compare the mechanism and, more importantly, what you must prove for it to be correct.</p></div><span className="panel-icon"><GitBranch size={19}/></span></div>
    <Tabs value={id} onChange={setId} options={(Object.keys(info) as ParadigmId[]).map(k => ({ id: k, label: info[k].title }))}/>
    <div className="u1-paradigm-head">
      <div><span className="kicker">CORE PRINCIPLE</span><h3>{d.title}</h3><p>{d.rule}</p></div>
      <div className="u1-flow">{d.steps.map((s, i) => <span key={s}><b>{String(i + 1).padStart(2, '0')}</b>{s}</span>)}</div>
    </div>
    {id === 'divide' && <MergeSortDemo onSteps={onSteps}/>}
    {id === 'greedy' && <CoinDemo/>}
    {id === 'backtracking' && <QueensDemo onSteps={onSteps}/>}
    {id === 'bnb' && <BranchBoundDemo onSteps={onSteps}/>}
    <div className="callout"><ShieldCheck size={16}/><p><strong>Proof obligation:</strong> {d.proof}</p></div>
  </section>
}

const msInput = [38, 27, 43, 3, 9, 82, 10, 15]
function MergeSortDemo({ onSteps }: { onSteps?: (k: number) => void }) {
  const ms = useMemo(() => mergeSortFrames(msInput), [])
  const p = usePlayer(ms.frames.length, 'ms', onSteps)
  const f = ms.frames[p.step]
  const cell = 74, gap = 6, rowH = 56, W = msInput.length * cell
  return <div className="u1-demo">
    <div className="u1-tree-scroll"><svg viewBox={`0 0 ${W} ${(ms.maxDepth + 1) * rowH}`} className="u1-svg" style={{ maxWidth: 680 }} role="img" aria-label="Merge sort recursion tree">
      {ms.nodes.filter(x => x.depth <= f.visibleDepth).map(x => {
        const merged = x.depth >= f.mergedFrom || x.hi - x.lo === 1
        const vals = merged && x.hi - x.lo > 1 ? ms.sortedAt.get(`${x.lo}-${x.hi}`)!.values : x.values
        const fresh = x.depth === f.mergedFrom
        const xx = x.lo * cell + gap / 2, w = (x.hi - x.lo) * cell - gap, y = x.depth * rowH + 8
        return <g key={`${x.lo}-${x.hi}`}>
          <rect x={xx} y={y} width={w} height={34} rx={7} fill={merged && f.mergedFrom !== Infinity ? '#10302a' : '#13273a'} stroke={fresh ? SERIES[2] : '#37536b'} strokeWidth={fresh ? 2 : 1}/>
          {vals.map((v, i) => <text key={i} x={xx + (w * (i + 0.5)) / vals.length} y={y + 21.5} fontSize="12" textAnchor="middle" fill="#e2f2ff">{v}</text>)}
        </g>
      })}
    </svg></div>
    <div className="stage-explanation"><strong>{f.title}</strong><p>{f.detail}</p></div>
    <PlayerBar p={p}/>
    <div className="graph-state-grid"><div><small>LEVELS</small><strong>log₂ 8 + 1 = {ms.maxDepth + 1}</strong></div><div><small>WORK PER LEVEL</small><strong>≤ n = 8 comparisons</strong></div><div><small>RECURRENCE</small><strong>2T(n/2) + n = Θ(n log n)</strong></div></div>
  </div>
}

const systems: Record<string, { label: string; coins: number[] }> = { us: { label: 'Coins 25 · 10 · 5 · 1', coins: [25, 10, 5, 1] }, bad: { label: 'Coins 4 · 3 · 1', coins: [4, 3, 1] }, odd: { label: 'Coins 10 · 6 · 1', coins: [10, 6, 1] } }
function CoinDemo() {
  const [sys, setSys] = useState('bad')
  const [amount, setAmount] = useState(6)
  const coins = systems[sys].coins
  const g = greedyCoins(coins, amount), o = optimalCoins(coins, amount)
  const data = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ amount: i + 1, greedy: greedyCoins(coins, i + 1).length, optimal: optimalCoins(coins, i + 1).length })), [sys])
  const fails = data.filter(d => d.greedy > d.optimal)
  return <div className="u1-demo">
    <div className="u1-controls"><Tabs value={sys} onChange={setSys} options={Object.entries(systems).map(([k, v]) => ({ id: k, label: v.label }))}/></div>
    <div className="input-row"><label>Amount to pay <strong>{amount}</strong></label><input type="range" min="1" max="30" value={amount} onChange={e => setAmount(Number(e.target.value))}/></div>
    <div className="u1-coin-rows">
      <CoinRow title="Greedy: always take the largest coin that fits" coins={g} color={SERIES[1]}/>
      <CoinRow title="Optimal: fewest coins (computed by dynamic programming)" coins={o} color={SERIES[0]}/>
    </div>
    <div className={`sat-result ${g.length === o.length ? '' : 'sat-no'}`}><strong>{g.length === o.length ? `Greedy is optimal for ${amount}` : `Greedy uses ${g.length} coins; ${o.length} is possible`}</strong><span>{fails.length ? `With these coins greedy is beaten on ${fails.length} of the amounts 1–30 (${fails.slice(0, 8).map(d => d.amount).join(', ')}${fails.length > 8 ? ', …' : ''}).` : 'With these coins greedy matches the optimum for every amount 1–30, and an exchange argument proves it always will.'}</span></div>
    <span className="u1-label">COINS NEEDED FOR EVERY AMOUNT 1–30</span>
    <Legend items={[{ id: 'g', label: 'Greedy', color: SERIES[1] }, { id: 'o', label: 'Optimal', color: SERIES[0] }]}/>
    <div className="u1-chart" style={{ height: 190 }}><ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -18 }} barGap={1} barCategoryGap="18%">
        <CartesianGrid {...grid}/><XAxis dataKey="amount" {...axis} interval={1}/><YAxis {...axis} allowDecimals={false} width={40}/>
        <Tooltip {...tooltipStyle} cursor={{ fill: '#ffffff0a' }} labelFormatter={v => `amount ${v}`} formatter={(v: number, k: string) => [`${v} coins`, k === 'greedy' ? 'Greedy' : 'Optimal']}/>
        <ReferenceLine x={amount} stroke="#3a5975"/>
        <Bar dataKey="greedy" fill={SERIES[1]} radius={[3, 3, 0, 0]} isAnimationActive={false}/>
        <Bar dataKey="optimal" fill={SERIES[0]} radius={[3, 3, 0, 0]} isAnimationActive={false}/>
      </BarChart></ResponsiveContainer></div>
  </div>
}
function CoinRow({ title, coins, color }: { title: string; coins: number[]; color: string }) {
  return <div className="u1-coin-row"><small>{title}</small><div>{coins.map((c, i) => <span key={i} style={{ borderColor: color }}>{c}</span>)}<b>{coins.length} coin{coins.length === 1 ? '' : 's'}</b></div></div>
}

function QueensDemo({ onSteps }: { onSteps?: (k: number) => void }) {
  const [N, setN] = useState(4)
  const ev = useMemo(() => queensTrace(N), [N])
  const p = usePlayer(ev.length, N, onSteps)
  const e = ev[p.step]
  const sofar = ev.slice(0, p.step + 1)
  const placed = sofar.filter(x => x.kind === 'place').length, rejected = sofar.filter(x => x.kind === 'reject').length, backs = sofar.filter(x => x.kind === 'backtrack').length
  const cs = 44, S = N * cs
  const msg = e.kind === 'place' ? `Row ${e.row + 1}, column ${e.col + 1} is safe: place a queen and move to the next row.` : e.kind === 'reject' ? `Row ${e.row + 1}, column ${e.col + 1} is attacked by the queen in row ${e.attackers.map(a => a + 1).join(' and ')}: skip it.` : e.kind === 'backtrack' ? `No column works further down, so remove the queen at row ${e.row + 1}, column ${e.col + 1} and try the next column.` : `All ${N} queens placed with no attacks: solution found.`
  return <div className="u1-demo">
    <div className="u1-controls"><Tabs value={String(N)} onChange={v => setN(Number(v))} options={[4, 5, 6].map(k => ({ id: String(k), label: `${k}-Queens` }))}/></div>
    <div className="u1-queens">
      <svg viewBox={`0 0 ${S} ${S}`} className="u1-svg" style={{ maxWidth: 300 }} role="img" aria-label={`${N} by ${N} board. ${msg}`}>
        {Array.from({ length: N * N }, (_, k) => { const r = Math.floor(k / N), c = k % N; return <rect key={k} x={c * cs} y={r * cs} width={cs} height={cs} fill={(r + c) % 2 ? '#12202f' : '#182a3c'}/> })}
        {e.kind === 'reject' && e.attackers.map(a => <line key={a} x1={e.queens[a] * cs + cs / 2} y1={a * cs + cs / 2} x2={e.col * cs + cs / 2} y2={e.row * cs + cs / 2} stroke={SERIES[5]} strokeWidth={2} strokeDasharray="4 3"/>)}
        {e.kind !== 'solved' && <rect x={e.col * cs + 2} y={e.row * cs + 2} width={cs - 4} height={cs - 4} rx={5} fill="none" stroke={e.kind === 'place' ? SERIES[2] : e.kind === 'reject' ? SERIES[5] : SERIES[1]} strokeWidth={2.5} strokeDasharray={e.kind === 'backtrack' ? '5 3' : undefined}/>}
        {e.kind === 'reject' && <text x={e.col * cs + cs / 2} y={e.row * cs + cs / 2 + 6} textAnchor="middle" fontSize="18" fill={SERIES[5]}>×</text>}
        {e.kind === 'backtrack' && <text x={e.col * cs + cs / 2} y={e.row * cs + cs / 2 + 6} textAnchor="middle" fontSize="16" fill={SERIES[1]}>↩</text>}
        {e.queens.map((c, r) => <text key={r} x={c * cs + cs / 2} y={r * cs + cs / 2 + 8} textAnchor="middle" fontSize="24" fill={e.kind === 'solved' ? '#7af0c5' : '#e7f4ff'}>♛</text>)}
      </svg>
      <div className="u1-queen-stats">
        <div><small>QUEENS PLACED</small><strong>{placed}</strong></div>
        <div><small>SQUARES REJECTED</small><strong>{rejected}</strong></div>
        <div><small>BACKTRACKS</small><strong>{backs}</strong></div>
        <div><small>BRUTE FORCE WOULD TRY</small><strong>{(N ** N).toLocaleString()}</strong><span>full boards (Nᴺ)</span></div>
      </div>
    </div>
    <div className="stage-explanation"><strong>{e.kind === 'solved' ? 'Solved' : e.kind === 'place' ? 'Place' : e.kind === 'reject' ? 'Constraint violated' : 'Backtrack'}</strong><p>{msg}</p></div>
    <PlayerBar p={p}/>
  </div>
}

function BranchBoundDemo({ onSteps }: { onSteps?: (k: number) => void }) {
  const cap = 8
  const bb = useMemo(() => branchAndBound(bbItems, cap), [])
  const p = usePlayer(bb.visited.length, 'bb', onSteps)
  const shown = bb.visited.slice(0, p.step + 1), cur = bb.visited[p.step]
  const D = bb.order.length, W = 640, rowH = 62, H = (D + 1) * rowH + 10
  const pos = (path: number[]) => { const d = path.length; const idx = path.reduce((s, b, k) => s + (1 - b) * 2 ** (d - 1 - k), 0); return { x: 70 + ((W - 80) * (idx + 0.5)) / 2 ** d, y: 20 + d * rowH } }
  const look = { expanded: { c: SERIES[0], sym: '' }, pruned: { c: SERIES[1], sym: '✂' }, infeasible: { c: SERIES[5], sym: '×' }, leaf: { c: SERIES[2], sym: '' } }
  return <div className="u1-demo">
    <div className="item-table"><div className="item-row item-header"><span>Branch order (by value/weight)</span><span>Weight</span><span>Value</span><span>Value / weight</span></div>
      {bb.order.map((it, k) => <div className="item-row" key={it.name}><span>Level {k + 1}: {it.name}</span><span>{it.w}</span><span>{it.v}</span><span>{(it.v / it.w).toFixed(2)}</span></div>)}</div>
    <Legend items={[{ id: 'e', label: 'Branched (bound beats best)', color: SERIES[0] }, { id: 'p', label: '✂ Pruned by bound', color: SERIES[1] }, { id: 'i', label: '× Over capacity', color: SERIES[5] }, { id: 'l', label: 'Complete solution (w = weight)', color: SERIES[2] }]}/>
    <p className="u1-small">Left branch = take the item, right branch = leave it.</p>
    <div className="u1-tree-scroll"><svg viewBox={`0 0 ${W} ${H}`} className="u1-svg u1-tree" style={{ maxWidth: 780 }} role="img" aria-label={`Branch and bound tree, ${shown.length} nodes visited so far`}>
      {bb.order.map((it, k) => <text key={k} x={4} y={20 + k * rowH + rowH / 2 + 4} fontSize="9" fill="#7c92aa">take {it.name.replace('Item ', '#')}?</text>)}
      {shown.filter(x => x.depth > 0).map(x => { const a = pos(x.path.slice(0, -1)), b = pos(x.path); return <g key={`e${x.id}`}><line x1={a.x} y1={a.y + 13} x2={b.x} y2={b.y - 13} stroke="#2f4560" strokeWidth={1.2}/>{x.depth < D && <text x={a.x + (b.x - a.x) * 0.72 + (x.path[x.path.length - 1] ? -8 : 8)} y={a.y + (b.y - a.y) * 0.72} fontSize="9" textAnchor={x.path[x.path.length - 1] ? 'end' : 'start'} fill="#7c92aa">{x.path[x.path.length - 1] ? 'yes' : 'no'}</text>}</g> })}
      {shown.map(x => { const q = pos(x.path), L = look[x.status], isCur = x.id === cur.id, isBest = x.status === 'leaf' && x.v === bb.best && p.step === p.last
        return <g key={x.id}>
          <circle cx={q.x} cy={q.y} r={13} fill={x.status === 'leaf' ? '#10302a' : '#101d2c'} stroke={L.c} strokeWidth={isCur || isBest ? 3 : 1.5} strokeDasharray={x.status === 'pruned' ? '3 2' : undefined}><title>{x.note}</title></circle>
          <text x={q.x} y={q.y + 3.5} fontSize="10" textAnchor="middle" fill="#e7f4ff">{L.sym || x.v}</text>
          {x.status !== 'infeasible' && x.status !== 'leaf' && <text x={q.x + 17} y={q.y + 3} fontSize="8.5" fill="#8fa3b9">≤{Number.isInteger(x.bound) ? x.bound : x.bound.toFixed(1)}</text>}
          {x.status === 'leaf' && <text x={q.x} y={q.y + 26} fontSize="8.5" textAnchor="middle" fill="#8fa3b9">w{x.w}</text>}
        </g> })}
    </svg></div>
    <div className="stage-explanation"><strong>Node {cur.id === 'root' ? 'root' : cur.path.map(b => b ? 'Y' : 'N').join('')}: weight {cur.w}, value {cur.v}</strong><p>{cur.note}</p></div>
    <PlayerBar p={p} nextLabel="Next node"/>
    <div className="graph-state-grid"><div><small>BEST SO FAR</small><strong>{cur.incumbent}</strong></div><div><small>NODES VISITED</small><strong>{shown.length} of {bb.fullTree} in the full tree</strong></div><div><small>NUMBER IN EACH NODE</small><strong>value so far · ≤ optimistic bound</strong></div></div>
    {p.step === p.last && <div className="callout"><CircleHelp size={16}/><p>Optimum {bb.best} found after visiting {bb.visited.length} of {bb.fullTree} nodes. It matches the dynamic-programming answer for the same items in Unit 4, but branch and bound got there by refusing to explore branches whose fractional-knapsack bound could not win.</p></div>}
  </div>
}