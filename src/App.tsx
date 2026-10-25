import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDown, ArrowLeft, ArrowRight, BookOpen, BrainCircuit, Check,
  ChevronDown, CircleHelp, Clock3, Code2, Cpu, Download, GitBranch, GraduationCap,
  Layers3, ListChecks, Network, Pause, Play, RotateCcw, Save, Search, Send,
  Settings2, ShieldCheck, Sparkles, Target, Users, Waypoints, Zap
} from 'lucide-react'
import { StudentPanel } from './components/StudentPanel'
import { TeacherDashboard } from './components/TeacherDashboard'
import { slug, topicStats, useActivityTracker, useDB, withActivity, withAttempt, withStudent, type TopicRef } from './domain/tracking'
import { RamExplorer } from './components/unit1/RamExplorer'
import { AsymptoticExplorer } from './components/unit1/AsymptoticExplorer'
import { ComplexityExplorer } from './components/unit1/ComplexityExplorer'
import { ParadigmExplorer } from './components/unit1/ParadigmExplorer'
import { Unit1Theory, hasUnit1Theory } from './components/unit1/TheoryNotes'
import { SortingExplorer } from './components/unit2/SortingExplorer'
import { LinearSortExplorer } from './components/unit2/LinearSortExplorer'
import { TreeExplorer } from './components/unit2/TreeExplorer'
import { HeapExplorer } from './components/unit2/HeapExplorer'
import { HashExplorer } from './components/unit2/HashExplorer'
import { StringExplorer } from './components/unit2/StringExplorer'
import { Unit2Theory, hasUnit2Theory } from './components/unit2/Unit2Theory'

type UnitId = 'u1' | 'u2' | 'u3' | 'u4' | 'u5'
type Mode = 'explore' | 'student' | 'teacher'
type Topic = { id: string; title: string; subtitle: string; description: string; complexity: string; tags: string[] }
type Unit = { id: UnitId; number: string; title: string; short: string; description: string; topics: Topic[] }

const units: Unit[] = [
  { id: 'u1', number: '01', title: 'Algorithm analysis', short: 'Foundations', description: 'Model computation, count operations, and justify asymptotic bounds.', topics: [
    { id: 'ram', title: 'RAM model', subtitle: 'Primitive operations & memory', description: 'Treat basic operations as unit-cost steps, then make the assumptions behind a count explicit.', complexity: 'Cost model', tags: ['unit-cost assumptions', 'operation count'] },
    { id: 'asymptotic', title: 'Asymptotic notation', subtitle: 'Compare growth rates', description: 'Compare upper, lower, and tight bounds without confusing them with best-, average-, and worst-case inputs.', complexity: 'O · Ω · Θ', tags: ['growth', 'bounds'] },
    { id: 'complexity', title: 'Complexity analysis', subtitle: 'Trace → count → derive', description: 'Translate loop and recursion structure into a count, then keep the dominant term.', complexity: 'T(n), S(n)', tags: ['loops', 'recurrences'] },
    { id: 'paradigms', title: 'Algorithmic paradigms', subtitle: 'Choose a strategy', description: 'Understand the proof obligations behind divide and conquer, greedy, backtracking, and branch and bound.', complexity: 'Strategy', tags: ['design', 'correctness'] },
  ]},
  { id: 'u2', number: '02', title: 'Searching & sorting', short: 'Data structures', description: 'Sorting with worst- and average-case analysis, linear-time sorts, balanced search trees, heaps, hashing and string matching.', topics: [
    { id: 'sorting', title: 'Comparison sorting', subtitle: 'Quick · merge · heap sort', description: 'Step through quick, merge and heap sort, then compare their worst- and average-case behaviour using real comparison counts.', complexity: 'Θ(n log n) avg · quick sort Θ(n²) worst', tags: ['quick sort', 'merge sort', 'heap sort', 'worst vs average case'] },
    { id: 'linear', title: 'Linear-time sorting', subtitle: 'Counting · radix · bucket sort', description: 'Sort without comparing keys, and see why comparison sorts can never beat Ω(n log n).', complexity: 'Θ(n + k)', tags: ['counting sort', 'radix sort', 'bucket sort', 'lower bound'] },
    { id: 'trees', title: 'Search trees', subtitle: 'BST · AVL · red-black · B-tree', description: 'Insert, search and delete step by step, and watch rotations, recolourings and node splits keep the tree balanced.', complexity: 'O(log n) when balanced', tags: ['BST property', 'rotation', 'black-height', 'node split'] },
    { id: 'heaps', title: 'Heaps & priority queues', subtitle: 'Insert · extract · build-heap', description: 'Run priority-queue operations on a binary heap and see the tree and its array change together.', complexity: 'O(log n) per operation · build Θ(n)', tags: ['heap property', 'sift up / down', 'priority queue'] },
    { id: 'hashing', title: 'Hashing', subtitle: 'Chaining & open addressing', description: 'Hash keys into a table, resolve collisions four different ways and watch the load factor drive the cost.', complexity: 'Expected Θ(1 + α)', tags: ['hash function', 'collisions', 'load factor', 'probing'] },
    { id: 'matching', title: 'String matching', subtitle: 'KMP & Boyer–Moore', description: 'Slide a pattern along a text and see how preprocessing decides how far each mismatch lets you jump.', complexity: 'KMP Θ(n + m)', tags: ['prefix function', 'bad character', 'good suffix'] },
  ]},
  { id: 'u3', number: '03', title: 'Graph algorithms', short: 'Graph traversal', description: 'Move from graph representation to traversal order, DAG ordering, and shortest paths.', topics: [
    { id: 'representations', title: 'Representations', subtitle: 'Adjacency list & matrix', description: 'Compare storage costs and which representation suits sparse or dense graphs.', complexity: 'List O(V + E)', tags: ['vertices', 'edges'] },
    { id: 'traversal', title: 'BFS & DFS', subtitle: 'Queue vs stack', description: 'Reveal visit order, frontier state, parent links, and connected components.', complexity: 'O(V + E)', tags: ['queue', 'stack', 'visited'] },
    { id: 'topological', title: 'Topological order', subtitle: 'DAG dependencies', description: 'Produce an ordering where every directed edge points from earlier to later.', complexity: 'O(V + E)', tags: ['DAG', 'indegree'] },
    { id: 'shortest', title: 'Single-source shortest path', subtitle: 'Relax edges', description: 'Trace distance estimates and predecessor changes during relaxation.', complexity: 'Dijkstra O((V+E) log V)', tags: ['distance', 'relaxation'] },
  ]},
  { id: 'u4', number: '04', title: 'Greedy & dynamic programming', short: 'Optimization', description: 'Compare local-choice strategies with state-based optimization and reconstruction.', topics: [
    { id: 'mst', title: 'Minimum spanning trees', subtitle: 'Kruskal & Prim', description: 'Build a spanning tree while avoiding cycles or growing from a frontier.', complexity: 'O(E log V)', tags: ['cut property', 'cycle'] },
    { id: 'greedy', title: 'Greedy algorithms', subtitle: 'Dijkstra · knapsack · Huffman', description: 'Test feasibility, choose locally, and identify the proof property that makes a greedy choice safe.', complexity: 'Problem-dependent', tags: ['choice property', 'exchange argument'] },
    { id: 'dp', title: 'Dynamic programming', subtitle: 'State · recurrence · table', description: 'Define states, establish a recurrence, fill a table in dependency order, and reconstruct a solution.', complexity: 'States × transitions', tags: ['memoization', 'tabulation'] },
  ]},
  { id: 'u5', number: '05', title: 'Complexity & intractability', short: 'Limits of computation', description: 'Classify decision problems, reason about reductions, and inspect combinatorial search.', topics: [
    { id: 'pnp', title: 'P, NP & NP-completeness', subtitle: 'Decision problems', description: 'Distinguish solving a problem from verifying a proposed certificate in polynomial time.', complexity: 'Complexity classes', tags: ['certificate', 'verification'] },
    { id: 'reductions', title: 'Polynomial reductions', subtitle: 'Transform problems', description: 'Use a polynomial-time transformation to transfer hardness from one problem to another.', complexity: 'A ≤p B', tags: ['mapping', 'hardness'] },
    { id: 'sat', title: 'SAT & Hamiltonian cycle', subtitle: 'Certificates and constraints', description: 'Evaluate Boolean assignments and understand what makes a candidate satisfy a decision problem.', complexity: 'Exponential search', tags: ['CNF', 'cycle'] },
    { id: 'tsp', title: 'Travelling salesperson', subtitle: 'Exact search & bounds', description: 'Compare candidate tours and understand why pruning and approximation matter as instances grow.', complexity: 'Factorial brute force', tags: ['tour', 'branch and bound'] },
  ]},
]

function App() {
  const [mode, setMode] = useState<Mode>('explore')
  const [activeUnit, setActiveUnit] = useState<UnitId>('u1')
  const [activeTopic, setActiveTopic] = useState('ram')
  const [n, setN] = useState(8)
  const [step, setStep] = useState(0)
  const [graphAlgorithm, setGraphAlgorithm] = useState<'bfs' | 'dfs'>('bfs')
  const [graphStart, setGraphStart] = useState(0)
  const [knapsackMode, setKnapsackMode] = useState<'greedy' | 'dp'>('dp')
  const [search, setSearch] = useState('')
  const [showTheory, setShowTheory] = useState(true)
  const [quickReveal, setQuickReveal] = useState(false)
  const [db, updateDB] = useDB()
  const [studentName, setStudentName] = useState(() => { try { return localStorage.getItem('daalab-student') ?? '' } catch { return '' } })

  const unit = units.find(u => u.id === activeUnit)!
  const topic = units.flatMap(u => u.topics).find(t => t.id === activeTopic) ?? unit.topics[0]
  const topicRefs: TopicRef[] = units.flatMap(u => u.topics.map(t => ({ id: t.id, title: t.title, unit: `Unit ${u.number}` })))
  const studentId = slug(studentName)
  const student = db.students[studentId] ?? null
  useActivityTracker(updateDB, student ? studentId : null, mode === 'explore', activeTopic, step)
  const login = (name: string) => { updateDB(d => withStudent(d, name)); setStudentName(name.trim()); try { localStorage.setItem('daalab-student', name.trim()) } catch { /* ignore */ } }
  const logout = () => { setStudentName(''); try { localStorage.removeItem('daalab-student') } catch { /* ignore */ } }
  const openVisualizer = (topicId: string) => { setTopic(topicId); setMode('explore') }
  /** Forward steps taken inside the Unit 1 steppers count toward the signed-in student's activity. */
  const recordSteps = (k: number) => { if (student && mode === 'explore') updateDB(d => withActivity(d, studentId, activeTopic, 0, k)) }

  const setTopic = (topicId: string, unitId?: UnitId) => {
    const parent = units.find(u => u.topics.some(t => t.id === topicId))
    setActiveTopic(topicId); setActiveUnit(unitId ?? parent?.id ?? 'u1'); setStep(0); setQuickReveal(false)
  }
  const filteredUnits = units.map(u => ({ ...u, topics: u.topics.filter(t => `${t.title} ${t.subtitle} ${t.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())) })).filter(u => u.topics.length)
  const topicIndex = units.flatMap(u => u.topics).findIndex(t => t.id === activeTopic)
  const allTopics = units.flatMap(u => u.topics)
  const masteredPct = student ? Math.round(100 * allTopics.filter(t => (topicStats(student, t.id).mastery ?? 0) >= 75).length / allTopics.length) : 0


  const graph = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [3, 5], [4, 5]]
  const graphTraversal = useMemo(() => {
    const adj = Array.from({ length: 6 }, () => [] as number[])
    graph.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a) })
    const seen = new Set<number>(), order: number[] = [], frames: { node: number; frontier: number[]; visited: number[]; note: string }[] = []
    const frontier = [graphStart]; seen.add(graphStart)
    while (frontier.length) {
      const node = graphAlgorithm === 'bfs' ? frontier.shift()! : frontier.pop()!
      order.push(node); frames.push({ node, frontier: [...frontier], visited: [...order], note: `${graphAlgorithm.toUpperCase()} visits vertex ${node}. Its unvisited neighbours are considered in ascending order.` })
      const next = graphAlgorithm === 'bfs' ? adj[node] : [...adj[node]].reverse()
      for (const v of next) if (!seen.has(v)) { seen.add(v); frontier.push(v) }
    }
    return { order, frames }
  }, [graphAlgorithm, graphStart])

  const items = [{ w: 2, v: 12 }, { w: 3, v: 20 }, { w: 4, v: 24 }, { w: 5, v: 25 }]
  const dpTable = useMemo(() => { const cap = 8; const table = Array.from({ length: items.length + 1 }, () => Array(cap + 1).fill(0)); for (let i = 1; i <= items.length; i++) for (let w = 0; w <= cap; w++) table[i][w] = items[i - 1].w <= w ? Math.max(table[i - 1][w], items[i - 1].v + table[i - 1][w - items[i - 1].w]) : table[i - 1][w]; return table }, [])

  const changeMode = (next: Mode) => setMode(next)

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Waypoints size={23}/></div><div><strong>DAA<span>LAB</span></strong><small>ALGORITHM STUDIO</small></div></div>
      <div className="course-chip"><span className="live-dot"/> DESIGN & ANALYSIS OF ALGORITHMS <ChevronDown size={13}/></div>
      <div className="side-label">COURSE CONTENT <span>{allTopics.length} TOPICS</span></div>
      <div className="search-wrap"><Search size={15}/><input aria-label="Search topics" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a topic…"/></div>
      <nav className="unit-nav">{filteredUnits.map(u => <div className="unit-group" key={u.id}><button className={`unit-link ${activeUnit === u.id ? 'unit-active' : ''}`} onClick={() => { setActiveUnit(u.id); if (!u.topics.some(t => t.id === activeTopic)) setTopic(u.topics[0].id, u.id) }}><span className="unit-number">{u.number}</span><span className="unit-title">{u.title}</span><span className="unit-progress">{u.topics.filter(t => student && (topicStats(student, t.id).mastery ?? 0) >= 75).length}/{u.topics.length}</span></button>{activeUnit === u.id && <div className="topic-links">{u.topics.map(t => <button key={t.id} className={`topic-link ${activeTopic === t.id ? 'topic-active' : ''}`} onClick={() => setTopic(t.id, u.id)}><span className="topic-dot"/><span>{t.title}</span></button>)}</div>}</div>)}</nav>
      <div className="sidebar-bottom"><div className="side-progress-head"><span>TOPICS MASTERED</span><strong>{masteredPct}%</strong></div><div className="progress-track"><span style={{ width: `${masteredPct}%` }}/></div><p>Mastered = 75%+ on recent practice. Solve problems to build your profile.</p><div className="sidebar-user"><div className="avatar"><GraduationCap size={18}/></div><div><strong>{student?.name ?? 'Not signed in'}</strong><small>{student ? 'Progress is tracked' : 'Open Student mode to start'}</small></div><Settings2 size={16}/></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><span>COURSE</span><ArrowRight size={13}/><span>{unit.number} / {unit.title.toUpperCase()}</span><ArrowRight size={13}/><strong>{topic.title}</strong></div><div className="topbar-right"><span className="status-pill"><span className="live-dot"/> INTERACTIVE LAB</span><div className="mode-switch" role="group" aria-label="Workspace mode"><button className={mode === 'explore' ? 'selected' : ''} onClick={() => changeMode('explore')}><Sparkles size={14}/> Explore</button><button className={mode === 'student' ? 'selected' : ''} onClick={() => changeMode('student')}><GraduationCap size={14}/> Student</button><button className={mode === 'teacher' ? 'selected' : ''} onClick={() => changeMode('teacher')}><BookOpen size={14}/> Teacher</button></div></div></header>
      <div className="content-area">
        <section className="hero-card"><div className="hero-copy"><div className="eyebrow"><span/> UNIT {unit.number} <span className="eyebrow-divider">/</span> {unit.short.toUpperCase()}</div><h1>{topic.title}<br/><span>{topic.subtitle.toLowerCase()}.</span></h1><p>{topic.description}</p><div className="hero-pills"><span><Check size={13}/> Interactive experiments</span><span><Check size={13}/> Step-by-step reasoning</span><span><Check size={13}/> Complexity insights</span></div></div><div className="hero-art"><div className="art-orbit orbit-a"/><div className="art-orbit orbit-b"/><div className="art-core"><Network size={30}/><small>TRACE</small></div><div className="art-node node-1">O(n)</div><div className="art-node node-2">{unit.number}</div><div className="art-node node-3"><GitBranch size={17}/></div><div className="art-caption">MODEL <span>→</span> EXECUTE <span>→</span> PROVE</div></div></section>

        {mode === 'teacher' && <TeacherDashboard db={db} update={updateDB} topics={topicRefs} onOpenVisualizer={openVisualizer}/>}
        {mode === 'student' && <StudentPanel db={db} student={student} topics={topicRefs} activeTopic={activeTopic} onLogin={login} onLogout={logout} onAttempt={a => updateDB(d => withAttempt(d, studentId, a))} onOpenVisualizer={openVisualizer}/>}

        {mode === 'explore' && <>
          <section className="learning-toolbar"><div><span className="kicker">CONCEPT WORKSPACE</span><h2>Learn by changing the input</h2></div><button className="quiet-button" onClick={() => setShowTheory(v => !v)}><BookOpen size={15}/>{showTheory ? 'Hide' : 'Show'} theory</button></section>
          {showTheory && <section className="theory-strip"><div className="theory-icon"><BrainCircuit size={19}/></div><div><span className="kicker">THE IDEA</span><p>{theoryFor(activeTopic)}</p><div className="tag-row">{topic.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div><div className="theory-complexity"><small>COMPLEXITY / KEY PROPERTY</small><strong>{topic.complexity}</strong></div></section>}
          {showTheory && hasUnit1Theory(activeTopic) && <Unit1Theory topic={activeTopic}/>}
          {showTheory && hasUnit2Theory(activeTopic) && <Unit2Theory topic={activeTopic}/>}

          {activeTopic === 'ram' && <RamExplorer onSteps={recordSteps}/>}
          {activeTopic === 'asymptotic' && <AsymptoticExplorer/>}
          {activeTopic === 'complexity' && <ComplexityExplorer onSteps={recordSteps}/>}
          {activeTopic === 'paradigms' && <ParadigmExplorer onSteps={recordSteps}/>}

          {activeTopic === 'sorting' && <SortingExplorer onSteps={recordSteps}/>}
          {activeTopic === 'linear' && <LinearSortExplorer onSteps={recordSteps}/>}
          {activeTopic === 'trees' && <TreeExplorer onSteps={recordSteps}/>}
          {activeTopic === 'heaps' && <HeapExplorer onSteps={recordSteps}/>}
          {activeTopic === 'hashing' && <HashExplorer onSteps={recordSteps}/>}
          {activeTopic === 'matching' && <StringExplorer onSteps={recordSteps}/>}
          {activeTopic === 'representations' && <RepresentationExplorer/>}
          {(activeTopic === 'traversal' || activeTopic === 'topological' || activeTopic === 'shortest') && <section className="panel"><div className="panel-heading"><div><span className="kicker">GRAPH EXECUTION</span><h2>{activeTopic === 'traversal' ? 'BFS vs DFS frontier' : activeTopic === 'topological' ? 'Topological ordering' : 'Shortest-path relaxation'}</h2><p>Small graph chosen to make the state of the algorithm visible at every step.</p></div><span className="panel-icon"><Network size={19}/></span></div>{activeTopic === 'traversal' ? <><div className="sort-controls"><label>Traversal<select value={graphAlgorithm} onChange={e => { setGraphAlgorithm(e.target.value as typeof graphAlgorithm); setStep(0) }}><option value="bfs">Breadth-first search (queue)</option><option value="dfs">Depth-first search (stack)</option></select></label><label>Start vertex<select value={graphStart} onChange={e => { setGraphStart(Number(e.target.value)); setStep(0) }}>{[0,1,2,3,4,5].map(v => <option key={v} value={v}>Vertex {v}</option>)}</select></label></div><GraphView edges={graph} visited={graphTraversal.frames[Math.min(step, graphTraversal.frames.length - 1)]?.visited ?? []} current={graphTraversal.frames[Math.min(step, graphTraversal.frames.length - 1)]?.node ?? graphStart}/><div className="graph-state-grid"><div><small>VISIT ORDER</small><strong>{graphTraversal.order.slice(0, step + 1).join(' → ') || '—'}</strong></div><div><small>FRONTIER SIZE</small><strong>{graphTraversal.frames[Math.min(step, graphTraversal.frames.length - 1)]?.frontier.length ?? 0}</strong></div><div><small>COMPLEXITY</small><strong>O(V + E)</strong></div></div><div className="stage-explanation"><strong>{graphTraversal.frames[Math.min(step, graphTraversal.frames.length - 1)]?.note}</strong></div><div className="step-controls"><button className="btn btn-secondary" onClick={() => setStep(0)}><RotateCcw size={14}/> Reset</button><button className="btn btn-secondary" disabled={step === 0} onClick={() => setStep(s => s - 1)}><ArrowLeft size={14}/> Previous</button><button className="btn btn-primary" disabled={step >= graphTraversal.frames.length - 1} onClick={() => setStep(s => s + 1)}>Next visit <ArrowRight size={14}/></button></div></> : activeTopic === 'topological' ? <TopologicalExplorer/> : <ShortestPathExplorer/>}</section>}
          {activeTopic === 'mst' && <MSTExplorer/>}
          {activeTopic === 'greedy' && <section className="panel"><div className="panel-heading"><div><span className="kicker">GREEDY CHOICE LAB</span><h2>Fractional knapsack</h2><p>Compare choosing by value-to-weight ratio with taking items in the listed order.</p></div><span className="panel-icon"><Zap size={19}/></span></div><div className="input-row"><label>Capacity <strong>{n}</strong></label><input type="range" min="2" max="12" value={n} onChange={e => setN(Number(e.target.value))}/></div><div className="item-table"><div className="item-row item-header"><span>Item</span><span>Weight</span><span>Value</span><span>Value / weight</span></div>{items.map((it, i) => <div className="item-row" key={it.w}><span>Item {i + 1}</span><span>{it.w}</span><span>{it.v}</span><span>{(it.v / it.w).toFixed(2)}</span></div>)}</div><div className="callout"><CircleHelp size={16}/><p>Fractional knapsack admits the ratio-based greedy strategy. The same greedy choice is not generally optimal for 0/1 knapsack; use dynamic programming or another exact method.</p></div></section>}
          {activeTopic === 'dp' && <section className="panel"><div className="panel-heading"><div><span className="kicker">DYNAMIC PROGRAMMING TABLE</span><h2>0/1 knapsack: fill the states</h2><p>Each cell stores the best value using the first i items at capacity w.</p></div><span className="panel-icon"><Layers3 size={19}/></span></div><div className="dp-table-wrap"><table className="dp-table"><thead><tr><th>i \ w</th>{dpTable[0].map((_, w) => <th key={w}>{w}</th>)}</tr></thead><tbody>{dpTable.map((row, i) => <tr key={i}><th>{i === 0 ? 'None' : `Item ${i}`}</th>{row.map((v, w) => <td key={w} className={i === dpTable.length - 1 && w === 8 ? 'dp-highlight' : ''}>{v}</td>)}</tr>)}</tbody></table></div><div className="definition-grid"><div><strong>State</strong><span>dp[i][w] = best value</span></div><div><strong>Choice</strong><span>Skip or take item i</span></div><div><strong>Answer</strong><span>dp[4][8] = {dpTable[4][8]}</span></div></div><div className="formula-card"><strong>dp[i][w] = max(skip, valueᵢ + dp[i−1][w−weightᵢ])</strong><span>Take only when the item fits; otherwise inherit the previous row.</span></div></section>}
          {(activeTopic === 'pnp' || activeTopic === 'reductions') && <ComplexityClassExplorer topic={activeTopic}/>}
          {activeTopic === 'sat' && <SATExplorer/>}
          {activeTopic === 'tsp' && <TSPExplorer/>}
          {!['ram', 'asymptotic', 'complexity', 'paradigms', 'sorting', 'linear', 'trees', 'heaps', 'hashing', 'matching', 'representations', 'traversal', 'topological', 'shortest', 'mst', 'greedy', 'dp', 'pnp', 'reductions', 'sat', 'tsp'].includes(activeTopic) && <div className="panel"><h2>{topic.title}</h2><p>{topic.description}</p></div>}
        </>}

        <section className="bottom-learning"><div className="bottom-icon"><Code2 size={19}/></div><div><span className="kicker">MAKE THE REASONING EXPLICIT</span><h3>Model → execute → explain → analyze</h3><p>Use the simulator to build intuition, then switch to Student mode to practice with auto-graded problems or Teacher mode to see class analytics.</p></div><button className="btn btn-secondary" onClick={() => changeMode(mode === 'student' ? 'explore' : mode === 'teacher' ? 'student' : 'student')}>{mode === 'student' ? 'Back to explore' : 'Open practice'} <ArrowRight size={14}/></button></section>
        <footer className="app-footer"><span>DAA LAB · FIVE-UNIT INTERACTIVE COURSE</span><span>Prototype build · Browser-local data · No server accounts</span></footer>
      </div>
    </main>
  </div>
}

function theoryFor(id: string) {
  const text: Record<string, string> = {
    ram: 'An algorithm runs on an abstract machine. Count primitive operations under explicit unit-cost assumptions rather than equating source-code lines with real elapsed time.', asymptotic: 'Asymptotic notation describes how functions compare for sufficiently large input sizes. O is an upper bound, Ω is a lower bound, and Θ is a tight bound.', complexity: 'Identify the basic operation, count how often it executes, express the count as T(n), then simplify to the dominant asymptotic term.', paradigms: 'Algorithmic paradigms are reusable design strategies. Their correctness comes from invariants, recurrences, exchange arguments, or sound pruning—not from the strategy name alone.', sorting: 'Comparison sorts learn the order only by comparing keys. Quick sort does its work while partitioning, merge sort while merging, heap sort by repeatedly extracting the maximum. All average Θ(n log n); only quick sort has a Θ(n²) worst case.', trees: 'A search tree supports search, insert and delete in O(height). Plain BSTs can degenerate to height n; AVL and red-black trees rebalance with rotations, and B-trees split full nodes, to keep the height logarithmic.', linear: 'Counting, radix and bucket sort use key values as positions instead of comparing keys, so they sidestep the Ω(n log n) comparison lower bound under assumptions about the keys.', heaps: 'A binary heap is a complete binary tree stored in an array, with every parent at least as large as its children (max-heap). It supports insert and extract-max in O(log n) and can be built in Θ(n).', hashing: 'A hash function maps each key to a table slot so lookups take expected constant time. Collisions are resolved by chaining or by probing (linear, quadratic, double hashing), and the load factor α = n/m controls the cost.', matching: 'KMP uses a prefix-function table to avoid rechecking matched text. Boyer–Moore uses mismatch shifts to skip alignments.', representations: 'Adjacency lists use O(V+E) space for sparse graphs; adjacency matrices use O(V²) space and make edge-existence checks constant-time.', traversal: 'BFS explores by distance layers using a queue. DFS follows a path using recursion or a stack. Both run in O(V+E) with adjacency lists.', topological: 'A topological order exists only for a directed acyclic graph. Indegree-based processing repeatedly removes vertices whose dependencies are satisfied.', shortest: 'Relaxing edge (u,v) tests whether dist[u] + w(u,v) improves dist[v]. Dijkstra requires nonnegative edge weights.', mst: 'A minimum spanning tree connects every vertex with minimum total edge weight and no cycles. Cut and cycle properties justify safe edge choices.', greedy: 'A greedy algorithm commits to a locally attractive feasible choice. A correctness proof—often an exchange argument or cut property—is essential.', dp: 'Dynamic programming defines subproblems, a recurrence, base cases, and an evaluation order. Overlapping subproblems alone are not enough; the state must capture what future decisions need.', pnp: 'P contains decision problems solvable in polynomial time. NP contains problems whose yes-certificates can be verified in polynomial time; whether P = NP is unknown.', reductions: 'A polynomial-time many-one reduction A ≤p B transforms instances of A into instances of B while preserving yes/no answers. If A is hard and reduces to B, B is at least as hard.', sat: 'SAT asks whether a Boolean formula has a satisfying assignment. A certificate is an assignment that can be checked against the formula in polynomial time.', tsp: 'TSP asks for a minimum-cost tour visiting each city once and returning to the start. Brute force checks factorially many tours; bounds can prune search but do not remove worst-case hardness.'
  }
  return text[id] ?? 'Inspect the algorithm state, identify the invariant, and connect each decision to its correctness argument and complexity.'
}

function RepresentationExplorer() {
  const [vertices, setVertices] = useState(6)
  const [edges, setEdges] = useState(7)
  return <section className="panel"><div className="panel-heading"><div><span className="kicker">REPRESENTATION COMPARISON</span><h2>Choose the right storage model</h2><p>Adjust graph size to compare the space growth of common representations.</p></div><span className="panel-icon"><Network size={19}/></span></div><div className="input-row"><label>Vertices V <strong>{vertices}</strong></label><input type="range" min="2" max="20" value={vertices} onChange={e => setVertices(Number(e.target.value))}/></div><div className="input-row"><label>Edges E <strong>{edges}</strong></label><input type="range" min="1" max={Math.max(1, vertices * (vertices - 1) / 2)} value={Math.min(edges, vertices * (vertices - 1) / 2)} onChange={e => setEdges(Number(e.target.value))}/></div><div className="operation-cards"><div><small>ADJACENCY LIST</small><strong>{vertices + 2 * Math.min(edges, vertices * (vertices - 1) / 2)}</strong><span>stored entries approx.</span><code>O(V + E)</code></div><div><small>ADJACENCY MATRIX</small><strong>{vertices * vertices}</strong><span>matrix cells</span><code>O(V²)</code></div><div><small>EDGE LIST</small><strong>{Math.min(edges, vertices * (vertices - 1) / 2) * 2}</strong><span>endpoint entries</span><code>O(E)</code></div></div><div className="callout"><CircleHelp size={16}/><p>Adjacency lists are often efficient for sparse graphs; matrices provide constant-time edge lookup but reserve space for every possible vertex pair. Exact counts depend on directedness and storage conventions.</p></div></section>
}

function GraphView({ edges, visited, current }: { edges: number[][]; visited: number[]; current: number }) {
  const pos = [[50, 14], [24, 36], [76, 36], [16, 68], [65, 65], [44, 89]]
  return <div className="graph-canvas"><svg viewBox="0 0 100 105" role="img" aria-label="Undirected graph traversal visualization">{edges.map(([a, b]) => <line key={`${a}-${b}`} x1={pos[a][0]} y1={pos[a][1]} x2={pos[b][0]} y2={pos[b][1]} stroke="#34485f" strokeWidth="1.1"/>)}{pos.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="6.3" fill={i === current ? '#087fa7' : visited.includes(i) ? '#145b4c' : '#152338'} stroke={i === current ? '#68dcff' : visited.includes(i) ? '#54d6b0' : '#45617c'} strokeWidth=".8"/><text x={x} y={y + 1.4} textAnchor="middle" fontSize="5" fill="#edf7ff">{i}</text></g>)}</svg></div>
}

function TopologicalExplorer() {
  const [step, setStep] = useState(0)
  const order = ['Compile', 'Design', 'Test', 'Deploy']
  const deps = [[0, 2], [1, 2], [2, 3]]
  return <><div className="graph-canvas directed-graph"><div className={`dag-node ${step >= 1 ? 'visited' : ''}`}>Compile</div><div className={`dag-node ${step >= 1 ? 'visited' : ''}`}>Design</div><div className={`dag-node ${step >= 2 ? 'visited' : ''}`}>Test</div><div className={`dag-node ${step >= 3 ? 'visited' : ''}`}>Deploy</div><div className="dag-edges">Compile → Test · Design → Test · Test → Deploy</div></div><div className="graph-state-grid"><div><small>ORDER SO FAR</small><strong>{order.slice(0, step + 1).join(' → ')}</strong></div><div><small>EDGE RULE</small><strong>Prerequisite first</strong></div><div><small>COMPLEXITY</small><strong>O(V + E)</strong></div></div><div className="step-controls"><button className="btn btn-secondary" onClick={() => setStep(0)}><RotateCcw size={14}/> Reset</button><button className="btn btn-primary" disabled={step >= 3} onClick={() => setStep(s => s + 1)}>Process next <ArrowRight size={14}/></button></div><p className="muted-note">A valid topological order is not necessarily unique. If the graph contains a directed cycle, no topological ordering exists.</p></>
}

function ShortestPathExplorer() {
  const [step, setStep] = useState(0)
  const rounds = [{ d: [0, 4, 2, Infinity], note: 'Initialize source distance to 0 and all other distances to infinity.' }, { d: [0, 4, 2, 7], note: 'Relax edges from source: direct estimates become finite.' }, { d: [0, 3, 2, 6], note: 'A shorter route through an intermediate vertex improves the estimates.' }, { d: [0, 3, 2, 5], note: 'Continue relaxing edges until no distance can be improved.' }]
  const r = rounds[step]
  return <><div className="distance-grid">{r.d.map((d, i) => <div key={i} className={i === step ? 'distance-current' : ''}><small>DIST[{String.fromCharCode(65 + i)}]</small><strong>{Number.isFinite(d) ? d : '∞'}</strong></div>)}</div><div className="stage-explanation"><strong>Relaxation round {step + 1}</strong><p>{r.note}</p></div><div className="step-controls"><button className="btn btn-secondary" onClick={() => setStep(0)}><RotateCcw size={14}/> Reset</button><button className="btn btn-primary" disabled={step >= rounds.length - 1} onClick={() => setStep(s => s + 1)}>Next relaxation <ArrowRight size={14}/></button></div><div className="callout"><CircleHelp size={16}/><p>Illustrative distance updates. Dijkstra is valid only with nonnegative edge weights. For negative edges, Bellman–Ford is the standard single-source alternative (provided no reachable negative cycle invalidates finite shortest paths).</p></div></>
}

function MSTExplorer() {
  type Edge = { a: string; b: string; w: number }
  const verts = ['A', 'B', 'C', 'D']
  const edges: Edge[] = [{ a: 'A', b: 'B', w: 1 }, { a: 'B', b: 'C', w: 2 }, { a: 'A', b: 'C', w: 4 }, { a: 'C', b: 'D', w: 3 }, { a: 'B', b: 'D', w: 5 }]
  const [step, setStep] = useState(0)
  const [method, setMethod] = useState<'kruskal' | 'prim'>('kruskal')
  /** Real decision trace: Kruskal uses union-find to detect cycles, Prim grows from A by the cheapest crossing edge. */
  const trace = useMemo(() => {
    const out: { e: Edge; accepted: boolean; why: string }[] = []
    if (method === 'kruskal') {
      const parent: Record<string, string> = Object.fromEntries(verts.map(v => [v, v]))
      const find = (v: string): string => parent[v] === v ? v : (parent[v] = find(parent[v]))
      for (const e of [...edges].sort((x, y) => x.w - y.w)) {
        const ra = find(e.a), rb = find(e.b)
        if (ra !== rb) { parent[ra] = rb; out.push({ e, accepted: true, why: 'Joins two different components' }) }
        else out.push({ e, accepted: false, why: 'Endpoints already connected: would form a cycle' })
      }
    } else {
      const tree = new Set(['A'])
      while (tree.size < verts.length) {
        const e = edges.filter(x => tree.has(x.a) !== tree.has(x.b)).sort((x, y) => x.w - y.w)[0]
        out.push({ e, accepted: true, why: `Cheapest edge leaving {${[...tree].join(', ')}}` })
        tree.add(tree.has(e.a) ? e.b : e.a)
      }
    }
    return out
  }, [method])
  const chosen = trace.slice(0, step).filter(t => t.accepted)
  const last = step > 0 ? trace[step - 1] : null
  return <section className="panel"><div className="panel-heading"><div><span className="kicker">SPANNING TREE BUILDER</span><h2>Kruskal vs Prim</h2><p>Each decision below is computed by the algorithm, not hardcoded: accepted edges join components; skipped edges would close a cycle.</p></div><span className="panel-icon"><Waypoints size={19}/></span></div>
    <div className="strategy-tabs"><button className={method === 'kruskal' ? 'active' : ''} onClick={() => { setMethod('kruskal'); setStep(0) }}>Kruskal · sort edges</button><button className={method === 'prim' ? 'active' : ''} onClick={() => { setMethod('prim'); setStep(0) }}>Prim · grow from A</button></div>
    <div className="item-table"><div className="item-row item-header"><span>Edge</span><span>Weight</span><span>Decision</span><span>Why</span></div>{trace.map((t, i) => <div className={`item-row ${i < step && t.accepted ? 'selected-edge' : ''}`} key={`${t.e.a}${t.e.b}`}><span>{t.e.a} — {t.e.b}</span><span>{t.e.w}</span><span>{i < step ? (t.accepted ? 'Accepted' : 'Skipped') : i === step ? 'Next' : 'Pending'}</span><span>{i < step ? t.why : '—'}</span></div>)}</div>
    <div className="graph-state-grid"><div><small>EDGES SELECTED</small><strong>{chosen.map(t => `${t.e.a}${t.e.b}`).join(', ') || '—'}</strong></div><div><small>TOTAL WEIGHT</small><strong>{chosen.reduce((sum, t) => sum + t.e.w, 0)}</strong></div><div><small>GOAL</small><strong>{verts.length - 1} edges for {verts.length} vertices</strong></div></div>
    {last && <div className="stage-explanation"><strong>{last.e.a}—{last.e.b} (weight {last.e.w}): {last.accepted ? 'accepted' : 'skipped'}</strong><p>{last.why}</p></div>}
    <div className="step-controls"><button className="btn btn-secondary" onClick={() => setStep(0)}><RotateCcw size={14}/> Reset</button><button className="btn btn-primary" disabled={step >= trace.length} onClick={() => setStep(x => x + 1)}>Next decision <ArrowRight size={14}/></button></div></section>
}

function ComplexityClassExplorer({ topic }: { topic: 'pnp' | 'reductions' }) {
  const [revealed, setRevealed] = useState(false)
  return <section className="panel"><div className="panel-heading"><div><span className="kicker">COMPUTATIONAL COMPLEXITY</span><h2>{topic === 'pnp' ? 'Solving vs verifying' : 'Reduction direction matters'}</h2><p>{topic === 'pnp' ? 'Complexity classes describe resources needed by decision problems.' : 'A reduction transforms instances while preserving yes/no answers.'}</p></div><span className="panel-icon"><BrainCircuit size={19}/></span></div>{topic === 'pnp' ? <div className="class-cards"><div><span>P</span><strong>Polynomial-time solvable</strong><p>A deterministic algorithm decides the problem in polynomial time.</p><small>Example: shortest path decision with standard assumptions.</small></div><div><span>NP</span><strong>Polynomial-time verifiable</strong><p>For a yes-instance, a certificate can be checked in polynomial time.</p><small>Every problem in P is also in NP.</small></div><div><span>NP-complete</span><strong>In NP and NP-hard</strong><p>Every problem in NP reduces to it in polynomial time.</p><small>Whether P = NP remains open.</small></div></div> : <div className="reduction-flow"><div className="reduction-node">Problem A</div><ArrowRight size={23}/><div className="reduction-node reduction-highlight">Problem B</div><p>If A ≤p B and A is NP-hard, then B is NP-hard: a fast solver for B would give a fast solver for A after transformation.</p></div>}<button className="btn btn-secondary" onClick={() => setRevealed(v => !v)}>{revealed ? 'Hide reasoning check' : 'Test your understanding'} <ArrowRight size={14}/></button>{revealed && <div className="callout"><CircleHelp size={16}/><p>{topic === 'pnp' ? 'If a problem has a polynomial-time verifier, that establishes membership in NP; it does not by itself establish that the problem is NP-complete.' : 'To prove B is NP-hard, reduce a known hard problem A to B (A ≤p B), not the other way around.'}</p></div>}</section>
}

function SATExplorer() {
  const [a, setA] = useState(true)
  const [b, setB] = useState(false)
  const [c, setC] = useState(true)
  const clauses = [a || !b, !a || c, b || c]
  const valid = clauses.every(Boolean)
  return <section className="panel"><div className="panel-heading"><div><span className="kicker">CERTIFICATE CHECKER</span><h2>Evaluate a small SAT formula</h2><p>Formula: (A ∨ ¬B) ∧ (¬A ∨ C) ∧ (B ∨ C)</p></div><span className="panel-icon"><Check size={19}/></span></div><div className="variable-controls">{[['A', a, setA], ['B', b, setB], ['C', c, setC]].map(([name, value, setter]) => <button key={String(name)} className={`variable-card ${value ? 'var-true' : ''}`} onClick={() => (setter as (v: boolean) => void)(!value)}><small>VARIABLE {String(name)}</small><strong>{value ? 'TRUE' : 'FALSE'}</strong><span>Click to toggle</span></button>)}</div><div className="clause-list">{clauses.map((ok, i) => <div key={i}><span>Clause {i + 1}</span><code>{['A ∨ ¬B', '¬A ∨ C', 'B ∨ C'][i]}</code><strong className={ok ? 'clause-pass' : 'clause-fail'}>{ok ? 'SATISFIED' : 'FALSE'}</strong></div>)}</div><div className={`sat-result ${valid ? 'sat-yes' : 'sat-no'}`}><strong>{valid ? 'Satisfying assignment' : 'Not satisfying'}</strong><span>{valid ? 'All clauses evaluate to true for this assignment.' : 'At least one clause is false. Change a variable and re-check.'}</span></div><div className="callout"><CircleHelp size={16}/><p>Checking one assignment is polynomial-time. SAT asks whether any satisfying assignment exists; exhaustive search over all assignments is exponential in the number of variables.</p></div></section>
}

function TSPExplorer() {
  const cities = ['A', 'B', 'C', 'D']
  const matrix = [[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]
  const tours = [[0,1,2,3,0], [0,1,3,2,0], [0,2,1,3,0], [0,2,3,1,0], [0,3,1,2,0], [0,3,2,1,0]]
  const costs = tours.map(t => ({ t, cost: t.slice(1).reduce((s, v, i) => s + matrix[t[i]][v], 0) })).sort((a, b) => a.cost - b.cost)
  const best = costs[0]
  return <section className="panel"><div className="panel-heading"><div><span className="kicker">TOUR SEARCH</span><h2>Compare candidate TSP tours</h2><p>For four cities, enumerate tours and compare total cost. The search grows rapidly with more cities.</p></div><span className="panel-icon"><Waypoints size={19}/></span></div><div className="item-table"><div className="item-row item-header"><span>Tour</span><span>Route</span><span>Total cost</span><span>Status</span></div>{costs.map((x, i) => <div className={`item-row ${i === 0 ? 'selected-edge' : ''}`} key={x.t.join('-')}><span>#{i + 1}</span><span>{x.t.map(v => cities[v]).join(' → ')}</span><span>{x.cost}</span><span>{i === 0 ? 'Best found' : 'Candidate'}</span></div>)}</div><div className="graph-state-grid"><div><small>BEST TOUR</small><strong>{best.t.map(v => cities[v]).join(' → ')}</strong></div><div><small>TOUR COST</small><strong>{best.cost}</strong></div><div><small>TOURS CHECKED</small><strong>{tours.length}</strong></div></div><div className="callout"><CircleHelp size={16}/><p>For n cities, fixing the starting city still leaves (n−1)! possible directed visit orders before symmetry reductions. Branch and bound prunes a partial route only when its valid lower bound cannot beat the best complete tour.</p></div></section>
}

export default App