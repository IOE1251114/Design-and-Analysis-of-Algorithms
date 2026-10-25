import { useEffect, useMemo, useState } from "react";
import myLogo from "./Image.png";
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  Cpu,
  Download,
  GitBranch,
  GraduationCap,
  Layers3,
  ListChecks,
  Network,
  Pause,
  Play,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Waypoints,
  Zap,
} from "lucide-react";
import { StudentPanel } from "./components/StudentPanel";
import { TeacherDashboard } from "./components/TeacherDashboard";
import {
  slug,
  topicStats,
  useActivityTracker,
  useDB,
  withActivity,
  withAttempt,
  withStudent,
  type TopicRef,
} from "./domain/tracking";
import { RamExplorer } from "./components/unit1/RamExplorer";
import { AsymptoticExplorer } from "./components/unit1/AsymptoticExplorer";
import { ComplexityExplorer } from "./components/unit1/ComplexityExplorer";
import { ParadigmExplorer } from "./components/unit1/ParadigmExplorer";
import { Unit1Theory, hasUnit1Theory } from "./components/unit1/TheoryNotes";
import { SortingExplorer } from "./components/unit2/SortingExplorer";
import { LinearSortExplorer } from "./components/unit2/LinearSortExplorer";
import { TreeExplorer } from "./components/unit2/TreeExplorer";
import { HeapExplorer } from "./components/unit2/HeapExplorer";
import { HashExplorer } from "./components/unit2/HashExplorer";
import { StringExplorer } from "./components/unit2/StringExplorer";
import { Unit2Theory, hasUnit2Theory } from "./components/unit2/Unit2Theory";
import { RepresentationExplorer } from "./components/unit3/RepresentationExplorer";
import { TraversalExplorer } from "./components/unit3/TraversalExplorer";
import { ComponentsExplorer } from "./components/unit3/ComponentsExplorer";
import { TopoExplorer } from "./components/unit3/TopoExplorer";
import { BiconnectedExplorer } from "./components/unit3/BiconnectedExplorer";
import { ShortestPathExplorer } from "./components/unit3/ShortestPathExplorer";
import { Unit3Theory, hasUnit3Theory } from "./components/unit3/Unit3Theory";
import {
  DijkstraImplExplorer,
  FractionalExplorer,
  HuffmanExplorer,
  MSTExplorer,
} from "./components/unit4/GreedyExplorers";
import {
  BinomialExplorer,
  KnapsackDPExplorer,
  LCSExplorer,
  MatrixChainExplorer,
} from "./components/unit4/DPExplorers";
import { Unit4Theory, hasUnit4Theory } from "./components/unit4/Unit4Theory";
import { NPCExplorer, PvsNPExplorer } from "./components/Unit5/ClassExplorers";
import {
  ReductionExplorer,
  SATExplorer,
} from "./components/Unit5/SatExplorers";
import {
  HamiltonExplorer,
  TSPExplorer,
} from "./components/Unit5/HamTspExplorers";
import { Unit5Theory, hasUnit5Theory } from "./components/Unit5/Unit5Theory";

type UnitId = "u1" | "u2" | "u3" | "u4" | "u5";
type Mode = "explore" | "student" | "teacher";
type Topic = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  complexity: string;
  tags: string[];
};
type Unit = {
  id: UnitId;
  number: string;
  title: string;
  short: string;
  description: string;
  topics: Topic[];
};

const units: Unit[] = [
  {
    id: "u1",
    number: "01",
    title: "Algorithm analysis",
    short: "Foundations",
    description:
      "Model computation, count operations, and justify asymptotic bounds.",
    topics: [
      {
        id: "ram",
        title: "RAM model",
        subtitle: "Primitive operations & memory",
        description:
          "Treat basic operations as unit-cost steps, then make the assumptions behind a count explicit.",
        complexity: "Cost model",
        tags: ["unit-cost assumptions", "operation count"],
      },
      {
        id: "asymptotic",
        title: "Asymptotic notation",
        subtitle: "Compare growth rates",
        description:
          "Compare upper, lower, and tight bounds without confusing them with best-, average-, and worst-case inputs.",
        complexity: "O · Ω · Θ",
        tags: ["growth", "bounds"],
      },
      {
        id: "complexity",
        title: "Complexity analysis",
        subtitle: "Trace → count → derive",
        description:
          "Translate loop and recursion structure into a count, then keep the dominant term.",
        complexity: "T(n), S(n)",
        tags: ["loops", "recurrences"],
      },
      {
        id: "paradigms",
        title: "Algorithmic paradigms",
        subtitle: "Choose a strategy",
        description:
          "Understand the proof obligations behind divide and conquer, greedy, backtracking, and branch and bound.",
        complexity: "Strategy",
        tags: ["design", "correctness"],
      },
    ],
  },
  {
    id: "u2",
    number: "02",
    title: "Searching & sorting",
    short: "Data structures",
    description:
      "Sorting with worst- and average-case analysis, linear-time sorts, balanced search trees, heaps, hashing and string matching.",
    topics: [
      {
        id: "sorting",
        title: "Comparison sorting",
        subtitle: "Quick · merge · heap sort",
        description:
          "Step through quick, merge and heap sort, then compare their worst- and average-case behaviour using real comparison counts.",
        complexity: "Θ(n log n) avg · quick sort Θ(n²) worst",
        tags: [
          "quick sort",
          "merge sort",
          "heap sort",
          "worst vs average case",
        ],
      },
      {
        id: "linear",
        title: "Linear-time sorting",
        subtitle: "Counting · radix · bucket sort",
        description:
          "Sort without comparing keys, and see why comparison sorts can never beat Ω(n log n).",
        complexity: "Θ(n + k)",
        tags: ["counting sort", "radix sort", "bucket sort", "lower bound"],
      },
      {
        id: "trees",
        title: "Search trees",
        subtitle: "BST · AVL · red-black · B-tree",
        description:
          "Insert, search and delete step by step, and watch rotations, recolourings and node splits keep the tree balanced.",
        complexity: "O(log n) when balanced",
        tags: ["BST property", "rotation", "black-height", "node split"],
      },
      {
        id: "heaps",
        title: "Heaps & priority queues",
        subtitle: "Insert · extract · build-heap",
        description:
          "Run priority-queue operations on a binary heap and see the tree and its array change together.",
        complexity: "O(log n) per operation · build Θ(n)",
        tags: ["heap property", "sift up / down", "priority queue"],
      },
      {
        id: "hashing",
        title: "Hashing",
        subtitle: "Chaining & open addressing",
        description:
          "Hash keys into a table, resolve collisions four different ways and watch the load factor drive the cost.",
        complexity: "Expected Θ(1 + α)",
        tags: ["hash function", "collisions", "load factor", "probing"],
      },
      {
        id: "matching",
        title: "String matching",
        subtitle: "KMP & Boyer–Moore",
        description:
          "Slide a pattern along a text and see how preprocessing decides how far each mismatch lets you jump.",
        complexity: "KMP Θ(n + m)",
        tags: ["prefix function", "bad character", "good suffix"],
      },
    ],
  },
  {
    id: "u3",
    number: "03",
    title: "Graph algorithms",
    short: "Graph traversal",
    description:
      "Graph representations, BFS and DFS, and their applications: components, topological sorting, biconnectivity and shortest paths.",
    topics: [
      {
        id: "representations",
        title: "Representations",
        subtitle: "Adjacency matrix · list · edge list",
        description:
          "Store one graph three ways, edit it, and compare space and operation costs.",
        complexity: "List Θ(V + E) · matrix Θ(V²)",
        tags: ["adjacency matrix", "adjacency list", "density"],
      },
      {
        id: "traversal",
        title: "BFS & DFS",
        subtitle: "Queue vs stack",
        description:
          "Step through breadth-first and depth-first search: layers, discovery/finish times and edge classes.",
        complexity: "Θ(V + E)",
        tags: ["queue", "stack", "edge classes", "parenthesis theorem"],
      },
      {
        id: "components",
        title: "Connected components",
        subtitle: "Components & strongly connected components",
        description:
          "Label every component with repeated searches, and find SCCs of a directed graph with Kosaraju’s two-pass DFS.",
        complexity: "Θ(V + E)",
        tags: ["reachability", "SCC", "Kosaraju", "condensation"],
      },
      {
        id: "topological",
        title: "Topological sorting",
        subtitle: "Ordering a DAG",
        description:
          "Order prerequisites with Kahn’s in-degree method or DFS finish times, and see how a cycle makes it impossible.",
        complexity: "Θ(V + E)",
        tags: ["DAG", "in-degree", "finish time", "cycle detection"],
      },
      {
        id: "biconnected",
        title: "Biconnected components",
        subtitle: "Articulation points & bridges",
        description:
          "Use DFS low-link values to find cut vertices, bridges and biconnected components in one pass.",
        complexity: "Θ(V + E)",
        tags: ["articulation point", "bridge", "low-link"],
      },
      {
        id: "shortest",
        title: "Single-source shortest paths",
        subtitle: "Dijkstra · Bellman–Ford · DAG",
        description:
          "Relax edges in three different orders and see which graphs each algorithm can handle.",
        complexity: "Dijkstra O((V + E) log V) · BF O(VE)",
        tags: ["relaxation", "negative edges", "negative cycle"],
      },
    ],
  },
  {
    id: "u4",
    number: "04",
    title: "Greedy & dynamic programming",
    short: "Optimization",
    description:
      "Compare local-choice strategies with state-based optimization and reconstruction.",
    topics: [
      {
        id: "mst",
        title: "Minimum spanning trees",
        subtitle: "Prim & Kruskal",
        description:
          "Grow a minimum-weight tree edge by edge: Kruskal sorts edges and uses union-find, Prim grows outward from one vertex.",
        complexity: "O(E log V)",
        tags: ["greedy choice", "cut property", "union-find"],
      },
      {
        id: "dijkstra",
        title: "Dijkstra: arrays vs heaps",
        subtitle: "Priority-queue choice",
        description:
          "Run the same greedy shortest-path algorithm with a plain array and with a binary heap, and see when each wins.",
        complexity: "Θ(V²) vs O((V+E) log V)",
        tags: ["extract-min", "decrease-key", "sparse vs dense"],
      },
      {
        id: "greedy",
        title: "Fractional knapsack",
        subtitle: "Greedy by value per weight",
        description:
          "Fill a knapsack with divisible items and compare three greedy rules: only value/weight is optimal.",
        complexity: "O(n log n)",
        tags: ["exchange argument", "ratio"],
      },
      {
        id: "huffman",
        title: "Huffman coding",
        subtitle: "Priority-queue merges",
        description:
          "Build an optimal prefix-free code by repeatedly merging the two least frequent trees.",
        complexity: "O(n log n)",
        tags: ["prefix code", "min-heap", "entropy"],
      },
      {
        id: "binomial",
        title: "Binomial coefficient",
        subtitle: "Pascal’s triangle",
        description:
          "See why plain recursion repeats work and how a table computes C(n, k) once per sub-problem.",
        complexity: "Θ(nk)",
        tags: ["overlapping subproblems", "tabulation"],
      },
      {
        id: "matrixchain",
        title: "Matrix chain multiplication",
        subtitle: "Optimal bracketing",
        description:
          "Fill the m and s tables by chain length and compare the optimum with every possible bracketing.",
        complexity: "Θ(n³)",
        tags: ["optimal substructure", "split table"],
      },
      {
        id: "lcs",
        title: "Longest common subsequence",
        subtitle: "Table with arrows",
        description:
          "Fill the LCS table for two strings of your choice and trace the arrows back to read off the answer.",
        complexity: "Θ(mn)",
        tags: ["trace-back", "diff"],
      },
      {
        id: "dp",
        title: "0/1 knapsack",
        subtitle: "Take or skip",
        description:
          "Fill the knapsack table item by item, trace back the chosen items, and compare with greedy and fractional answers.",
        complexity: "Θ(nW)",
        tags: ["pseudo-polynomial", "reconstruction"],
      },
    ],
  },
  {
    id: "u5",
    number: "05",
    title: "Complexity & intractability",
    short: "Limits of computation",
    description:
      "Classify decision problems, reason about reductions, and inspect combinatorial search.",
    topics: [
      {
        id: "pnp",
        title: "P and NP",
        subtitle: "Solving vs verifying",
        description:
          "Search all subsets or check one certificate, see why polynomial time is the line, and place famous problems on the map of classes.",
        complexity: "P ⊆ NP",
        tags: ["certificate", "verifier", "intractable"],
      },
      {
        id: "npc",
        title: "NP-completeness",
        subtitle: "The hardest problems in NP",
        description:
          "Watch NP-hardness spread down a chain of reductions, and a hypothetical fast algorithm spread up until P = NP.",
        complexity: "NPC = NP ∩ NP-hard",
        tags: ["Cook–Levin", "NP-hard", "proof recipe"],
      },
      {
        id: "reductions",
        title: "Polynomial reductions",
        subtitle: "Transform problems",
        description:
          "Turn a CNF formula into a graph whose independent sets mirror satisfying assignments, and link independent set, vertex cover and clique.",
        complexity: "A ≤p B",
        tags: ["mapping", "yes ⇔ yes", "hardness"],
      },
      {
        id: "sat",
        title: "SAT",
        subtitle: "Boolean satisfiability",
        description:
          "Check a certificate, run the full truth table, and watch DPLL prune the search with unit propagation.",
        complexity: "O(2ⁿ) brute force",
        tags: ["CNF", "DPLL", "Cook–Levin"],
      },
      {
        id: "hamiltonian",
        title: "Hamiltonian cycle",
        subtitle: "Every vertex once",
        description:
          "Backtrack through paths looking for a Hamiltonian cycle, contrast it with the easy Euler test, and reduce it to TSP.",
        complexity: "O(n!) search",
        tags: ["backtracking", "Euler vs Hamilton", "HAM ≤p TSP"],
      },
      {
        id: "tsp",
        title: "Travelling salesperson",
        subtitle: "Exact search & approximation",
        description:
          "Compare brute force with nearest neighbour and the MST 2-approximation on seeded city maps.",
        complexity: "(n−1)!/2 tours",
        tags: ["tour", "approximation", "Held–Karp"],
      },
    ],
  },
];

function App() {
  const [mode, setMode] = useState<Mode>("explore");
  const [activeUnit, setActiveUnit] = useState<UnitId>("u1");
  const [activeTopic, setActiveTopic] = useState("ram");
  const [n, setN] = useState(8);
  const [step, setStep] = useState(0);
  const [knapsackMode, setKnapsackMode] = useState<"greedy" | "dp">("dp");
  const [search, setSearch] = useState("");
  const [showTheory, setShowTheory] = useState(true);
  const [quickReveal, setQuickReveal] = useState(false);
  const [db, updateDB] = useDB();
  const [studentName, setStudentName] = useState(() => {
    try {
      return localStorage.getItem("vatrix-student") ?? "";
    } catch {
      return "";
    }
  });

  const unit = units.find((u) => u.id === activeUnit)!;
  const topic =
    units.flatMap((u) => u.topics).find((t) => t.id === activeTopic) ??
    unit.topics[0];
  const topicRefs: TopicRef[] = units.flatMap((u) =>
    u.topics.map((t) => ({
      id: t.id,
      title: t.title,
      unit: `Unit ${u.number}`,
    })),
  );
  const studentId = slug(studentName);
  const student = db.students[studentId] ?? null;
  useActivityTracker(
    updateDB,
    student ? studentId : null,
    mode === "explore",
    activeTopic,
    step,
  );
  const login = (name: string) => {
    updateDB((d) => withStudent(d, name));
    setStudentName(name.trim());
    try {
      localStorage.setItem("vatrix-student", name.trim());
    } catch {
      /* ignore */
    }
  };
  const logout = () => {
    setStudentName("");
    try {
      localStorage.removeItem("vatrix-student");
    } catch {
      /* ignore */
    }
  };
  const openVisualizer = (topicId: string) => {
    setTopic(topicId);
    setMode("explore");
  };
  /** Forward steps taken inside the Unit 1 steppers count toward the signed-in student's activity. */
  const recordSteps = (k: number) => {
    if (student && mode === "explore")
      updateDB((d) => withActivity(d, studentId, activeTopic, 0, k));
  };

  const setTopic = (topicId: string, unitId?: UnitId) => {
    const parent = units.find((u) => u.topics.some((t) => t.id === topicId));
    setActiveTopic(topicId);
    setActiveUnit(unitId ?? parent?.id ?? "u1");
    setStep(0);
    setQuickReveal(false);
  };
  const filteredUnits = units
    .map((u) => ({
      ...u,
      topics: u.topics.filter((t) =>
        `${t.title} ${t.subtitle} ${t.tags.join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    }))
    .filter((u) => u.topics.length);
  const topicIndex = units
    .flatMap((u) => u.topics)
    .findIndex((t) => t.id === activeTopic);
  const allTopics = units.flatMap((u) => u.topics);
  const masteredPct = student
    ? Math.round(
        (100 *
          allTopics.filter(
            (t) => (topicStats(student, t.id).mastery ?? 0) >= 75,
          ).length) /
          allTopics.length,
      )
    : 0;

  const changeMode = (next: Mode) => setMode(next);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <img 
              src={myLogo} 
              alt="Vatrix Logo" 
              style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: '4px' }} 
            />
          </div>
          <div>
            <strong>VATRIX</strong>
            <small>Visual Algorithm Space</small>
          </div>
        </div>
        <div className="course-chip">
          <span className="live-dot" /> DESIGN & ANALYSIS OF ALGORITHMS{" "}
          <ChevronDown size={13} />
        </div>
        <div className="side-label">
          COURSE CONTENT <span>{allTopics.length} TOPICS</span>
        </div>
        <div className="search-wrap">
          <Search size={15} />
          <input
            aria-label="Search topics"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a topic…"
          />
        </div>
        <nav className="unit-nav">
          {filteredUnits.map((u) => (
            <div className="unit-group" key={u.id}>
              <button
                className={`unit-link ${activeUnit === u.id ? "unit-active" : ""}`}
                onClick={() => {
                  setActiveUnit(u.id);
                  if (!u.topics.some((t) => t.id === activeTopic))
                    setTopic(u.topics[0].id, u.id);
                }}
              >
                <span className="unit-number">{u.number}</span>
                <span className="unit-title">{u.title}</span>
                <span className="unit-progress">
                  {
                    u.topics.filter(
                      (t) =>
                        student &&
                        (topicStats(student, t.id).mastery ?? 0) >= 75,
                    ).length
                  }
                  /{u.topics.length}
                </span>
              </button>
              {activeUnit === u.id && (
                <div className="topic-links">
                  {u.topics.map((t) => (
                    <button
                      key={t.id}
                      className={`topic-link ${activeTopic === t.id ? "topic-active" : ""}`}
                      onClick={() => setTopic(t.id, u.id)}
                    >
                      <span className="topic-dot" />
                      <span>{t.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-progress-head">
            <span>TOPICS MASTERED</span>
            <strong>{masteredPct}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${masteredPct}%` }} />
          </div>
          <p>
            Mastered = 75%+ on recent practice. Solve problems to build your
            profile.
          </p>
          <div className="sidebar-user">
            <div className="avatar">
              <GraduationCap size={18} />
            </div>
            <div>
              <strong>{student?.name ?? "Not signed in"}</strong>
              <small>
                {student ? "Progress is tracked" : "Open Student mode to start"}
              </small>
            </div>
            <Settings2 size={16} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>COURSE</span>
            <ArrowRight size={13} />
            <span>
              {unit.number} / {unit.title.toUpperCase()}
            </span>
            <ArrowRight size={13} />
            <strong>{topic.title}</strong>
          </div>
          <div className="topbar-right">
            <span className="status-pill">
              <span className="live-dot" /> INTERACTIVE LAB
            </span>
            <div
              className="mode-switch"
              role="group"
              aria-label="Workspace mode"
            >
              <button
                className={mode === "explore" ? "selected" : ""}
                onClick={() => changeMode("explore")}
              >
                <Sparkles size={14} /> Explore
              </button>
              <button
                className={mode === "student" ? "selected" : ""}
                onClick={() => changeMode("student")}
              >
                <GraduationCap size={14} /> Student
              </button>
              <button
                className={mode === "teacher" ? "selected" : ""}
                onClick={() => changeMode("teacher")}
              >
                <BookOpen size={14} /> Teacher
              </button>
            </div>
          </div>
        </header>
        <div className="content-area">
          <section className="hero-card">
            <div className="hero-copy">
              <div className="eyebrow">
                <span /> UNIT {unit.number}{" "}
                <span className="eyebrow-divider">/</span>{" "}
                {unit.short.toUpperCase()}
              </div>
              <h1>
                {topic.title}
                <br />
                <span>{topic.subtitle.toLowerCase()}.</span>
              </h1>
              <p>{topic.description}</p>
              <div className="hero-pills">
                <span>
                  <Check size={13} /> Interactive experiments
                </span>
                <span>
                  <Check size={13} /> Step-by-step reasoning
                </span>
                <span>
                  <Check size={13} /> Complexity insights
                </span>
              </div>
            </div>
            <div className="hero-art">
              <div className="art-orbit orbit-a" />
              <div className="art-orbit orbit-b" />
              <div className="art-core">
                <Network size={30} />
                <small>TRACE</small>
              </div>
              <div className="art-node node-1">O(n)</div>
              <div className="art-node node-2">{unit.number}</div>
              <div className="art-node node-3">
                <GitBranch size={17} />
              </div>
              <div className="art-caption">
                MODEL <span>→</span> EXECUTE <span>→</span> PROVE
              </div>
            </div>
          </section>

          {mode === "teacher" && (
            <TeacherDashboard
              db={db}
              update={updateDB}
              topics={topicRefs}
              onOpenVisualizer={openVisualizer}
            />
          )}
          {mode === "student" && (
            <StudentPanel
              db={db}
              student={student}
              topics={topicRefs}
              activeTopic={activeTopic}
              onLogin={login}
              onLogout={logout}
              onAttempt={(a) => updateDB((d) => withAttempt(d, studentId, a))}
              onOpenVisualizer={openVisualizer}
            />
          )}

          {mode === "explore" && (
            <>
              <section className="learning-toolbar">
                <div>
                  <span className="kicker">CONCEPT WORKSPACE</span>
                  <h2>Learn by changing the input</h2>
                </div>
                <button
                  className="quiet-button"
                  onClick={() => setShowTheory((v) => !v)}
                >
                  <BookOpen size={15} />
                  {showTheory ? "Hide" : "Show"} theory
                </button>
              </section>
              {showTheory && (
                <section className="theory-strip">
                  <div className="theory-icon">
                    <BrainCircuit size={19} />
                  </div>
                  <div>
                    <span className="kicker">THE IDEA</span>
                    <p>{theoryFor(activeTopic)}</p>
                    <div className="tag-row">
                      {topic.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="theory-complexity">
                    <small>COMPLEXITY / KEY PROPERTY</small>
                    <strong>{topic.complexity}</strong>
                  </div>
                </section>
              )}
              {showTheory && hasUnit1Theory(activeTopic) && (
                <Unit1Theory topic={activeTopic} />
              )}
              {showTheory && hasUnit2Theory(activeTopic) && (
                <Unit2Theory topic={activeTopic} />
              )}
              {showTheory && hasUnit3Theory(activeTopic) && (
                <Unit3Theory topic={activeTopic} />
              )}
              {showTheory && hasUnit4Theory(activeTopic) && (
                <Unit4Theory topic={activeTopic} />
              )}
              {showTheory && hasUnit5Theory(activeTopic) && (
                <Unit5Theory topic={activeTopic} />
              )}

              {activeTopic === "ram" && <RamExplorer onSteps={recordSteps} />}
              {activeTopic === "asymptotic" && <AsymptoticExplorer />}
              {activeTopic === "complexity" && (
                <ComplexityExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "paradigms" && (
                <ParadigmExplorer onSteps={recordSteps} />
              )}

              {activeTopic === "sorting" && (
                <SortingExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "linear" && (
                <LinearSortExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "trees" && (
                <TreeExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "heaps" && (
                <HeapExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "hashing" && (
                <HashExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "matching" && (
                <StringExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "representations" && <RepresentationExplorer />}
              {activeTopic === "traversal" && (
                <TraversalExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "components" && (
                <ComponentsExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "topological" && (
                <TopoExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "biconnected" && (
                <BiconnectedExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "shortest" && (
                <ShortestPathExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "mst" && <MSTExplorer onSteps={recordSteps} />}
              {activeTopic === "dijkstra" && (
                <DijkstraImplExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "greedy" && (
                <FractionalExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "huffman" && (
                <HuffmanExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "binomial" && (
                <BinomialExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "matrixchain" && (
                <MatrixChainExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "lcs" && <LCSExplorer onSteps={recordSteps} />}
              {activeTopic === "dp" && (
                <KnapsackDPExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "pnp" && <PvsNPExplorer onSteps={recordSteps} />}
              {activeTopic === "npc" && <NPCExplorer onSteps={recordSteps} />}
              {activeTopic === "reductions" && (
                <ReductionExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "sat" && <SATExplorer onSteps={recordSteps} />}
              {activeTopic === "hamiltonian" && (
                <HamiltonExplorer onSteps={recordSteps} />
              )}
              {activeTopic === "tsp" && <TSPExplorer onSteps={recordSteps} />}
              {![
                "ram",
                "asymptotic",
                "complexity",
                "paradigms",
                "sorting",
                "linear",
                "trees",
                "heaps",
                "hashing",
                "matching",
                "representations",
                "traversal",
                "components",
                "topological",
                "biconnected",
                "shortest",
                "mst",
                "dijkstra",
                "greedy",
                "huffman",
                "binomial",
                "matrixchain",
                "lcs",
                "dp",
                "pnp",
                "npc",
                "reductions",
                "sat",
                "hamiltonian",
                "tsp",
              ].includes(activeTopic) && (
                <div className="panel">
                  <h2>{topic.title}</h2>
                  <p>{topic.description}</p>
                </div>
              )}
            </>
          )}

          <section className="bottom-learning">
            <div className="bottom-icon">
              <Code2 size={19} />
            </div>
            <div>
              <span className="kicker">MAKE THE REASONING EXPLICIT</span>
              <h3>Model → execute → explain → analyze</h3>
              <p>
                Use the simulator to build intuition, then switch to Student
                mode to practice with auto-graded problems or Teacher mode to
                see class analytics.
              </p>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() =>
                changeMode(
                  mode === "student"
                    ? "explore"
                    : mode === "teacher"
                      ? "student"
                      : "student",
                )
              }
            >
              {mode === "student" ? "Back to explore" : "Open practice"}{" "}
              <ArrowRight size={14} />
            </button>
          </section>
          <footer className="app-footer">
            <span>DAA LAB · FIVE-UNIT INTERACTIVE COURSE</span>
            <span>
              Prototype build · Browser-local data · No server accounts
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function theoryFor(id: string) {
  const text: Record<string, string> = {
    ram: "An algorithm runs on an abstract machine. Count primitive operations under explicit unit-cost assumptions rather than equating source-code lines with real elapsed time.",
    asymptotic:
      "Asymptotic notation describes how functions compare for sufficiently large input sizes. O is an upper bound, Ω is a lower bound, and Θ is a tight bound.",
    complexity:
      "Identify the basic operation, count how often it executes, express the count as T(n), then simplify to the dominant asymptotic term.",
    paradigms:
      "Algorithmic paradigms are reusable design strategies. Their correctness comes from invariants, recurrences, exchange arguments, or sound pruning—not from the strategy name alone.",
    sorting:
      "Comparison sorts learn the order only by comparing keys. Quick sort does its work while partitioning, merge sort while merging, heap sort by repeatedly extracting the maximum. All average Θ(n log n); only quick sort has a Θ(n²) worst case.",
    trees:
      "A search tree supports search, insert and delete in O(height). Plain BSTs can degenerate to height n; AVL and red-black trees rebalance with rotations, and B-trees split full nodes, to keep the height logarithmic.",
    linear:
      "Counting, radix and bucket sort use key values as positions instead of comparing keys, so they sidestep the Ω(n log n) comparison lower bound under assumptions about the keys.",
    heaps:
      "A binary heap is a complete binary tree stored in an array, with every parent at least as large as its children (max-heap). It supports insert and extract-max in O(log n) and can be built in Θ(n).",
    hashing:
      "A hash function maps each key to a table slot so lookups take expected constant time. Collisions are resolved by chaining or by probing (linear, quadratic, double hashing), and the load factor α = n/m controls the cost.",
    matching:
      "KMP uses a prefix-function table to avoid rechecking matched text. Boyer–Moore uses mismatch shifts to skip alignments.",
    representations:
      "A graph can be stored as an adjacency matrix (Θ(V²) space, Θ(1) edge test), an adjacency list (Θ(V + E) space, fast neighbour scans) or an edge list. Sparse graphs favour lists.",
    traversal:
      "BFS explores layer by layer with a queue and finds fewest-edge distances. DFS goes deep with a stack (recursion) and records discovery and finish times. Both run in Θ(V + E) with adjacency lists.",
    topological:
      "A topological order lists the vertices of a DAG so every edge points forward. Kahn’s algorithm repeatedly removes in-degree-0 vertices; the DFS method orders vertices by decreasing finish time. A cycle makes it impossible.",
    components:
      "Connected components group vertices that can reach each other. In a directed graph, strongly connected components are maximal sets where every vertex reaches every other; Kosaraju finds them with two DFS passes.",
    biconnected:
      "An articulation point is a vertex whose removal disconnects the graph; a bridge is such an edge. DFS low-link values find all of them, and the biconnected components, in one Θ(V + E) pass.",
    shortest:
      "Shortest-path algorithms repeatedly relax edges: if d[u] + w(u, v) < d[v], update d[v]. Dijkstra relaxes in order of final distance (no negative edges), Bellman–Ford relaxes everything V − 1 times, and DAGs use topological order.",
    mst: "A minimum spanning tree connects every vertex with the least total weight. The cut property says the lightest edge crossing any cut is safe, which makes both Kruskal (lightest edge joining two trees) and Prim (lightest edge leaving the tree) correct.",
    dijkstra:
      "Dijkstra settles vertices in order of distance. With an array, extract-min is a Θ(V) scan, giving Θ(V²). With a binary heap, extract-min and decrease-key are O(log V), giving O((V + E) log V). Heaps win on sparse graphs, arrays on dense ones.",
    greedy:
      "A greedy algorithm makes the locally best choice and never revisits it. It is correct only with the greedy-choice property and optimal substructure. For the fractional knapsack, taking items in decreasing value/weight order is optimal.",
    huffman:
      "Huffman coding repeatedly removes the two least frequent trees from a min-priority queue and merges them. Frequent symbols end up near the root with short codes, giving an optimal prefix-free code in O(n log n).",
    binomial:
      "Dynamic programming stores the answer to every sub-problem once. C(n, k) = C(n−1, k−1) + C(n−1, k) repeats exponentially many calls when evaluated recursively, but a Pascal-triangle table needs only Θ(nk) additions.",
    matrixchain:
      "The cost of a matrix product depends on the bracketing. m[i][j] = min over k of m[i][k] + m[k+1][j] + p(i−1)p(k)p(j), filled by chain length, finds the optimum in Θ(n³) instead of trying exponentially many bracketings.",
    lcs: "c[i][j] holds the LCS length of the first i characters of X and the first j of Y. A match extends the diagonal; otherwise take the larger of the cell above and the cell to the left. Arrows let you read the LCS back.",
    dp: "For 0/1 knapsack, K[i][w] = max(K[i−1][w], vᵢ + K[i−1][w−wᵢ]). The table is filled in Θ(nW) and the chosen items are recovered by tracing back. Greedy by ratio can fail because items cannot be cut.",
    pnp: "P is the class of decision problems solvable in polynomial time. NP is the class whose YES answers have certificates checkable in polynomial time. P ⊆ NP; whether they are equal is open.",
    npc: "A problem is NP-complete if it is in NP and every NP problem reduces to it in polynomial time. SAT was the first (Cook–Levin); hardness then spreads along reductions. A polynomial algorithm for any one NP-complete problem would prove P = NP.",
    reductions:
      "A polynomial-time reduction A ≤p B maps every instance x of A to an instance f(x) of B with the same YES/NO answer. If A is NP-hard, so is B; if B is in P, so is A.",
    sat: "SAT asks whether a CNF formula has a satisfying assignment. Checking an assignment is linear in the formula, so SAT is in NP; brute force tries 2ⁿ assignments, and DPLL prunes with unit propagation but is still exponential in the worst case.",
    hamiltonian:
      "A Hamiltonian cycle visits every vertex exactly once. Verifying one is O(n), but finding one is NP-complete; backtracking may try O(n!) paths. Visiting every edge once (Euler) is, by contrast, a simple degree test.",
    tsp: "TSP seeks the cheapest tour through all cities. Its decision version is NP-complete (HAM-CYCLE reduces to it). Exact search costs (n−1)!/2 tours or n²·2ⁿ with Held–Karp; the MST tour is within 2× optimal for metric costs.",
  };
  return (
    text[id] ??
    "Inspect the algorithm state, identify the invariant, and connect each decision to its correctness argument and complexity."
  );
}

export default App;
