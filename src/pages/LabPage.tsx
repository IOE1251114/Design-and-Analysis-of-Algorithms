import { useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  Code2,
  GitBranch,
  GraduationCap,
  House,
  Menu,
  Network,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import logo from "../assets/logo.png";
import { StudentPanel } from "../components/modes/StudentPanel";
import { TeacherDashboard } from "../components/modes/TeacherDashboard";
import { RamExplorer } from "../components/unit1/RamExplorer";
import { AsymptoticExplorer } from "../components/unit1/AsymptoticExplorer";
import { ComplexityExplorer } from "../components/unit1/ComplexityExplorer";
import { ParadigmExplorer } from "../components/unit1/ParadigmExplorer";
import { Unit1Theory, hasUnit1Theory } from "../components/unit1/Unit1Theory";
import { SortingExplorer } from "../components/unit2/SortingExplorer";
import { LinearSortExplorer } from "../components/unit2/LinearSortExplorer";
import { TreeExplorer } from "../components/unit2/TreeExplorer";
import { HeapExplorer } from "../components/unit2/HeapExplorer";
import { HashExplorer } from "../components/unit2/HashExplorer";
import { StringExplorer } from "../components/unit2/StringExplorer";
import { Unit2Theory, hasUnit2Theory } from "../components/unit2/Unit2Theory";
import { RepresentationExplorer } from "../components/unit3/RepresentationExplorer";
import { TraversalExplorer } from "../components/unit3/TraversalExplorer";
import { ComponentsExplorer } from "../components/unit3/ComponentsExplorer";
import { TopoExplorer } from "../components/unit3/TopoExplorer";
import { BiconnectedExplorer } from "../components/unit3/BiconnectedExplorer";
import { ShortestPathExplorer } from "../components/unit3/ShortestPathExplorer";
import { Unit3Theory, hasUnit3Theory } from "../components/unit3/Unit3Theory";
import {
  DijkstraImplExplorer,
  FractionalExplorer,
  HuffmanExplorer,
  MSTExplorer,
} from "../components/unit4/GreedyExplorers";
import {
  BinomialExplorer,
  KnapsackDPExplorer,
  LCSExplorer,
  MatrixChainExplorer,
} from "../components/unit4/DPExplorers";
import { Unit4Theory, hasUnit4Theory } from "../components/unit4/Unit4Theory";
import { NPCExplorer, PvsNPExplorer } from "../components/unit5/ClassExplorers";
import {
  ReductionExplorer,
  SATExplorer,
} from "../components/unit5/SatExplorers";
import {
  HamiltonExplorer,
  TSPExplorer,
} from "../components/unit5/HamTspExplorers";
import { Unit5Theory, hasUnit5Theory } from "../components/unit5/Unit5Theory";
import { subjects } from "../domain/subjects";
import {
  slug,
  topicStats,
  useActivityTracker,
  useDB,
  withActivity,
  withAttempt,
  withStudent,
  type TopicRef,
} from "../domain/tracking";
import {
  allTopics,
  topicIdea,
  units,
  type Mode,
  type UnitId,
} from "../domain/units";

type StepHandler = (k: number) => void;

/** The interactive visualizer for each topic id. */
const explorers: Record<string, (onSteps: StepHandler) => ReactNode> = {
  ram: (s) => <RamExplorer onSteps={s} />,
  asymptotic: () => <AsymptoticExplorer />,
  complexity: (s) => <ComplexityExplorer onSteps={s} />,
  paradigms: (s) => <ParadigmExplorer onSteps={s} />,
  sorting: (s) => <SortingExplorer onSteps={s} />,
  linear: (s) => <LinearSortExplorer onSteps={s} />,
  trees: (s) => <TreeExplorer onSteps={s} />,
  heaps: (s) => <HeapExplorer onSteps={s} />,
  hashing: (s) => <HashExplorer onSteps={s} />,
  matching: (s) => <StringExplorer onSteps={s} />,
  representations: () => <RepresentationExplorer />,
  traversal: (s) => <TraversalExplorer onSteps={s} />,
  components: (s) => <ComponentsExplorer onSteps={s} />,
  topological: (s) => <TopoExplorer onSteps={s} />,
  biconnected: (s) => <BiconnectedExplorer onSteps={s} />,
  shortest: (s) => <ShortestPathExplorer onSteps={s} />,
  mst: (s) => <MSTExplorer onSteps={s} />,
  dijkstra: (s) => <DijkstraImplExplorer onSteps={s} />,
  greedy: (s) => <FractionalExplorer onSteps={s} />,
  huffman: (s) => <HuffmanExplorer onSteps={s} />,
  binomial: (s) => <BinomialExplorer onSteps={s} />,
  matrixchain: (s) => <MatrixChainExplorer onSteps={s} />,
  lcs: (s) => <LCSExplorer onSteps={s} />,
  dp: (s) => <KnapsackDPExplorer onSteps={s} />,
  pnp: (s) => <PvsNPExplorer onSteps={s} />,
  npc: (s) => <NPCExplorer onSteps={s} />,
  reductions: (s) => <ReductionExplorer onSteps={s} />,
  sat: (s) => <SATExplorer onSteps={s} />,
  hamiltonian: (s) => <HamiltonExplorer onSteps={s} />,
  tsp: (s) => <TSPExplorer onSteps={s} />,
};

/** Syllabus theory notes, one component per unit. */
const theoryNotes: [
  (id: string) => boolean,
  (p: { topic: string }) => ReactNode,
][] = [
  [hasUnit1Theory, Unit1Theory],
  [hasUnit2Theory, Unit2Theory],
  [hasUnit3Theory, Unit3Theory],
  [hasUnit4Theory, Unit4Theory],
  [hasUnit5Theory, Unit5Theory],
];

const STUDENT_KEY = "vatrix-student";
const MASTERED = 75;
const currentSubject = subjects.find((s) => s.path === "/lab")!;

function readStudentName() {
  try {
    return localStorage.getItem(STUDENT_KEY) ?? "";
  } catch {
    return "";
  }
}

export function LabPage() {
  const [searchParams] = useSearchParams();
  const initialTopic =
    allTopics.find((t) => t.id === searchParams.get("topic"))?.id ?? "ram";
  const initialMode = searchParams.get("mode");
  const [mode, setMode] = useState<Mode>(
    initialMode === "student" || initialMode === "teacher"
      ? initialMode
      : "explore",
  );
  const [activeUnit, setActiveUnit] = useState<UnitId>(
    () =>
      units.find((u) => u.topics.some((t) => t.id === initialTopic))?.id ??
      "u1",
  );
  const [activeTopic, setActiveTopic] = useState(initialTopic);
  const [search, setSearch] = useState("");
  const [showTheory, setShowTheory] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [subjectMenu, setSubjectMenu] = useState(false);
  const [db, updateDB] = useDB();
  const [studentName, setStudentName] = useState(readStudentName);

  const unit = units.find((u) => u.id === activeUnit)!;
  const topic = allTopics.find((t) => t.id === activeTopic) ?? unit.topics[0];
  const topicRefs: TopicRef[] = units.flatMap((u) =>
    u.topics.map((t) => ({
      id: t.id,
      title: t.title,
      unit: `Unit ${u.number}`,
    })),
  );
  const studentId = slug(studentName);
  const student = db.students[studentId] ?? null;
  const isMastered = (topicId: string) =>
    !!student && (topicStats(student, topicId).mastery ?? 0) >= MASTERED;
  const masteredPct = Math.round(
    (100 * allTopics.filter((t) => isMastered(t.id)).length) / allTopics.length,
  );
  useActivityTracker(
    updateDB,
    student ? studentId : null,
    mode === "explore",
    activeTopic,
  );

  // The drawer covers the page on small screens: lock scrolling behind it and close on Escape.
  useEffect(() => {
    if (!navOpen) return;
    const close = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [navOpen]);

  const login = (name: string) => {
    updateDB((d) => withStudent(d, name));
    setStudentName(name.trim());
    try {
      localStorage.setItem(STUDENT_KEY, name.trim());
    } catch {
      /* storage unavailable: stay signed in for this session only */
    }
  };
  const logout = () => {
    setStudentName("");
    try {
      localStorage.removeItem(STUDENT_KEY);
    } catch {
      /* storage unavailable */
    }
  };
  const setTopic = (topicId: string, unitId?: UnitId) => {
    const parent = units.find((u) => u.topics.some((t) => t.id === topicId));
    setActiveTopic(topicId);
    setActiveUnit(unitId ?? parent?.id ?? "u1");
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  };
  const openVisualizer = (topicId: string) => {
    setTopic(topicId);
    setMode("explore");
  };
  /** Forward steps taken inside a stepper count toward the signed-in student's activity. */
  const recordSteps = (k: number) => {
    if (student && mode === "explore")
      updateDB((d) => withActivity(d, studentId, activeTopic, 0, k));
  };

  const query = search.trim().toLowerCase();
  const filteredUnits = units
    .map((u) => ({
      ...u,
      topics: u.topics.filter((t) =>
        `${t.title} ${t.subtitle} ${t.tags.join(" ")}`
          .toLowerCase()
          .includes(query),
      ),
    }))
    .filter((u) => u.topics.length);

  return (
    <div className={`app-shell ${navOpen ? "nav-open" : ""}`}>
      <div className="mobile-bar">
        <button
          className="icon-button"
          aria-label="Open course menu"
          aria-expanded={navOpen}
          onClick={() => setNavOpen(true)}
        >
          <Menu size={19} />
        </button>
        <Link to="/" className="mobile-brand" aria-label="VATRIX home">
          <img src={logo} alt="" />
          <strong>VATRIX</strong>
        </Link>
        <span className="mobile-topic">{topic.title}</span>
      </div>
      <div
        className="nav-backdrop"
        aria-hidden="true"
        onClick={() => setNavOpen(false)}
      />

      <aside className="sidebar" aria-label="Course navigation">
        <div className="sidebar-head">
          <Link to="/" className="brand" title="Back to home">
            <div className="brand-mark">
              <img src={logo} alt="VATRIX logo" />
            </div>
            <div>
              <strong>VATRIX</strong>
              <small>Visual Algorithm Space</small>
            </div>
          </Link>
          <button
            className="icon-button sidebar-close"
            aria-label="Close course menu"
            onClick={() => setNavOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="subject-switch">
          <button
            className="course-chip"
            aria-haspopup="menu"
            aria-expanded={subjectMenu}
            onClick={() => setSubjectMenu((v) => !v)}
          >
            <span className="live-dot" /> {currentSubject.title.toUpperCase()}
            <ChevronDown size={13} />
          </button>
          {subjectMenu && (
            <div className="subject-menu" role="menu">
              {subjects.map((s) =>
                s.path ? (
                  <Link
                    key={s.id}
                    to={s.path}
                    role="menuitem"
                    className={s.id === currentSubject.id ? "current" : ""}
                    onClick={() => setSubjectMenu(false)}
                  >
                    <span className="subject-menu-glyph">{s.glyph}</span>
                    {s.short}
                    {s.id === currentSubject.id && <Check size={13} />}
                  </Link>
                ) : (
                  <span key={s.id} role="menuitem" aria-disabled="true">
                    <span className="subject-menu-glyph">{s.glyph}</span>
                    {s.short}
                    <small>SOON</small>
                  </span>
                ),
              )}
              <Link
                to="/#subjects"
                role="menuitem"
                className="subject-menu-home"
              >
                <House size={13} /> All subjects
              </Link>
            </div>
          )}
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
          {filteredUnits.map((u) => {
            // While searching, show every unit's matches instead of only the active unit.
            const expanded = query !== "" || activeUnit === u.id;
            return (
              <div className="unit-group" key={u.id}>
                <button
                  className={`unit-link ${activeUnit === u.id ? "unit-active" : ""}`}
                  aria-expanded={expanded}
                  onClick={() => setActiveUnit(u.id)}
                >
                  <span className="unit-number">{u.number}</span>
                  <span className="unit-title">{u.title}</span>
                  <span className="unit-progress">
                    {u.topics.filter((t) => isMastered(t.id)).length}/
                    {u.topics.length}
                  </span>
                </button>
                {expanded && (
                  <div className="topic-links">
                    {u.topics.map((t) => (
                      <button
                        key={t.id}
                        className={`topic-link ${activeTopic === t.id ? "topic-active" : ""}`}
                        aria-current={activeTopic === t.id ? "page" : undefined}
                        onClick={() => setTopic(t.id, u.id)}
                      >
                        <span className="topic-dot" />
                        <span>{t.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {filteredUnits.length === 0 && (
            <p className="nav-empty">No topics match “{search}”.</p>
          )}
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
            Mastered = {MASTERED}%+ on recent practice. Solve problems to build
            your profile.
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
                aria-pressed={mode === "explore"}
                onClick={() => setMode("explore")}
              >
                <Sparkles size={14} /> Explore
              </button>
              <button
                className={mode === "student" ? "selected" : ""}
                aria-pressed={mode === "student"}
                onClick={() => setMode("student")}
              >
                <GraduationCap size={14} /> Student
              </button>
              <button
                className={mode === "teacher" ? "selected" : ""}
                aria-pressed={mode === "teacher"}
                onClick={() => setMode("teacher")}
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
                <>
                  <section className="theory-strip">
                    <div className="theory-icon">
                      <BrainCircuit size={19} />
                    </div>
                    <div>
                      <span className="kicker">THE IDEA</span>
                      <p>{topicIdea(activeTopic)}</p>
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
                  {theoryNotes.map(
                    ([has, Notes], k) =>
                      has(activeTopic) && <Notes key={k} topic={activeTopic} />,
                  )}
                </>
              )}

              {explorers[activeTopic]?.(recordSteps) ?? (
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
                setMode(mode === "explore" ? "student" : "explore")
              }
            >
              {mode === "explore" ? "Open practice" : "Back to explore"}{" "}
              <ArrowRight size={14} />
            </button>
          </section>
          <footer className="app-footer">
            <span>VATRIX · DESIGN & ANALYSIS OF ALGORITHMS LAB</span>
            <span>Browser-local data · No server accounts</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
