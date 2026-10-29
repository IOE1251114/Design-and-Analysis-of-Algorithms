/* Unit II — linked lists (singly, doubly, circular), polynomial arithmetic and generalized lists. */

export type ListKind = "singly" | "doubly" | "circular";
export type LNode = { id: number; value: number };

export type ListFrame = {
  nodes: LNode[];
  /** Index of the node the CUR pointer is on. */
  cur?: number;
  /** Index of the node the PREV pointer is on. */
  prev?: number;
  /** A freshly allocated node, drawn above the list before it is linked in at `at`. */
  fresh?: { value: number; at: number };
  /** For reversal: nodes [0, reversed) already point backwards. */
  reversed?: number;
  /** Index of a node being unlinked. */
  removing?: number;
  found?: number;
  steps: number;
  title: string;
  text: string;
};

export type ListOp =
  | { kind: "insert-head"; value: number }
  | { kind: "insert-tail"; value: number }
  | { kind: "insert-at"; value: number; pos: number }
  | { kind: "delete"; value: number }
  | { kind: "search"; value: number }
  | { kind: "reverse" };

let nextId = 1000;
const node = (value: number): LNode => ({ id: nextId++, value });
export const makeList = (values: number[]) => values.map(node);

const back = (k: ListKind) =>
  k === "doubly" ? " Also set the prev pointers in both directions." : "";
const ring = (k: ListKind) =>
  k === "circular"
    ? " The last node's next pointer still leads back to the head."
    : "";

/** Run one operation, returning its frames and the resulting list. */
export function listOp(
  list: LNode[],
  op: ListOp,
  kind: ListKind,
): { frames: ListFrame[]; result: LNode[] } {
  const frames: ListFrame[] = [];
  const nodes = [...list];
  let steps = 0;
  const push = (f: Omit<ListFrame, "nodes" | "steps">, ns = nodes) =>
    frames.push({ nodes: [...ns], steps, ...f });

  /** Walk CUR from the head up to (not past) index `stop`. */
  const walk = (stop: number, why: string) => {
    for (let i = 0; i <= stop && i < nodes.length; i++) {
      steps++;
      push({
        cur: i,
        prev: i > 0 ? i - 1 : undefined,
        title: `CUR → node ${i} (${nodes[i].value})`,
        text: why,
      });
    }
  };

  switch (op.kind) {
    case "insert-head": {
      push({
        fresh: { value: op.value, at: 0 },
        title: `Allocate a node for ${op.value}`,
        text: "Get a node from the free storage list (AVAIL) and store the data in it.",
      });
      steps++;
      push({
        fresh: { value: op.value, at: 0 },
        cur: 0,
        title: "NEW.next = HEAD",
        text: `Point the new node at the current first node.${back(kind)}`,
      });
      nodes.unshift(node(op.value));
      steps++;
      push({
        found: 0,
        title: "HEAD = NEW",
        text: `Insertion at the front is Θ(1): no traversal needed.${ring(kind)}`,
      });
      break;
    }
    case "insert-tail": {
      if (nodes.length)
        walk(
          nodes.length - 1,
          "Follow next pointers until CUR.next is NULL (the last node).",
        );
      steps++;
      push({
        fresh: { value: op.value, at: nodes.length },
        cur: nodes.length ? nodes.length - 1 : undefined,
        title: "LAST.next = NEW",
        text: `Link the new node after the last one.${back(kind)}`,
      });
      nodes.push(node(op.value));
      push({
        found: nodes.length - 1,
        title: `Appended ${op.value}`,
        text: `Θ(n) because of the walk to the end (Θ(1) if a TAIL pointer is kept).${ring(kind)}`,
      });
      break;
    }
    case "insert-at": {
      const pos = Math.max(0, Math.min(op.pos, nodes.length));
      if (pos === 0)
        return listOp(list, { kind: "insert-head", value: op.value }, kind);
      walk(
        pos - 1,
        `Walk to node ${pos - 1}, the node that will precede the new one.`,
      );
      steps++;
      push({
        fresh: { value: op.value, at: pos },
        cur: pos - 1,
        title: "NEW.next = CUR.next; CUR.next = NEW",
        text: `Order matters: copy CUR.next first, or the rest of the list is lost.${back(kind)}`,
      });
      nodes.splice(pos, 0, node(op.value));
      push({
        found: pos,
        title: `Inserted ${op.value} at position ${pos}`,
        text: "Only two pointers changed; no element moved in memory.",
      });
      break;
    }
    case "delete": {
      const idx = nodes.findIndex((x) => x.value === op.value);
      walk(
        idx < 0 ? nodes.length - 1 : idx,
        `Look for ${op.value}, keeping PREV one step behind CUR.`,
      );
      if (idx < 0) {
        push({
          title: `${op.value} not found`,
          text: "Reached the end of the list: nothing is deleted.",
        });
        break;
      }
      steps++;
      push({
        removing: idx,
        cur: idx,
        prev: idx > 0 ? idx - 1 : undefined,
        title: idx === 0 ? "HEAD = CUR.next" : "PREV.next = CUR.next",
        text: `Bypass the node holding ${op.value}${kind === "doubly" ? " and fix NEXT.prev" : ""}, then return it to AVAIL.`,
      });
      nodes.splice(idx, 1);
      push({
        title: `Deleted ${op.value}`,
        text: `The list now has ${nodes.length} nodes.${ring(kind)}`,
      });
      break;
    }
    case "search": {
      const idx = nodes.findIndex((x) => x.value === op.value);
      for (let i = 0; i < nodes.length; i++) {
        steps++;
        const hit = i === idx;
        push({
          cur: i,
          found: hit ? i : undefined,
          title: hit
            ? `Found ${op.value} at node ${i}`
            : `${nodes[i].value} ≠ ${op.value}`,
          text: hit
            ? `Found after ${i + 1} comparisons. Lists have no index arithmetic, so even sorted lists need a linear scan.`
            : "Follow the next pointer.",
        });
        if (hit) break;
      }
      if (idx < 0)
        push({
          title: `${op.value} not in the list`,
          text: `All ${nodes.length} nodes were compared.`,
        });
      break;
    }
    case "reverse": {
      for (let i = 0; i < nodes.length; i++) {
        steps++;
        push({
          cur: i,
          prev: i > 0 ? i - 1 : undefined,
          reversed: i,
          title:
            kind === "doubly"
              ? `Swap next and prev of node ${i}`
              : `NEXT = CUR.next; CUR.next = PREV`,
          text:
            kind === "doubly"
              ? "Each node's two pointers simply trade places."
              : "Save the rest of the list, turn CUR's arrow around, then advance PREV and CUR.",
        });
      }
      push({
        reversed: nodes.length,
        title: "HEAD = PREV",
        text: "Every arrow now points the other way.",
      });
      nodes.reverse();
      push({
        title: "Reversed",
        text: `Θ(n) time and Θ(1) extra space.${ring(kind)}`,
      });
      break;
    }
  }
  return { frames, result: nodes };
}

/* ---------- Polynomials as linked lists of (coefficient, exponent) ---------- */

export type Term = { c: number; e: number };

export const formatPoly = (p: Term[]) =>
  p.length
    ? p
        .map((t, i) => {
          const sign = t.c < 0 ? " − " : i ? " + " : "";
          const c = Math.abs(t.c);
          const coef = c === 1 && t.e ? "" : String(c);
          const x = t.e === 0 ? "" : t.e === 1 ? "x" : `x^${t.e}`;
          return `${sign}${coef}${x}`;
        })
        .join("")
    : "0";

/** Parse "3x^4 - 2x + 7" into terms sorted by decreasing exponent. */
export function parsePoly(s: string): Term[] {
  const clean = s.replace(/\s+/g, "").replace(/−/g, "-");
  const parts = clean.match(/[+-]?[^+-]+/g) ?? [];
  const terms: Term[] = [];
  for (const part of parts) {
    const m = part.match(/^([+-]?)(\d*)(x(?:\^(\d+))?)?$/);
    if (!m) continue;
    const sign = m[1] === "-" ? -1 : 1;
    const c = m[2] ? Number(m[2]) : 1;
    const e = m[3] ? (m[4] ? Number(m[4]) : 1) : 0;
    if (!m[2] && !m[3]) continue;
    terms.push({ c: sign * c, e });
  }
  return normalize(terms);
}

function normalize(terms: Term[]): Term[] {
  const by = new Map<number, number>();
  for (const t of terms) by.set(t.e, (by.get(t.e) ?? 0) + t.c);
  return [...by.entries()]
    .filter(([, c]) => c !== 0)
    .map(([e, c]) => ({ c, e }))
    .sort((a, b) => b.e - a.e);
}

export type PolyFrame = {
  p?: number;
  q?: number;
  result: Term[];
  /** Index in result that was just written or updated. */
  touched?: number;
  title: string;
  text: string;
};

export function addPolyFrames(P: Term[], Q: Term[]): PolyFrame[] {
  const frames: PolyFrame[] = [];
  const r: Term[] = [];
  let i = 0,
    j = 0;
  while (i < P.length || j < Q.length) {
    const a = P[i],
      b = Q[j];
    if (a && b && a.e === b.e) {
      const c = a.c + b.c;
      if (c !== 0) r.push({ c, e: a.e });
      frames.push({
        p: i,
        q: j,
        result: [...r],
        touched: c !== 0 ? r.length - 1 : undefined,
        title: `Equal exponents (${a.e}): add coefficients`,
        text:
          c !== 0
            ? `${a.c} + ${b.c} = ${c}. Append ${formatPoly([{ c, e: a.e }])} and advance both pointers.`
            : `${a.c} + ${b.c} = 0, so the term vanishes. Advance both pointers.`,
      });
      i++;
      j++;
    } else if (!b || (a && a.e > b.e)) {
      r.push({ ...a });
      frames.push({
        p: i,
        q: b ? j : undefined,
        result: [...r],
        touched: r.length - 1,
        title: `Copy ${formatPoly([a])} from P`,
        text: b
          ? `Exponent ${a.e} > ${b.e}: Q has no matching term yet.`
          : "Q is exhausted: copy the rest of P.",
      });
      i++;
    } else {
      r.push({ ...b });
      frames.push({
        p: a ? i : undefined,
        q: j,
        result: [...r],
        touched: r.length - 1,
        title: `Copy ${formatPoly([b])} from Q`,
        text: a
          ? `Exponent ${b.e} > ${a.e}: P has no matching term yet.`
          : "P is exhausted: copy the rest of Q.",
      });
      j++;
    }
  }
  frames.push({
    result: [...r],
    title: `Sum = ${formatPoly(r)}`,
    text: `One merge-like pass: Θ(m + n) for m and n terms.`,
  });
  return frames;
}

export function multiplyPolyFrames(P: Term[], Q: Term[]): PolyFrame[] {
  const frames: PolyFrame[] = [];
  let r: Term[] = [];
  P.forEach((a, i) =>
    Q.forEach((b, j) => {
      const prod = { c: a.c * b.c, e: a.e + b.e };
      const existing = r.findIndex((t) => t.e === prod.e);
      if (existing >= 0) r[existing] = { c: r[existing].c + prod.c, e: prod.e };
      else r.push(prod);
      r = r.filter((t) => t.c !== 0).sort((x, y) => y.e - x.e);
      frames.push({
        p: i,
        q: j,
        result: [...r],
        touched: r.findIndex((t) => t.e === prod.e),
        title: `${formatPoly([a])} × ${formatPoly([b])} = ${formatPoly([prod])}`,
        text:
          existing >= 0
            ? `A term with exponent ${prod.e} already exists: add the coefficients.`
            : `Insert the new term in exponent order.`,
      });
    }),
  );
  frames.push({
    result: [...r],
    title: `Product = ${formatPoly(r)}`,
    text: `${P.length} × ${Q.length} = ${P.length * Q.length} term products, each inserted into the result list.`,
  });
  return frames;
}

/* ---------- Generalized lists ---------- */

export type GNode =
  { tag: "atom"; value: string } | { tag: "list"; items: GNode[] };

/** Parse "(a, (b, c), d)" into a generalized list. Throws on malformed input. */
export function parseGList(src: string): GNode {
  const s = src.replace(/\s+/g, "");
  let i = 0;
  const parse = (): GNode => {
    if (s[i] === "(") {
      i++;
      const items: GNode[] = [];
      while (s[i] !== ")") {
        if (i >= s.length) throw new Error("Missing )");
        items.push(parse());
        if (s[i] === ",") i++;
      }
      i++;
      return { tag: "list", items };
    }
    const m = s.slice(i).match(/^[A-Za-z0-9]+/);
    if (!m) throw new Error(`Unexpected "${s[i] ?? "end"}"`);
    i += m[0].length;
    return { tag: "atom", value: m[0] };
  };
  const out = parse();
  if (i !== s.length) throw new Error("Extra characters after the list");
  return out;
}

export const gDepth = (g: GNode): number =>
  g.tag === "atom" ? 0 : 1 + Math.max(0, ...g.items.map(gDepth));
export const gLength = (g: GNode) => (g.tag === "list" ? g.items.length : 0);
export const gAtoms = (g: GNode): number =>
  g.tag === "atom" ? 1 : g.items.reduce((n, x) => n + gAtoms(x), 0);
export const gFormat = (g: GNode): string =>
  g.tag === "atom" ? g.value : `(${g.items.map(gFormat).join(", ")})`;
