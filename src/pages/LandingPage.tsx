import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ChartNoAxesColumn,
  Code2,
  GraduationCap,
  ListChecks,
  Mail,
  Play,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import myLogo from "../assets/logo.png";
import { MorphField } from "../components/landing/MorphField";
import { subjects } from "../domain/subjects";
import { units } from "../domain/units";

const contact = {
  email: "ayaanmittal193@gmail.com",
  founders: ["Ayaan Mittal", "Abhishek Roy"],
};

const topicCount = units.reduce((n, u) => n + u.topics.length, 0);

const modes = [
  {
    id: "explore",
    icon: Sparkles,
    title: "Explore",
    text: "Step through every algorithm, change the input and watch the state, the counts and the complexity react.",
    cta: "Open the visualizers",
  },
  {
    id: "student",
    icon: GraduationCap,
    title: "Student",
    text: "Practice auto-graded problems with hints. Mastery per topic is tracked so you know what to revisit.",
    cta: "Start practicing",
  },
  {
    id: "teacher",
    icon: BookOpen,
    title: "Teacher",
    text: "See class accuracy, weakest topics and common misconceptions, then auto-assign practice in one click.",
    cta: "View the dashboard",
  },
] as const;

const steps = [
  {
    icon: Target,
    title: "Model",
    text: "Pick an input and state the cost model you are counting in.",
  },
  {
    icon: Play,
    title: "Execute",
    text: "Run the algorithm one step at a time and inspect every intermediate state.",
  },
  {
    icon: BrainCircuit,
    title: "Explain",
    text: "Connect each decision to the invariant that makes it correct.",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Analyze",
    text: "Compare real operation counts with the asymptotic bound.",
  },
];

export function LandingPage() {
  const { hash } = useLocation();

  useEffect(() => {
    document.title = "VATRIX — Visual Algorithm Space";
  }, []);

  // Links such as "/#subjects" from the lab land on the right section.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo({ top: 0 });
  }, [hash]);

  return (
    <div className="landing">
      <header className="landing-nav">
        <Link to="/" className="landing-brand">
          <img src={myLogo} alt="" />
          <span>
            <strong>VATRIX</strong>
            <small>Visual Algorithm Space</small>
          </span>
        </Link>
        <nav>
          <a href="#subjects">Subjects</a>
          <a href="#units">Algorithms</a>
          <a href="#modes">Modes</a>
          <a href="#method">Method</a>
          <Link to="/lab" className="btn btn-primary">
            Launch lab <ArrowRight size={14} />
          </Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="eyebrow">
              <span /> VISUAL LEARNING SPACE
            </div>
            <h1>
              Learn by watching
              <br />
              <span>ideas move.</span>
            </h1>
            <p>
              VATRIX turns computer science and mathematics into interactive
              labs. Change the input, step through every state, and check your
              understanding with auto-graded practice — one subject at a time.
            </p>
            <div className="landing-cta">
              <a href="#subjects" className="btn btn-primary btn-lg">
                Browse subjects <ArrowRight size={15} />
              </a>
              <Link to="/lab" className="btn btn-secondary btn-lg">
                <Sparkles size={15} /> Open Algorithms lab
              </Link>
            </div>
          </div>

          <div className="landing-demo">
            <MorphField />
          </div>
        </section>

        <section className="landing-section" id="subjects">
          <div className="section-head">
            <span className="kicker">SUBJECTS</span>
            <h2>One visual space, growing subject by subject</h2>
            <p>
              Every subject gets the same approach: interactive visuals, theory
              notes and tracked practice.
            </p>
          </div>
          <div className="subject-cards">
            {subjects.map((s) => {
              const body = (
                <>
                  <div className="subject-card-head">
                    <span className="subject-glyph">{s.glyph}</span>
                    <span
                      className={
                        s.path ? "subject-status live" : "subject-status"
                      }
                    >
                      {s.path ? (
                        <>
                          <span className="live-dot" /> LIVE
                        </>
                      ) : (
                        "COMING SOON"
                      )}
                    </span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  {s.path && (
                    <span className="mode-cta">
                      Open lab <ArrowRight size={13} />
                    </span>
                  )}
                </>
              );
              return s.path ? (
                <Link to={s.path} className="subject-card" key={s.id}>
                  {body}
                </Link>
              ) : (
                <div className="subject-card subject-soon" key={s.id}>
                  {body}
                </div>
              );
            })}
          </div>
        </section>

        <section className="landing-section" id="units">
          <div className="section-head">
            <span className="kicker">
              NOW LIVE · DESIGN & ANALYSIS OF ALGORITHMS
            </span>
            <h2>Five units, from Big-O to NP-completeness</h2>
            <p>
              Jump straight into any topic. Each one opens its own visualizer.
            </p>
          </div>
          <div className="unit-cards">
            {units.map((u) => (
              <article className="unit-card" key={u.id}>
                <div className="unit-card-head">
                  <span className="unit-card-num">{u.number}</span>
                  <span className="unit-card-short">
                    {u.short.toUpperCase()}
                  </span>
                </div>
                <h3>{u.title}</h3>
                <p>{u.description}</p>
                <ul>
                  {u.topics.map((t) => (
                    <li key={t.id}>
                      <Link to={`/lab?topic=${t.id}`}>
                        {t.title} <ArrowRight size={12} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section" id="modes">
          <div className="section-head">
            <span className="kicker">WORKSPACE MODES</span>
            <h2>One lab for learning, practice and teaching</h2>
          </div>
          <div className="mode-cards">
            {modes.map(({ id, icon: Icon, title, text, cta }) => (
              <Link
                to={id === "explore" ? "/lab" : `/lab?mode=${id}`}
                className="mode-card"
                key={id}
              >
                <div className="mode-icon">
                  <Icon size={20} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="mode-cta">
                  {cta} <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="landing-section" id="method">
          <div className="section-head">
            <span className="kicker">THE METHOD</span>
            <h2>Make the reasoning explicit</h2>
          </div>
          <ol className="method-steps">
            {steps.map(({ icon: Icon, title, text }, k) => (
              <li key={title}>
                <span className="method-num">0{k + 1}</span>
                <Icon size={19} />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="landing-final">
          <div>
            <Code2 size={22} />
            <h2>Ready to see it for yourself?</h2>
            <p>No sign-up needed. Progress is saved in your browser.</p>
          </div>
          <div className="landing-cta">
            <Link to="/lab" className="btn btn-primary btn-lg">
              Open Algorithms lab <ArrowRight size={15} />
            </Link>
            <Link to="/lab?mode=teacher" className="btn btn-secondary btn-lg">
              <ListChecks size={15} /> Teacher dashboard
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Link to="/" className="landing-brand">
              <img src={myLogo} alt="" />
              <span>
                <strong>VATRIX</strong>
                <small>Visual Learning Space</small>
              </span>
            </Link>
            <p>
              Vatrix builds interactive labs that turn computer science and
              mathematics into things you can see, move and test.
            </p>
            <a className="site-footer-mail" href={`mailto:${contact.email}`}>
              <Mail size={14} /> {contact.email}
            </a>
          </div>

          <div>
            <h4>Founders</h4>
            <ul>
              {contact.founders.map((name) => (
                <li key={name}>
                  <Users size={13} /> {name}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Subjects</h4>
            <ul>
              {subjects.map((s) => (
                <li key={s.id}>
                  {s.path ? (
                    <Link to={s.path}>{s.short}</Link>
                  ) : (
                    <span className="muted">{s.short} · soon</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Lab</h4>
            <ul>
              <li>
                <Link to="/lab">Explore</Link>
              </li>
              <li>
                <Link to="/lab?mode=student">Student practice</Link>
              </li>
              <li>
                <Link to="/lab?mode=teacher">Teacher dashboard</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} Vatrix. All rights reserved.</span>
          <span>Founded by {contact.founders.join(" & ")}</span>
        </div>
      </footer>
    </div>
  );
}
