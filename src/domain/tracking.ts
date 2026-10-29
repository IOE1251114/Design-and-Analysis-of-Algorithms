import { useCallback, useEffect, useState } from "react";

/* ---------- Data model ----------
 * Everything the teacher dashboard shows is derived from these records.
 * Storage is localStorage behind loadDB/saveDB, so moving to a real backend means
 * replacing those two functions (and useDB's storage listener) with API calls. */
export interface Attempt {
  problemId: string;
  topic: string;
  correct: boolean;
  given: string;
  misconception?: string;
  hint: boolean;
  at: number;
}
export interface Activity {
  seconds: number;
  steps: number;
}
export interface Student {
  id: string;
  name: string;
  demo?: boolean;
  attempts: Attempt[];
  activity: Record<string, Activity>;
}
export interface Assignment {
  id: string;
  title: string;
  problemIds: string[];
  createdAt: number;
  auto: boolean;
}
export interface DB {
  v: 1;
  students: Record<string, Student>;
  assignments: Assignment[];
}
export interface TopicRef {
  id: string;
  title: string;
  unit: string;
}
export type Status = "none" | "struggling" | "developing" | "strong";

const KEY = "daalab-db-v4";
const empty = (): DB => ({ v: 1, students: {}, assignments: [] });

export function loadDB(): DB {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return parsed?.v === 1 ? parsed : empty();
  } catch {
    return empty();
  }
}
const saveDB = (db: DB) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* storage full or blocked */
  }
};

/** Persisted DB. Also re-syncs when another tab writes, so a teacher tab sees student activity live. */
export function useDB() {
  const [db, setDb] = useState<DB>(loadDB);
  const update = useCallback(
    (fn: (d: DB) => DB) =>
      setDb((prev) => {
        const next = fn(prev);
        saveDB(next);
        return next;
      }),
    [],
  );
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setDb(loadDB());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return [db, update] as const;
}
export type UpdateDB = ReturnType<typeof useDB>[1];

/* ---------- Immutable updates ---------- */
export const slug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function withStudent(db: DB, name: string, demo = false): DB {
  const id = slug(name);
  if (!id || db.students[id]) return db;
  return {
    ...db,
    students: {
      ...db.students,
      [id]: { id, name: name.trim(), demo, attempts: [], activity: {} },
    },
  };
}
const mapStudent = (db: DB, id: string, fn: (s: Student) => Student): DB =>
  db.students[id]
    ? { ...db, students: { ...db.students, [id]: fn(db.students[id]) } }
    : db;
export const withAttempt = (db: DB, id: string, a: Attempt) =>
  mapStudent(db, id, (s) => ({ ...s, attempts: [...s.attempts, a] }));
export const withActivity = (
  db: DB,
  id: string,
  topic: string,
  seconds: number,
  steps: number,
) =>
  mapStudent(db, id, (s) => {
    const cur = s.activity[topic] ?? { seconds: 0, steps: 0 };
    return {
      ...s,
      activity: {
        ...s.activity,
        [topic]: { seconds: cur.seconds + seconds, steps: cur.steps + steps },
      },
    };
  });
export const withoutDemo = (db: DB): DB => ({
  ...db,
  students: Object.fromEntries(
    Object.entries(db.students).filter(([, s]) => !s.demo),
  ),
});

/* ---------- Analytics ----------
 * Mastery = share of the last 6 attempts answered correctly (a correct answer after a hint counts half).
 * It needs at least 2 attempts; with less, we say "no data" instead of guessing. */
export function topicStats(s: Student, topic: string) {
  const all = s.attempts.filter((a) => a.topic === topic);
  const recent = all.slice(-6);
  const mastery =
    recent.length >= 2
      ? Math.round(
          (100 *
            recent.reduce(
              (t, a) => t + (a.correct ? (a.hint ? 0.5 : 1) : 0),
              0,
            )) /
            recent.length,
        )
      : null;
  const act = s.activity[topic];
  return {
    attempts: all.length,
    correct: all.filter((a) => a.correct).length,
    mastery,
    seconds: act?.seconds ?? 0,
    steps: act?.steps ?? 0,
  };
}
export const statusOf = (m: number | null): Status =>
  m === null
    ? "none"
    : m < 50
      ? "struggling"
      : m < 75
        ? "developing"
        : "strong";
export const statusLabel: Record<Status, string> = {
  none: "No data",
  struggling: "Struggling",
  developing: "Developing",
  strong: "Strong",
};

/** Topics where the student is below "strong", weakest first. */
export function weakTopics(s: Student, topics: TopicRef[]) {
  return topics
    .map((t) => ({ t, m: topicStats(s, t.id).mastery }))
    .filter((x) => x.m !== null && x.m < 75)
    .sort((a, b) => a.m! - b.m!);
}

export function classMastery(db: DB, topics: TopicRef[]) {
  const students = Object.values(db.students);
  return Object.fromEntries(
    topics.map((t) => {
      const ms = students
        .map((s) => topicStats(s, t.id).mastery)
        .filter((m): m is number => m !== null);
      return [
        t.id,
        {
          avg: ms.length
            ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length)
            : null,
          n: ms.length,
          below50: ms.filter((m) => m < 50).length,
        },
      ];
    }),
  ) as Record<string, { avg: number | null; n: number; below50: number }>;
}

export function topMisconceptions(db: DB, limit = 5) {
  const counts = new Map<
    string,
    { label: string; topic: string; count: number }
  >();
  for (const s of Object.values(db.students))
    for (const a of s.attempts)
      if (!a.correct && a.misconception) {
        const key = `${a.topic}|${a.misconception}`;
        counts.set(key, {
          label: a.misconception,
          topic: a.topic,
          count: (counts.get(key)?.count ?? 0) + 1,
        });
      }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

export function studentsAtRisk(db: DB, topics: TopicRef[]) {
  return Object.values(db.students)
    .map((s) => ({ s, weak: weakTopics(s, topics).filter((x) => x.m! < 50) }))
    .filter((x) => x.weak.length >= 2);
}

export function toCSV(db: DB, topics: TopicRef[]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const head = [
    "student",
    ...topics.flatMap((t) => [
      `${t.title} mastery %`,
      `${t.title} attempts`,
      `${t.title} seconds`,
    ]),
  ];
  const rows = Object.values(db.students).map((s) => [
    s.name,
    ...topics.flatMap((t) => {
      const x = topicStats(s, t.id);
      return [x.mastery ?? "", x.attempts, x.seconds];
    }),
  ]);
  return [head, ...rows].map((r) => r.map(esc).join(",")).join("\n");
}

/* ---------- Automatic activity tracking for the visualizers ----------
 * Adds 5 s of time every 5 s while the visualizer is open and the tab is visible.
 * Forward steps are recorded separately through each explorer's `onSteps`. */
export function useActivityTracker(
  update: UpdateDB,
  studentId: string | null,
  active: boolean,
  topic: string,
) {
  useEffect(() => {
    if (!studentId || !active) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible")
        update((d) => withActivity(d, studentId, topic, 5, 0));
    }, 5000);
    return () => clearInterval(timer);
  }, [studentId, active, topic, update]);
}
