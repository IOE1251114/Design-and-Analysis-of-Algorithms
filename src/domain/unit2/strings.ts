/* Unit 2 — string matching: naive, Knuth–Morris–Pratt and Boyer–Moore (bad-character + good-suffix rules).
 * Every character comparison is one frame, so the comparison counts shown are exact. */

export type MatchAlgo = "naive" | "kmp" | "bm";
export interface MatchFrame {
  s: number; // current alignment: pattern[0] sits under text[s]
  j: number | null; // pattern index being compared (null between alignments)
  marks: { p: number; ok: boolean }[]; // comparisons made at this alignment so far
  status: "compare" | "mismatch" | "found" | "shift" | "done";
  shift?: number;
  rule?: string;
  matches: number[];
  comparisons: number;
  title: string;
  text: string;
}

/** KMP prefix function: lps[i] = length of the longest proper prefix of P[0..i] that is also a suffix of it. */
export function lpsTable(P: string) {
  const lps = Array(P.length).fill(0),
    frames: {
      i: number;
      len: number;
      lps: number[];
      ok: boolean | null;
      text: string;
    }[] = [];
  let len = 0,
    i = 1;
  while (i < P.length) {
    if (P[i] === P[len]) {
      len++;
      lps[i] = len;
      frames.push({
        i,
        len,
        lps: [...lps],
        ok: true,
        text: `P[${i}] = P[${len - 1}] = '${P[i]}': the border grows, lps[${i}] = ${len}.`,
      });
      i++;
    } else if (len) {
      const old = len;
      len = lps[len - 1];
      frames.push({
        i,
        len,
        lps: [...lps],
        ok: false,
        text: `P[${i}] ≠ P[${old}]: fall back to the next shorter border, len = lps[${old - 1}] = ${len}.`,
      });
    } else {
      lps[i] = 0;
      frames.push({
        i,
        len,
        lps: [...lps],
        ok: false,
        text: `P[${i}] = '${P[i]}' ≠ P[0]: no border, lps[${i}] = 0.`,
      });
      i++;
    }
  }
  return { lps, frames };
}

/** Boyer–Moore tables. last[c] = rightmost index of c in P (−1 if absent). gs[j] = shift when P[j..] matched and P[j−1] mismatched. */
export function bmTables(P: string) {
  const m = P.length,
    last: Record<string, number> = {};
  for (let i = 0; i < m; i++) last[P[i]] = i;
  const gs = Array(m + 1).fill(0),
    bpos = Array(m + 1).fill(0);
  let i = m,
    j = m + 1;
  bpos[i] = j;
  while (i > 0) {
    while (j <= m && P[i - 1] !== P[j - 1]) {
      if (gs[j] === 0) gs[j] = j - i;
      j = bpos[j];
    }
    i--;
    j--;
    bpos[i] = j;
  }
  j = bpos[0];
  for (i = 0; i <= m; i++) {
    if (gs[i] === 0) gs[i] = j;
    if (i === j) j = bpos[j];
  }
  return { last, gs };
}

export function matchTrace(
  algo: MatchAlgo,
  T: string,
  P: string,
  record = true,
) {
  const n = T.length,
    m = P.length,
    frames: MatchFrame[] = [],
    matches: number[] = [];
  let comparisons = 0;
  const push = (f: Omit<MatchFrame, "matches" | "comparisons">) => {
    if (record) frames.push({ ...f, matches: [...matches], comparisons });
  };
  if (!m || m > n) {
    push({
      s: 0,
      j: null,
      marks: [],
      status: "done",
      title: "Nothing to search",
      text: "The pattern must be non-empty and no longer than the text.",
    });
    return { frames, matches, comparisons };
  }

  if (algo === "naive") {
    for (let s = 0; s <= n - m; s++) {
      const marks: { p: number; ok: boolean }[] = [];
      let j = 0;
      for (; j < m; j++) {
        comparisons++;
        const ok = T[s + j] === P[j];
        marks.push({ p: j, ok });
        push({
          s,
          j,
          marks: [...marks],
          status: ok ? "compare" : "mismatch",
          title: `Shift ${s}: compare T[${s + j}] with P[${j}]`,
          text: ok
            ? `'${T[s + j]}' = '${P[j]}': keep going right.`
            : `'${T[s + j]}' ≠ '${P[j]}': give up on this alignment and slide by exactly 1.`,
        });
        if (!ok) break;
      }
      if (j === m) {
        matches.push(s);
        push({
          s,
          j: null,
          marks: [...marks],
          status: "found",
          title: `Match at index ${s}`,
          text: "Every character matched. Slide by 1 and continue.",
        });
      }
    }
  }

  if (algo === "kmp") {
    const { lps } = lpsTable(P);
    let i = 0,
      j = 0,
      marks: { p: number; ok: boolean }[] = [];
    while (i < n) {
      comparisons++;
      const ok = T[i] === P[j];
      marks.push({ p: j, ok });
      push({
        s: i - j,
        j,
        marks: [...marks],
        status: ok ? "compare" : "mismatch",
        title: `Compare T[${i}] with P[${j}]`,
        text: ok
          ? `'${T[i]}' = '${P[j]}': advance both i and j.`
          : `'${T[i]}' ≠ '${P[j]}'. ${j ? `The ${j} characters already matched end with a border of length lps[${j - 1}] = ${lps[j - 1]}, so slide the pattern by ${j - lps[j - 1]} and keep i where it is.` : "Nothing matched yet, so move i forward."}`,
      });
      if (ok) {
        i++;
        j++;
        if (j === m) {
          matches.push(i - m);
          push({
            s: i - m,
            j: null,
            marks: [...marks],
            status: "found",
            shift: m - lps[m - 1],
            rule: "lps",
            title: `Match at index ${i - m}`,
            text: `Full match. Continue from the border: j = lps[${m - 1}] = ${lps[m - 1]}, so the pattern slides by ${m - lps[m - 1]}.`,
          });
          j = lps[m - 1];
          marks = Array.from({ length: j }, (_, p) => ({ p, ok: true }));
        }
      } else if (j) {
        const nj = lps[j - 1];
        push({
          s: i - j,
          j: null,
          marks: [...marks],
          status: "shift",
          shift: j - nj,
          rule: "lps",
          title: `Slide by ${j - nj}`,
          text: `The text pointer never moves back: KMP looks at each text character a bounded number of times, Θ(n + m) overall.`,
        });
        j = nj;
        marks = Array.from({ length: j }, (_, p) => ({ p, ok: true }));
      } else {
        i++;
        marks = [];
      }
    }
  }

  if (algo === "bm") {
    const { last, gs } = bmTables(P);
    let s = 0;
    while (s <= n - m) {
      let j = m - 1;
      const marks: { p: number; ok: boolean }[] = [];
      while (j >= 0) {
        comparisons++;
        const ok = P[j] === T[s + j];
        marks.push({ p: j, ok });
        push({
          s,
          j,
          marks: [...marks],
          status: ok ? "compare" : "mismatch",
          title: `Shift ${s}: compare P[${j}] with T[${s + j}] (right to left)`,
          text: ok
            ? `'${P[j]}' = '${T[s + j]}': move left.`
            : `'${P[j]}' ≠ '${T[s + j]}'.`,
        });
        if (!ok) break;
        j--;
      }
      if (j < 0) {
        matches.push(s);
        push({
          s,
          j: null,
          marks: [...marks],
          status: "found",
          shift: gs[0],
          rule: "good suffix",
          title: `Match at index ${s}`,
          text: `Full match. The good-suffix rule says slide by ${gs[0]}.`,
        });
        s += gs[0];
      } else {
        const c = T[s + j],
          bc = j - (last[c] ?? -1),
          g = gs[j + 1],
          sh = Math.max(bc, g);
        const rule = bc >= g ? "bad character" : "good suffix";
        push({
          s,
          j: null,
          marks: [...marks],
          status: "shift",
          shift: sh,
          rule,
          title: `Slide by ${sh} (${rule})`,
          text: `Bad character: '${c}' ${last[c] === undefined ? "does not occur in the pattern, so the pattern can jump past it" : `last occurs at P[${last[c]}]`} → shift ${bc}. Good suffix (${m - 1 - j} char${m - 1 - j === 1 ? "" : "s"} matched) → shift ${g}. Take the larger: ${sh}.`,
        });
        s += sh;
      }
    }
  }
  push({
    s: Math.min(n - m, Math.max(0, n - m)),
    j: null,
    marks: [],
    status: "done",
    title: matches.length
      ? `Done: ${matches.length} match${matches.length > 1 ? "es" : ""}`
      : "Done: no match",
    text: `${comparisons} character comparisons in total.`,
  });
  return { frames, matches, comparisons };
}
