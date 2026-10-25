import { useEffect, useMemo, useRef, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CircleHelp, GitBranch, ShieldCheck } from 'lucide-react'
import { bbItems, branchAndBound, greedyCoins, greedySteps, mergeSortTrace, optimalCoins, queensTrace, queensTree, type BBStrategy } from '../../domain/unit1'
import { Legend, PlayerBar, SERIES, Tabs, axis, grid, tooltipStyle, usePlayer } from './shared'

type ParadigmId = 'overview' | 'divide' | 'greedy' | 'backtracking' | 'bnb'
type Info = { title: string; tagline: string; points: string[]; template: string; complexity: string[]; examples: string[]; proof: string; fails: string }

const info: Record<Exclude<ParadigmId, 'overview'>, Info> = {
  divide: {
    title: 'Divide and conquer', tagline: 'Divide the problem into smaller instances of the same problem, conquer each one recursively, then combine their answers.',
    points: [
      'Divide: split an instance of size n into a subproblems, each of size about n/b.',
      'Conquer: solve each subproblem recursively; once it is small enough (the base case), solve it directly.',
      'Combine: merge the sub-answers into the answer for the whole problem.',
      'The subproblems must be independent. If they overlap, plain recursion solves the same subproblem many times, and dynamic programming (Unit IV) is the right tool.',
    ],
    template: `DAC(P):
  if P is small enough:
      return Solve(P)            // base case
  divide P into P₁, P₂, …, Pₐ
  for i ← 1 to a:
      Sᵢ ← DAC(Pᵢ)               // conquer
  return Combine(S₁, …, Sₐ)`,
    complexity: ['T(n) = a·T(n/b) + D(n) + C(n)', 'Merge sort: 2T(n/2) + Θ(n) = Θ(n log n)', 'Binary search: T(n/2) + Θ(1) = Θ(log n)', 'Quick sort: Θ(n log n) average, Θ(n²) worst'],
    examples: ['Merge sort', 'Quick sort', 'Binary search', 'Max–min', "Strassen's multiplication", 'Closest pair'],
    proof: 'Correctness by strong induction: assume the recursive calls return correct answers and show the combine step builds a correct answer from them. Running time: set up the recurrence and solve it with the Master theorem or a recursion tree.',
    fails: 'It is inefficient when subproblems overlap, and it pays recursion overhead for very small inputs.',
  },
  greedy: {
    title: 'Greedy', tagline: 'Build the solution one step at a time, always taking the choice that looks best right now, and never undo a choice.',
    points: [
      'Greedy-choice property: there is an optimal solution that contains the greedy (locally best) choice.',
      'Optimal substructure: after making that choice, an optimal solution of the remaining smaller problem completes an optimal solution of the whole.',
      'Both properties must be proved for the specific problem. Without them, greedy is fast but can be wrong.',
      'A typical implementation is a sort followed by one pass, so O(n log n), or uses a priority queue.',
    ],
    template: `Greedy(C):                     // C = candidates
  S ← ∅
  while C ≠ ∅ and S is not a solution:
      x ← Select(C)              // locally best
      C ← C − {x}
      if Feasible(S ∪ {x}):
          S ← S ∪ {x}            // never undone
  return S`,
    complexity: ['Usually O(n log n): sort, then one pass', 'Fractional knapsack: O(n log n)', 'Huffman coding: O(n log n) with a heap', "Kruskal: O(E log E); Prim: O(E log V)"],
    examples: ['Fractional knapsack', 'Huffman coding', "Kruskal's MST", "Prim's MST", "Dijkstra's shortest paths", 'Activity selection'],
    proof: 'An exchange argument: take any optimal solution that does not use the greedy choice, swap the greedy choice in, and show the result is still feasible and no worse. Repeat on the remaining subproblem.',
    fails: 'Whenever the greedy-choice property is false, for example coin change with coins {4, 3, 1} or 0/1 knapsack. Try the coin demo below.',
  },
  backtracking: {
    title: 'Backtracking', tagline: 'Build a solution one component at a time with a depth-first search of the state-space tree. The moment a partial solution breaks a constraint, abandon it and go back to the last choice.',
    points: [
      'A solution is a tuple (x₁, x₂, …, xₙ). Explicit constraints fix the values each xᵢ may take, such as a column 1…N. Implicit constraints link the components, such as "no two queens attack".',
      'A bounding function, or promising test, checks a partial tuple. A non-promising node becomes dead and its whole subtree is never generated.',
      'The search order is depth-first, so only the current path needs to be kept in memory: O(n) space.',
      'It can stop at the first solution or keep going to list all solutions. The worst case is still exponential, but pruning usually removes most of the tree.',
    ],
    template: `Backtrack(k):                  // choose x[k]
  for each value v allowed for x[k]:
      if Promising(x[1..k−1], v):
          x[k] ← v
          if k = n: output x     // complete
          else Backtrack(k + 1)
  // loop ends → return = backtrack`,
    complexity: ['Worst case: the size of the state-space tree', 'N-Queens: at most N! placements in the worst case', 'Sum of subsets: O(2ⁿ) worst case', 'Space: O(depth) for the current path'],
    examples: ['N-Queens', 'Sum of subsets', 'Graph colouring', 'Hamiltonian cycle', 'Sudoku', 'Permutations'],
    proof: 'Completeness: every value of every component is tried unless the promising test rules it out. Soundness of pruning: the test may only reject partial solutions that cannot be extended to a valid one.',
    fails: 'On large instances with little pruning, it degenerates into exhaustive search.',
  },
  bnb: {
    title: 'Branch and bound', tagline: 'Search the state-space tree of an optimisation problem. For each node, compute a bound on the best value any completion could reach. Discard the node if that bound cannot beat the best complete solution found so far.',
    points: [
      'Branch: split a node into children by fixing one more decision, such as taking or leaving the next item.',
      'Bound: an optimistic estimate of the best completion. This is an upper bound when maximising and a lower bound when minimising. Here it is the fractional-knapsack value: allowing fractions can only increase the value, so it never underestimates.',
      'Incumbent: the best complete solution found so far. A node whose bound is no better than the incumbent is pruned.',
      'Live nodes wait in a list. The strategy picks the next E-node: FIFO uses a queue, LIFO a stack, and LC (least cost) picks the best bound first.',
    ],
    template: `BranchAndBound():              // maximise
  best ← −∞;  L ← { root }       // live nodes
  while L ≠ ∅:
      E ← Remove(L)              // FIFO / LIFO / LC
      if E is infeasible: discard
      else if E is complete:
          best ← max(best, value(E))
      else if Bound(E) ≤ best: prune
      else: add children of E to L
  return best`,
    complexity: ['Worst case: exponential (the whole tree)', 'In practice: depends on how tight the bound is', '0/1 knapsack tree: 2ⁿ⁺¹ − 1 nodes', 'TSP tree: (n − 1)! complete tours'],
    examples: ['0/1 knapsack', 'Travelling salesperson', 'Job assignment', '15-puzzle', 'Integer programming'],
    proof: 'The bound must be valid for every completion of the node. If it ever underestimates the true best (when maximising), the optimal solution could be pruned away.',
    fails: 'A weak or slow bound prunes little, and the search becomes exhaustive.',
  },
}

export function ParadigmExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [id, setId] = useState<ParadigmId>('overview')
  return <section className="panel">
    <div className="panel-heading"><div><span className="kicker">DESIGN STRATEGIES</span><h2>Algorithmic paradigms, from theory to a live run</h2><p>Start with the overview to see how the four paradigms relate, then open each one for its template, proof obligation and an algorithm that runs step by step.</p></div><span className="panel-icon"><GitBranch size={19}/></span></div>
    <Tabs value={id} onChange={setId} options={[{ id: 'overview', label: 'Overview' }, ...(Object.keys(info) as Exclude<ParadigmId, 'overview'>[]).map(k => ({ id: k, label: info[k].title }))]}/>
    {id === 'overview' ? <Overview onPick={setId}/> : <>
      <ParadigmTheory d={info[id]}/>
      <div className="u1-demo-head"><span className="kicker">LIVE DEMO</span><h3>{id === 'divide' ? 'Merge sort, one comparison at a time' : id === 'greedy' ? 'Coin change: greedy vs optimal' : id === 'backtracking' ? 'N-Queens and its state-space tree' : '0/1 knapsack with three search strategies'}</h3></div>
      {id === 'divide' && <MergeSortDemo onSteps={onSteps}/>}
      {id === 'greedy' && <CoinDemo onSteps={onSteps}/>}
      {id === 'backtracking' && <QueensDemo onSteps={onSteps}/>}
      {id === 'bnb' && <BranchBoundDemo onSteps={onSteps}/>}
      <div className="callout"><ShieldCheck size={16}/><p><strong>Proof obligation:</strong> {info[id].proof}</p></div>
      <div className="callout u1-callout-warn"><CircleHelp size={16}/><p><strong>When it fails:</strong> {info[id].fails}</p></div>
    </>}
  </section>
}

function ParadigmTheory({ d }: { d: Info }) {
  return <div className="u1-ptheory">
    <div>
      <span className="kicker">CORE IDEA</span><h3>{d.title}</h3><p className="u1-tagline">{d.tagline}</p>
      <ul className="u1-points">{d.points.map(p => <li key={p}>{p}</li>)}</ul>
      <div className="u1-chips"><span>Classic problems</span>{d.examples.map(e => <b key={e}>{e}</b>)}</div>
    </div>
    <div>
      <div className="u1-code-card"><small>GENERAL TEMPLATE</small><pre>{d.template}</pre></div>
      <div className="u1-code-card"><small>RUNNING TIME</small><ul>{d.complexity.map(c => <li key={c}>{c}</li>)}</ul></div>
    </div>
  </div>
}

/* ---------- Overview: comparison table + decision flowchart ---------- */
function Overview({ onPick }: { onPick: (p: ParadigmId) => void }) {
  const rows: [Exclude<ParadigmId, 'overview'>, string, string, string, string][] = [
    ['divide', 'Split into independent subproblems of the same kind, recurse, combine', 'Subproblems do not overlap', 'Induction + recurrence (Master theorem)', 'Merge sort, quick sort, binary search'],
    ['greedy', 'Take the locally best choice and never undo it', 'Greedy-choice property + optimal substructure', 'Exchange argument', 'Huffman, Kruskal, Prim, Dijkstra, fractional knapsack'],
    ['backtracking', 'DFS over partial solutions; abandon one as soon as it breaks a constraint', 'Constraint satisfaction: find one or all valid solutions', 'Exhaustive search with sound pruning', 'N-Queens, sum of subsets, graph colouring'],
    ['bnb', 'Search the tree; discard nodes whose bound cannot beat the best so far', 'Optimisation with a computable bound', 'Valid bound; FIFO / LIFO / LC order', '0/1 knapsack, TSP, job assignment'],
  ]
  return <div className="u1-overview">
    <div className="u1-table-wrap"><table className="u1-table">
      <thead><tr><th>Paradigm</th><th>Core idea</th><th>Use it when</th><th>Correctness / analysis</th><th>Classic examples</th></tr></thead>
      <tbody>{rows.map(([k, a, b, c, e]) => <tr key={k}><td><button className="link-btn" onClick={() => onPick(k)}>{info[k].title}</button></td><td>{a}</td><td>{b}</td><td>{c}</td><td>{e}</td></tr>)}</tbody>
    </table></div>
    <span className="u1-label">WHICH PARADIGM FITS? (click a result to open it)</span>
    <div className="u1-tree-scroll"><DecisionFlow onPick={onPick}/></div>
    <div className="u1-compare-two">
      <div><strong>Backtracking vs branch and bound</strong><ul>
        <li>Backtracking is for <b>feasibility</b> (find a valid solution). Branch and bound is for <b>optimisation</b> (find the best one).</li>
        <li>Backtracking prunes a node that breaks a <b>constraint</b>. Branch and bound also prunes a node whose <b>bound</b> cannot beat the incumbent.</li>
        <li>Backtracking almost always goes depth-first. Branch and bound may expand nodes in FIFO, LIFO or least-cost order.</li>
      </ul></div>
      <div><strong>Divide and conquer vs greedy</strong><ul>
        <li>Divide and conquer solves <b>every</b> subproblem and then combines them. Greedy commits to <b>one</b> choice and solves only what remains.</li>
        <li>Divide and conquer is proved by induction on the size. Greedy is proved by an exchange argument.</li>
        <li>When subproblems overlap and no greedy choice is safe, use dynamic programming (Unit IV).</li>
      </ul></div>
    </div>
  </div>
}

function DecisionFlow({ onPick }: { onPick: (p: ParadigmId) => void }) {
  const Q = ({ x, y, w, text }: { x: number; y: number; w: number; text: string[] }) => <g><rect x={x} y={y} width={w} height={20 + text.length * 14} rx={9} fill="#11233a" stroke="#3d6b86"/>{text.map((t, i) => <text key={i} x={x + w / 2} y={y + 22 + i * 14} textAnchor="middle" fontSize="11" fill="#e2f2ff">{t}</text>)}</g>
  const R = ({ x, y, label, sub, id, c }: { x: number; y: number; label: string; sub: string; id: ParadigmId; c: string }) => <g className="u1-flow-result" onClick={() => onPick(id)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onPick(id)}>
    <rect x={x} y={y} width={230} height={48} rx={10} fill="#0e2230" stroke={c} strokeWidth={2}/><text x={x + 115} y={y + 21} textAnchor="middle" fontSize="12" fill="#f0f8ff" fontWeight="600">{label}</text><text x={x + 115} y={y + 37} textAnchor="middle" fontSize="9.5" fill="#9fb2c6">{sub}</text></g>
  const A = ({ d, label, lx, ly }: { d: string; label?: string; lx?: number; ly?: number }) => <g><path d={d} fill="none" stroke="#4d6a84" strokeWidth={1.5} markerEnd="url(#u1-arrow)"/>{label && <text x={lx} y={ly} fontSize="10" fill="#9fb2c6">{label}</text>}</g>
  return <svg viewBox="0 0 760 330" className="u1-svg" style={{ minWidth: 640, maxWidth: 860 }} role="img" aria-label="Decision flowchart for choosing a paradigm">
    <defs><marker id="u1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#4d6a84"/></marker></defs>
    <Q x={20} y={20} w={250} text={['Can the problem be split into', 'independent smaller copies of itself?']}/>
    <A d="M270,44 H495" label="yes" lx={372} ly={38}/>
    <R x={500} y={20} label="Divide and conquer" sub="recurse, then combine" id="divide" c={SERIES[0]}/>
    <A d="M145,68 V108" label="no" lx={152} ly={92}/>
    <Q x={20} y={112} w={250} text={['Is it an optimisation problem', '(maximise or minimise a value)?']}/>
    <A d="M270,136 H495" label="no: just find valid solutions" lx={290} ly={130}/>
    <R x={500} y={112} label="Backtracking" sub="DFS + constraint pruning" id="backtracking" c={SERIES[4]}/>
    <A d="M145,160 V200" label="yes" lx={152} ly={184}/>
    <Q x={20} y={204} w={250} text={['Can you prove the locally best', 'choice is always safe?']}/>
    <A d="M270,228 H495" label="yes (exchange argument)" lx={300} ly={222}/>
    <R x={500} y={204} label="Greedy" sub="one irrevocable choice per step" id="greedy" c={SERIES[1]}/>
    <A d="M145,252 V282 H495" label="no" lx={152} ly={272}/>
    <R x={500} y={266} label="Branch and bound" sub="search with bounds (or DP)" id="bnb" c={SERIES[2]}/>
  </svg>
}

/* ---------- Divide and conquer: merge sort ---------- */
const msPresets: Record<string, { label: string; values: number[] }> = { mixed: { label: 'Mixed', values: [38, 27, 43, 3, 9, 82, 10, 15] }, sorted: { label: 'Already sorted', values: [3, 9, 10, 15, 27, 38, 43, 82] }, reverse: { label: 'Reverse sorted', values: [82, 43, 38, 27, 15, 10, 9, 3] } }
function MergeSortDemo({ onSteps }: { onSteps?: (k: number) => void }) {
  const [preset, setPreset] = useState('mixed')
  const input = msPresets[preset].values
  const ms = useMemo(() => mergeSortTrace(input), [preset])
  const p = usePlayer(ms.frames.length, preset, onSteps)
  const f = ms.frames[p.step]
  const cell = 74, gap = 6, rowH = 66, W = input.length * cell
  const phase = f.phase === 'merge' ? 'combine' : f.visibleDepth === ms.maxDepth ? 'conquer' : 'divide'
  const cur = f.node
  return <div className="u1-demo">
    <div className="u1-controls"><Tabs value={preset} onChange={setPreset} options={Object.entries(msPresets).map(([k, v]) => ({ id: k, label: v.label }))}/></div>
    <div className="u1-phases">{(['divide', 'conquer', 'combine'] as const).map((ph, i) => <span key={ph} className={phase === ph ? 'on' : ''}><b>{i + 1}</b>{ph === 'divide' ? 'Divide: split in half' : ph === 'conquer' ? 'Conquer: size 1 is sorted' : 'Combine: merge sorted halves'}</span>)}</div>
    <div className="u1-tree-scroll"><svg viewBox={`0 0 ${W} ${(ms.maxDepth + 1) * rowH}`} className="u1-svg" style={{ maxWidth: 680 }} role="img" aria-label="Merge sort recursion tree">
      {ms.nodes.filter(x => x.depth >= 1 && x.depth <= f.visibleDepth).map(x => { const parent = ms.nodes.find(q => q.depth === x.depth - 1 && q.lo <= x.lo && x.hi <= q.hi)!; const px = (parent.lo + parent.hi) / 2 * cell, cx = (x.lo + x.hi) / 2 * cell, active = cur === parent.key
        return <line key={`l${x.key}`} x1={px} y1={(x.depth - 1) * rowH + 42} x2={cx} y2={x.depth * rowH + 8} stroke={active ? '#f4c56a' : '#2f4560'} strokeWidth={active ? 2 : 1.2}/> })}
      {ms.nodes.filter(x => x.depth <= f.visibleDepth).map(x => {
        const isDone = f.phase === 'merge' && f.done[x.key] !== undefined, isCur = cur === x.key
        const vals = isCur ? [...f.out!, ...Array(x.hi - x.lo - f.out!.length).fill(null)] : isDone ? f.done[x.key] : input.slice(x.lo, x.hi)
        const xx = x.lo * cell + gap / 2, w = (x.hi - x.lo) * cell - gap, y = x.depth * rowH + 8
        return <g key={x.key}>
          <rect x={xx} y={y} width={w} height={34} rx={7} fill={isCur ? '#2a2412' : isDone ? '#10302a' : '#13273a'} stroke={isCur ? '#f4c56a' : isDone ? SERIES[2] : '#37536b'} strokeWidth={isCur ? 2 : 1}/>
          {vals.map((v, i) => <text key={i} x={xx + (w * (i + 0.5)) / vals.length} y={y + 21.5} fontSize="12" textAnchor="middle" fill={v === null ? '#4d657c' : '#e2f2ff'}>{v === null ? '·' : v}</text>)}
        </g>
      })}
    </svg></div>
    {f.phase === 'merge' && f.left && <div className="u1-merge">
      <div><small>LEFT RUN</small><div>{f.left.map((v, k) => <span key={k} className={k < f.i! ? 'used' : k === f.i ? 'ptr' : ''}>{v}</span>)}</div></div>
      <div><small>RIGHT RUN</small><div>{f.right!.map((v, k) => <span key={k} className={k < f.j! ? 'used' : k === f.j ? 'ptr' : ''}>{v}</span>)}</div></div>
      <div><small>OUTPUT</small><div>{[...f.out!, ...Array(f.left.length + f.right!.length - f.out!.length).fill(null)].map((v, k) => <span key={k} className={v === null ? 'empty' : 'out'}>{v ?? ''}</span>)}</div></div>
    </div>}
    <div className="stage-explanation"><strong>{f.title}</strong><p>{f.detail}</p></div>
    <PlayerBar p={p}/>
    <div className="graph-state-grid"><div><small>COMPARISONS SO FAR</small><strong>{f.comparisons} {p.step === p.last ? `(total ${ms.comparisons})` : ''}</strong></div><div><small>LEVELS · WORK PER LEVEL</small><strong>log₂ 8 = 3 · ≤ n per level</strong></div><div><small>RECURRENCE</small><strong>2T(n/2) + n = Θ(n log n)</strong></div></div>
    <p className="u1-small">Compare presets: an already-sorted input needs only 12 comparisons, because each merge empties one run early. The mixed input needs more. Either way the count stays within n·log₂ n = 24, so the order of the input never changes the Θ(n log n) growth.</p>
  </div>
}

/* ---------- Greedy: coin change ---------- */
const systems: Record<string, { label: string; coins: number[] }> = { us: { label: 'Coins 25 · 10 · 5 · 1', coins: [25, 10, 5, 1] }, bad: { label: 'Coins 4 · 3 · 1', coins: [4, 3, 1] }, odd: { label: 'Coins 10 · 6 · 1', coins: [10, 6, 1] } }
function CoinBar({ coins, amount, shown, color, label }: { coins: number[]; amount: number; shown: number; color: string; label: string }) {
  const unit = 600 / Math.max(amount, 1); let x = 0
  return <div className="u1-coinbar"><small>{label}</small>
    <svg viewBox="0 0 600 40" className="u1-svg" preserveAspectRatio="none" style={{ height: 40 }} role="img" aria-label={`${label}: ${coins.slice(0, shown).join(' + ') || 'nothing yet'}`}>
      <rect x={0} y={4} width={600} height={32} rx={6} fill="#132235" stroke="#27394d"/>
      {coins.slice(0, shown).map((c, i) => { const r = <g key={i}><rect x={x + 1} y={5} width={c * unit - 2} height={30} rx={5} fill={color} fillOpacity={0.85}/></g>; x += c * unit; return r })}
    </svg>
    <div className="u1-coinbar-labels">{coins.slice(0, shown).map((c, i) => <span key={i} style={{ flexGrow: c, borderColor: color }}>{c}</span>)}{shown < coins.length && <span className="rest" style={{ flexGrow: amount - coins.slice(0, shown).reduce((s, v) => s + v, 0) }}>left {amount - coins.slice(0, shown).reduce((s, v) => s + v, 0)}</span>}</div>
    <b>{shown} coin{shown === 1 ? '' : 's'}</b>
  </div>
}
function CoinDemo({ onSteps }: { onSteps?: (k: number) => void }) {
  const [sys, setSys] = useState('bad')
  const [amount, setAmount] = useState(6)
  const coins = systems[sys].coins
  const steps = useMemo(() => greedySteps(coins, amount), [sys, amount])
  const o = optimalCoins(coins, amount)
  const p = usePlayer(steps.length + 1, `${sys}-${amount}`, onSteps) // frame 0 = nothing chosen
  const shown = p.step, st = shown > 0 ? steps[shown - 1] : null, finished = shown === steps.length
  const data = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ amount: i + 1, greedy: greedyCoins(coins, i + 1).length, optimal: optimalCoins(coins, i + 1).length })), [sys])
  const fails = data.filter(d => d.greedy > d.optimal)
  return <div className="u1-demo">
    <div className="u1-controls"><Tabs value={sys} onChange={setSys} options={Object.entries(systems).map(([k, v]) => ({ id: k, label: v.label }))}/></div>
    <div className="input-row"><label>Amount to pay <strong>{amount}</strong></label><input type="range" min="1" max="30" value={amount} onChange={e => setAmount(Number(e.target.value))}/></div>
    <CoinBar coins={steps.map(s => s.coin)} amount={amount} shown={shown} color={SERIES[1]} label="Greedy: largest coin that fits, one choice per step"/>
    <CoinBar coins={o} amount={amount} shown={finished ? o.length : 0} color={SERIES[0]} label="Optimal: fewest coins (by dynamic programming), revealed at the end"/>
    <div className="stage-explanation"><strong>{st ? `Step ${shown}: take ${st.coin}` : `Pay ${amount} with coins ${coins.join(', ')}`}</strong><p>{st ? `Remaining ${st.before}. ${st.skipped.length ? `Coins ${st.skipped.join(', ')} are too large. ` : ''}The largest coin that fits is ${st.coin}, so greedy takes it and will never reconsider. Remaining ${st.after}.` : 'Press Next to watch greedy make its choices one at a time.'}{finished && (steps.length === o.length ? ` Greedy used ${steps.length} coins, which is optimal.` : ` Greedy used ${steps.length} coins, but ${o.length} is possible (${o.join(' + ')}). The first choice was locally best but globally wrong.`)}</p></div>
    <PlayerBar p={p} nextLabel="Next choice" label={`${shown} / ${steps.length} choices`}/>
    <div className={`sat-result ${fails.length ? 'sat-no' : ''}`}><strong>{fails.length ? `Greedy is not optimal for these coins` : 'Greedy is optimal for these coins'}</strong><span>{fails.length ? `It is beaten on ${fails.length} of the amounts 1–30 (${fails.slice(0, 8).map(d => d.amount).join(', ')}${fails.length > 8 ? ', …' : ''}). The greedy-choice property fails, so no exchange argument can exist.` : 'It matches the optimum for every amount from 1 to 30. For coin systems like this one an exchange argument proves greedy is always optimal.'}</span></div>
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

/* ---------- Backtracking: N-Queens + state-space tree ---------- */
function QueensDemo({ onSteps }: { onSteps?: (k: number) => void }) {
  const [N, setN] = useState(4)
  const ev = useMemo(() => queensTrace(N), [N])
  const tree = useMemo(() => queensTree(ev), [ev])
  const p = usePlayer(ev.length, N, onSteps)
  const e = ev[p.step], s = p.step
  const sofar = ev.slice(0, s + 1)
  const placed = sofar.filter(x => x.kind === 'place').length, rejected = sofar.filter(x => x.kind === 'reject').length, backs = sofar.filter(x => x.kind === 'backtrack').length
  const cs = 44, S = N * cs
  const msg = e.kind === 'place' ? `Row ${e.row + 1}, column ${e.col + 1} is safe: place a queen (new live node) and move down to row ${e.row + 2}.` : e.kind === 'reject' ? `Row ${e.row + 1}, column ${e.col + 1} is attacked by the queen in row ${e.attackers.map(a => a + 1).join(' and ')}. The node is non-promising, so it dies without children.` : e.kind === 'backtrack' ? `Every column in row ${e.row + 2} failed, so the queen at row ${e.row + 1}, column ${e.col + 1} is removed (that node dies) and the search tries the next column.` : `All ${N} queens are placed with no attacks. The green path in the tree is the solution.`
  // state-space tree drawing
  const sp = 18, rowH = 46, pad = 40, TW = Math.max(300, tree.leaves * sp + pad * 2), TH = (N + 1) * rowH + 10
  const X = (x: number) => pad + x * sp + sp / 2, Y = (d: number) => 18 + d * rowH
  const path = new Set<number>(); for (let k = tree.current[s]; k >= 0; k = tree.nodes[k].parent) path.add(k)
  const curNode = e.kind === 'place' || e.kind === 'reject' ? tree.nodes.find(n => n.born === s)?.id : e.kind === 'backtrack' ? tree.nodes.find(n => n.died === s && n.kind === 'place')?.id : tree.current[s]
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => { const el = scroller.current; if (!el || curNode === undefined) return; const target = (X(tree.nodes[curNode].x) / TW) * el.scrollWidth - el.clientWidth / 2; el.scrollLeft = Math.max(0, target) }, [s, N])
  const full = Array.from({ length: N + 1 }, (_, k) => N ** k).reduce((a, b) => a + b, 0)
  return <div className="u1-demo">
    <div className="u1-controls"><Tabs value={String(N)} onChange={v => setN(Number(v))} options={[4, 5, 6].map(k => ({ id: String(k), label: `${k}-Queens` }))}/></div>
    <div className="u1-queens">
      <div>
        <span className="u1-label">BOARD · ROW BY ROW</span>
        <svg viewBox={`0 0 ${S} ${S}`} className="u1-svg" style={{ maxWidth: 300 }} role="img" aria-label={`${N} by ${N} board. ${msg}`}>
          {Array.from({ length: N * N }, (_, k) => { const r = Math.floor(k / N), c = k % N; return <rect key={k} x={c * cs} y={r * cs} width={cs} height={cs} fill={(r + c) % 2 ? '#12202f' : '#182a3c'}/> })}
          {e.kind === 'reject' && e.attackers.map(a => <line key={a} x1={e.queens[a] * cs + cs / 2} y1={a * cs + cs / 2} x2={e.col * cs + cs / 2} y2={e.row * cs + cs / 2} stroke={SERIES[5]} strokeWidth={2} strokeDasharray="4 3"/>)}
          {e.kind !== 'solved' && <rect x={e.col * cs + 2} y={e.row * cs + 2} width={cs - 4} height={cs - 4} rx={5} fill="none" stroke={e.kind === 'place' ? SERIES[0] : e.kind === 'reject' ? SERIES[5] : SERIES[1]} strokeWidth={2.5} strokeDasharray={e.kind === 'backtrack' ? '5 3' : undefined}/>}
          {e.kind === 'reject' && <text x={e.col * cs + cs / 2} y={e.row * cs + cs / 2 + 6} textAnchor="middle" fontSize="18" fill={SERIES[5]}>×</text>}
          {e.kind === 'backtrack' && <text x={e.col * cs + cs / 2} y={e.row * cs + cs / 2 + 6} textAnchor="middle" fontSize="16" fill={SERIES[1]}>↩</text>}
          {e.queens.map((c, r) => <text key={r} x={c * cs + cs / 2} y={r * cs + cs / 2 + 8} textAnchor="middle" fontSize="24" fill={e.kind === 'solved' ? '#7af0c5' : '#e7f4ff'}>♛</text>)}
        </svg>
      </div>
      <div className="u1-queen-stats">
        <div><small>QUEENS PLACED</small><strong>{placed}</strong><span>live nodes created</span></div>
        <div><small>SQUARES REJECTED</small><strong>{rejected}</strong><span>non-promising, died at once</span></div>
        <div><small>BACKTRACKS</small><strong>{backs}</strong><span>placed, then undone</span></div>
        <div><small>TREE NODES GENERATED</small><strong>{placed + rejected + 1}</strong><span>of {full.toLocaleString()} in the full tree</span></div>
      </div>
    </div>
    <span className="u1-label">STATE-SPACE TREE · LEVEL k = QUEEN IN ROW k, NUMBER = ITS COLUMN</span>
    <Legend items={[{ id: 'l', label: 'On current path (live)', color: SERIES[0] }, { id: 'r', label: '× Rejected (non-promising)', color: SERIES[5] }, { id: 'b', label: 'Backtracked (dead)', color: '#5d738b', dash: true }, { id: 's', label: 'Solution path', color: SERIES[2] }]}/>
    <div className="u1-tree-scroll" ref={scroller}><svg width={TW < 640 ? undefined : TW} height={TW < 640 ? undefined : TH} viewBox={`0 0 ${TW} ${TH}`} style={TW < 640 ? { width: '100%', maxWidth: Math.round(TW * 1.9) } : undefined} className="u1-qtree" role="img" aria-label={`State-space tree after ${s + 1} steps`}>
      {Array.from({ length: N + 1 }, (_, d) => <text key={d} x={4} y={Y(d) + 4} fontSize="9" fill="#7c92aa">{d === 0 ? 'start' : `row ${d}`}</text>)}
      {tree.nodes.filter(n => n.id > 0 && n.born <= s).map(n => { const par = tree.nodes[n.parent], dead = n.died !== null && n.died <= s && n.kind === 'place'
        return <line key={`e${n.id}`} x1={X(par.x)} y1={Y(par.depth) + 9} x2={X(n.x)} y2={Y(n.depth) - (n.kind === 'reject' ? 5 : 9)} stroke={n.solution && s === p.last ? SERIES[2] : path.has(n.id) ? SERIES[0] : '#2a3d52'} strokeWidth={path.has(n.id) ? 2 : 1} strokeDasharray={dead ? '3 3' : undefined}/> })}
      {tree.nodes.filter(n => n.born <= s).map(n => {
        const x = X(n.x), y = Y(n.depth), isCur = n.id === curNode
        if (n.kind === 'reject') return <g key={n.id}><circle cx={x} cy={y} r={5} fill="#2a1520" stroke={SERIES[5]} strokeWidth={isCur ? 2.5 : 1}/><text x={x} y={y + 3} fontSize="8" textAnchor="middle" fill={SERIES[5]}>×</text><title>{`row ${n.depth}, column ${n.col + 1}: attacked`}</title></g>
        const dead = n.died !== null && n.died <= s, sol = n.solution && s === p.last, live = path.has(n.id)
        const stroke = sol ? SERIES[2] : live ? SERIES[0] : '#5d738b'
        return <g key={n.id}><circle cx={x} cy={y} r={n.kind === 'root' ? 7 : 9} fill={sol ? '#10302a' : live ? '#11304a' : '#121c28'} stroke={stroke} strokeWidth={isCur ? 3 : 1.5} strokeDasharray={dead ? '3 2' : undefined}/>{n.kind !== 'root' && <text x={x} y={y + 3.5} fontSize="9.5" textAnchor="middle" fill={dead ? '#7c92aa' : '#f0f8ff'}>{n.col + 1}</text>}<title>{n.kind === 'root' ? 'empty board' : `row ${n.depth}, column ${n.col + 1}${dead ? ' (backtracked)' : ''}`}</title></g>
      })}
    </svg></div>
    <div className="stage-explanation"><strong>{e.kind === 'solved' ? 'Solved' : e.kind === 'place' ? 'Promising: place and go deeper' : e.kind === 'reject' ? 'Non-promising: prune' : 'Dead end: backtrack'}</strong><p>{msg}</p></div>
    <PlayerBar p={p}/>
  </div>
}

/* ---------- Branch and bound: 0/1 knapsack ---------- */
const strategies: { id: BBStrategy; label: string; ds: string; desc: string }[] = [
  { id: 'lifo', label: 'LIFO (stack)', ds: 'stack · top first', desc: 'Depth-first: dives to a complete solution quickly, which gives an early incumbent for pruning.' },
  { id: 'fifo', label: 'FIFO (queue)', ds: 'queue · front first', desc: 'Breadth-first: expands level by level, so it reaches complete solutions late and prunes little.' },
  { id: 'lc', label: 'LC (best bound first)', ds: 'priority queue · highest bound first', desc: 'Least-cost search: always expands the most promising node, so it tends to find the optimum earliest.' },
]
function BranchBoundDemo({ onSteps }: { onSteps?: (k: number) => void }) {
  const cap = 8
  const [strategy, setStrategy] = useState<BBStrategy>('lifo')
  const bb = useMemo(() => branchAndBound(bbItems, cap, strategy), [strategy])
  const all = useMemo(() => strategies.map(s => { const r = branchAndBound(bbItems, cap, s.id); return { ...s, visited: r.visited.length, foundAt: r.visited.findIndex(v => v.status === 'leaf' && v.v === r.best) + 1 } }), [])
  const p = usePlayer(bb.visited.length, strategy, onSteps)
  const shown = bb.visited.slice(0, p.step + 1), cur = bb.visited[p.step]
  const S = strategies.find(s => s.id === strategy)!
  const D = bb.order.length, W = 640, rowH = 62, H = (D + 1) * rowH + 24
  const pos = (path: number[]) => { const d = path.length; const idx = path.reduce((s, b, k) => s + (1 - b) * 2 ** (d - 1 - k), 0); return { x: 70 + ((W - 80) * (idx + 0.5)) / 2 ** d, y: 20 + d * rowH } }
  const look = { expanded: { c: SERIES[0], sym: '' }, pruned: { c: SERIES[1], sym: '✂' }, infeasible: { c: SERIES[5], sym: '×' }, leaf: { c: SERIES[2], sym: '' } }
  const order = new Map(shown.map((x, k) => [x.id, k + 1]))
  const label = (id: string) => id === 'root' ? 'root' : id.split('').map(b => b === '1' ? 'Y' : 'N').join('')
  const maxV = Math.max(...all.map(a => a.visited))
  return <div className="u1-demo">
    <div className="item-table"><div className="item-row item-header"><span>Branch order (by value/weight)</span><span>Weight</span><span>Value</span><span>Value / weight</span></div>
      {bb.order.map((it, k) => <div className="item-row" key={it.name}><span>Level {k + 1}: {it.name}</span><span>{it.w}</span><span>{it.v}</span><span>{(it.v / it.w).toFixed(2)}</span></div>)}</div>
    <p className="u1-small">Capacity 8. Bound of a node = its value + the fractional-knapsack value of the remaining capacity, filled greedily with the items not yet decided.</p>
    <span className="u1-label">SEARCH STRATEGY · ORDER OF THE LIVE-NODE LIST</span>
    <Tabs value={strategy} onChange={setStrategy} options={strategies.map(s => ({ id: s.id, label: s.label }))}/>
    <p className="u1-small" style={{ marginTop: 0 }}>{S.desc}</p>
    <Legend items={[{ id: 'e', label: 'Expanded (bound beats best)', color: SERIES[0] }, { id: 'p', label: '✂ Pruned by bound', color: SERIES[1] }, { id: 'i', label: '× Over capacity', color: SERIES[5] }, { id: 'l', label: 'Complete solution (w = weight)', color: SERIES[2] }]}/>
    <p className="u1-small">Left branch = take the item, right branch = leave it. #k beside a node is the order in which it was taken from the live list.</p>
    <div className="u1-bb">
      <div className="u1-tree-scroll"><svg viewBox={`0 0 ${W} ${H}`} className="u1-svg u1-tree" style={{ maxWidth: 780 }} role="img" aria-label={`Branch and bound tree, ${shown.length} nodes visited so far`}>
        {bb.order.map((it, k) => <text key={k} x={4} y={20 + k * rowH + rowH / 2 + 4} fontSize="9" fill="#7c92aa">take {it.name.replace('Item ', '#')}?</text>)}
        {shown.filter(x => x.depth > 0).map(x => { const a = pos(x.path.slice(0, -1)), b = pos(x.path); return <g key={`e${x.id}`}><line x1={a.x} y1={a.y + 13} x2={b.x} y2={b.y - 13} stroke="#2f4560" strokeWidth={1.2}/>{x.depth < D && <text x={a.x + (b.x - a.x) * 0.42 + (x.path[x.path.length - 1] ? -6 : 6)} y={a.y + (b.y - a.y) * 0.42 + 3} fontSize="9" textAnchor={x.path[x.path.length - 1] ? 'end' : 'start'} fill="#7c92aa">{x.path[x.path.length - 1] ? 'yes' : 'no'}</text>}</g> })}
        {shown.map(x => { const q = pos(x.path), L = look[x.status], isCur = x.id === cur.id, isBest = x.status === 'leaf' && x.v === bb.best && p.step === p.last
          return <g key={x.id}>
            <circle cx={q.x} cy={q.y} r={13} fill={x.status === 'leaf' ? '#10302a' : '#101d2c'} stroke={L.c} strokeWidth={isCur || isBest ? 3 : 1.5} strokeDasharray={x.status === 'pruned' ? '3 2' : undefined}><title>{x.note}</title></circle>
            <text x={q.x} y={q.y + 3.5} fontSize="10" textAnchor="middle" fill="#e7f4ff">{L.sym || x.v}</text>
            {x.depth === D ? <text x={q.x} y={q.y + (x.status === 'leaf' ? 37 : 26)} fontSize="8.5" textAnchor="middle" fill="#67d9ff">#{order.get(x.id)}</text> : <text x={q.x - 16} y={q.y - 9} fontSize="8.5" textAnchor="end" fill="#67d9ff">#{order.get(x.id)}</text>}
            {x.status !== 'infeasible' && x.status !== 'leaf' && <text x={q.x + 17} y={q.y + 3} fontSize="8.5" fill="#8fa3b9">≤{Number.isInteger(x.bound) ? x.bound : x.bound.toFixed(1)}</text>}
            {x.status === 'leaf' && <text x={q.x} y={q.y + 26} fontSize="8.5" textAnchor="middle" fill="#8fa3b9">w{x.w}</text>}
          </g> })}
      </svg></div>
      <div className="u1-live">
        <small>LIVE NODES ({S.ds})</small>
        {cur.live.length ? cur.live.map((l, k) => <div key={l.id} className={k === 0 ? 'next' : ''}><b>{label(l.id)}</b><span>{l.bound === null ? 'over capacity' : `bound ≤ ${Number.isInteger(l.bound) ? l.bound : l.bound.toFixed(1)}`}</span>{k === 0 && <em>next</em>}</div>) : <p>Empty: the search is finished.</p>}
      </div>
    </div>
    <div className="stage-explanation"><strong>E-node {label(cur.id)}: weight {cur.w}, value {cur.v}</strong><p>{cur.note}</p></div>
    <PlayerBar p={p} nextLabel="Next node"/>
    <div className="graph-state-grid"><div><small>BEST SO FAR (INCUMBENT)</small><strong>{cur.incumbent}</strong></div><div><small>NODES TAKEN FROM THE LIST</small><strong>{shown.length} of {bb.fullTree} in the full tree</strong></div><div><small>INSIDE EACH NODE</small><strong>value so far · ≤ bound</strong></div></div>
    <span className="u1-label">SAME PROBLEM, THREE STRATEGIES (ALL FIND 45)</span>
    <div className="u1-strat-bars">{all.map(a => <div key={a.id} className={a.id === strategy ? 'on' : ''}><span>{a.label}</span><i><b style={{ width: `${(a.visited / maxV) * 100}%` }}/></i><em>{a.visited} nodes · optimum found at node {a.foundAt}</em></div>)}</div>
    {p.step === p.last && <div className="callout"><CircleHelp size={16}/><p>Optimum {bb.best} after {bb.visited.length} of {bb.fullTree} nodes. It matches the dynamic-programming answer for the same items in Unit 4, but branch and bound never expanded the branches whose bound could not win.</p></div>}
  </div>
}