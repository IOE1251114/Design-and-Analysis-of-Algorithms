/* Unit III — queue representations, expression conversion/evaluation and the maze problem. */

/* ---------- Queues on a fixed array ---------- */

export type QueueKind = "linear" | "circular";
export type QueueState = {
  buf: (number | null)[];
  front: number;
  rear: number;
  count: number;
};

export const emptyQueue = (cap: number): QueueState => ({
  buf: new Array(cap).fill(null),
  front: 0,
  rear: -1,
  count: 0,
});

export type QueueResult = { state: QueueState; message: string; ok: boolean };

/** ADD (enqueue). A linear queue overflows once REAR reaches the end, even if FRONT has moved on. */
export function enqueue(
  q: QueueState,
  x: number,
  kind: QueueKind,
): QueueResult {
  const cap = q.buf.length;
  if (q.count === cap)
    return { state: q, ok: false, message: "Overflow: every slot is in use." };
  if (kind === "linear" && q.rear === cap - 1)
    return {
      state: q,
      ok: false,
      message: `Overflow: REAR = ${cap - 1} is the last index, although ${cap - q.count} slot(s) at the front are free. A circular queue fixes this.`,
    };
  const rear = kind === "circular" ? (q.rear + 1) % cap : q.rear + 1;
  const buf = [...q.buf];
  buf[rear] = x;
  return {
    state: { buf, front: q.front, rear, count: q.count + 1 },
    ok: true,
    message:
      kind === "circular"
        ? `REAR = (REAR + 1) mod ${cap} = ${rear}; store ${x}.`
        : `REAR = ${rear}; store ${x}.`,
  };
}

/** DELETE (dequeue) from the front. */
export function dequeue(q: QueueState, kind: QueueKind): QueueResult {
  const cap = q.buf.length;
  if (q.count === 0)
    return { state: q, ok: false, message: "Underflow: the queue is empty." };
  const x = q.buf[q.front];
  const buf = [...q.buf];
  buf[q.front] = null;
  const front = kind === "circular" ? (q.front + 1) % cap : q.front + 1;
  const count = q.count - 1;
  return {
    state:
      kind === "linear" && count === 0
        ? emptyQueue(cap)
        : { buf, front, rear: q.rear, count },
    ok: true,
    message: `Remove ${x} from FRONT; FRONT = ${kind === "circular" ? `(FRONT + 1) mod ${cap} = ${front}` : front}.`,
  };
}

/** Logical contents from front to rear. */
export function queueItems(q: QueueState): number[] {
  const out: number[] = [];
  for (let k = 0; k < q.count; k++)
    out.push(q.buf[(q.front + k) % q.buf.length]!);
  return out;
}

/* ---------- Infix, prefix and postfix ---------- */

const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
const isOp = (t: string) => t in prec;
const rightAssoc = (t: string) => t === "^";

export function tokenize(expr: string): string[] {
  // Spaces separate multi-digit numbers ("12 4"), so they are skipped, not removed first.
  return expr.match(/[A-Za-z]|\d+|[-+*/^()]/g) ?? [];
}

export type ConvertFrame = {
  token?: string;
  index?: number;
  stack: string[];
  output: string[];
  title: string;
  text: string;
};

/** Infix → postfix with an operator stack (the shunting-yard method). */
export function toPostfixFrames(tokens: string[]): ConvertFrame[] {
  const frames: ConvertFrame[] = [];
  const stack: string[] = [];
  const out: string[] = [];
  const snap = (f: Omit<ConvertFrame, "stack" | "output">) =>
    frames.push({ ...f, stack: [...stack], output: [...out] });
  tokens.forEach((t, index) => {
    if (t === "(") {
      stack.push(t);
      snap({
        token: t,
        index,
        title: "Push (",
        text: "A left parenthesis always goes on the stack.",
      });
    } else if (t === ")") {
      while (stack.length && stack[stack.length - 1] !== "(")
        out.push(stack.pop()!);
      stack.pop();
      snap({
        token: t,
        index,
        title: "Pop to the matching (",
        text: "Pop operators to the output until the left parenthesis, then discard both parentheses.",
      });
    } else if (isOp(t)) {
      const popped: string[] = [];
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (!isOp(top)) break;
        if (prec[top] > prec[t] || (prec[top] === prec[t] && !rightAssoc(t))) {
          popped.push(stack.pop()!);
          out.push(popped[popped.length - 1]);
        } else break;
      }
      stack.push(t);
      snap({
        token: t,
        index,
        title: popped.length
          ? `Pop ${popped.join(" ")}, push ${t}`
          : `Push ${t}`,
        text: popped.length
          ? `Operators of higher${rightAssoc(t) ? "" : " or equal"} precedence leave the stack first.`
          : "Nothing on the stack outranks it.",
      });
    } else {
      out.push(t);
      snap({
        token: t,
        index,
        title: `Output ${t}`,
        text: "Operands go straight to the output, in their original order.",
      });
    }
  });
  while (stack.length) out.push(stack.pop()!);
  snap({ title: "Empty the stack", text: `Postfix: ${out.join(" ")}` });
  return frames;
}

/** Infix → prefix: reverse, swap parentheses, convert, reverse again. */
export function toPrefix(tokens: string[]): string[] {
  const rev = [...tokens]
    .reverse()
    .map((t) => (t === "(" ? ")" : t === ")" ? "(" : t));
  // On the reversed input, left-associative operators must not pop equals; ^ must.
  const stack: string[] = [];
  const out: string[] = [];
  for (const t of rev) {
    if (t === "(") stack.push(t);
    else if (t === ")") {
      while (stack.length && stack[stack.length - 1] !== "(")
        out.push(stack.pop()!);
      stack.pop();
    } else if (isOp(t)) {
      while (stack.length && isOp(stack[stack.length - 1])) {
        const top = stack[stack.length - 1];
        if (prec[top] > prec[t] || (prec[top] === prec[t] && rightAssoc(t)))
          out.push(stack.pop()!);
        else break;
      }
      stack.push(t);
    } else out.push(t);
  }
  while (stack.length) out.push(stack.pop()!);
  return out.reverse();
}

export type EvalFrame = {
  token: string;
  index: number;
  stack: number[];
  title: string;
  text: string;
};

const apply = (op: string, a: number, b: number) =>
  op === "+"
    ? a + b
    : op === "-"
      ? a - b
      : op === "*"
        ? a * b
        : op === "/"
          ? a / b
          : a ** b;

/** Evaluate postfix; letters are looked up in `values`. */
export function evalPostfixFrames(
  postfix: string[],
  values: Record<string, number>,
): EvalFrame[] {
  const frames: EvalFrame[] = [];
  const st: number[] = [];
  postfix.forEach((t, index) => {
    if (isOp(t)) {
      const b = st.pop() ?? NaN,
        a = st.pop() ?? NaN;
      const r = apply(t, a, b);
      st.push(r);
      frames.push({
        token: t,
        index,
        stack: [...st],
        title: `${fmt(a)} ${t} ${fmt(b)} = ${fmt(r)}`,
        text: "Pop the top two values (the second popped is the left operand), apply the operator, push the result.",
      });
    } else {
      const v = /^\d+$/.test(t) ? Number(t) : (values[t] ?? 0);
      st.push(v);
      frames.push({
        token: t,
        index,
        stack: [...st],
        title: `Push ${t}${/^\d+$/.test(t) ? "" : ` = ${v}`}`,
        text: "Operands are pushed until an operator needs them.",
      });
    }
  });
  return frames;
}

const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2));

/* ---------- Maze problem: stack (DFS with backtracking) vs queue (BFS) ---------- */

export type Pos = [number, number];
export type MazeFrame = {
  visited: Set<string>;
  frontier: Pos[];
  current?: Pos;
  path?: Pos[];
  title: string;
  text: string;
};

export const key = ([r, c]: Pos) => `${r},${c}`;

export function findCell(grid: string[], ch: string): Pos {
  for (let r = 0; r < grid.length; r++) {
    const c = grid[r].indexOf(ch);
    if (c >= 0) return [r, c];
  }
  return [0, 0];
}

const DIRS: Pos[] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

export function solveMaze(
  grid: string[],
  mode: "stack" | "queue",
): MazeFrame[] {
  const start = findCell(grid, "S"),
    end = findCell(grid, "E");
  const open = ([r, c]: Pos) =>
    r >= 0 &&
    r < grid.length &&
    c >= 0 &&
    c < grid[r].length &&
    grid[r][c] !== "#";
  const frames: MazeFrame[] = [];
  const visited = new Set<string>([key(start)]);
  const parent = new Map<string, Pos>();
  const frontier: Pos[] = [start];
  const name = mode === "stack" ? "stack" : "queue";
  while (frontier.length) {
    const cur = mode === "stack" ? frontier.pop()! : frontier.shift()!;
    if (key(cur) === key(end)) {
      const path: Pos[] = [cur];
      let k = key(cur);
      while (parent.has(k)) {
        const p = parent.get(k)!;
        path.unshift(p);
        k = key(p);
      }
      frames.push({
        visited: new Set(visited),
        frontier: [...frontier],
        current: cur,
        path,
        title: `Reached the exit: path of ${path.length - 1} moves`,
        text:
          mode === "queue"
            ? "A queue explores in rings of equal distance, so this path is a shortest one."
            : "A stack follows one corridor as deep as it can and backtracks at dead ends; its path need not be shortest.",
      });
      return frames;
    }
    let added = 0;
    for (const [dr, dc] of DIRS) {
      const nb: Pos = [cur[0] + dr, cur[1] + dc];
      if (open(nb) && !visited.has(key(nb))) {
        visited.add(key(nb));
        parent.set(key(nb), cur);
        frontier.push(nb);
        added++;
      }
    }
    frames.push({
      visited: new Set(visited),
      frontier: [...frontier],
      current: cur,
      title: `Take (${cur[0]}, ${cur[1]}) from the ${name}`,
      text: added
        ? `Add ${added} unvisited open neighbour(s) to the ${name}.`
        : mode === "stack"
          ? "Dead end: nothing new to add, so the next pop backtracks."
          : "No new neighbours here.",
    });
  }
  frames.push({
    visited: new Set(visited),
    frontier: [],
    title: "No path",
    text: `The ${name} is empty and the exit was never reached.`,
  });
  return frames;
}
