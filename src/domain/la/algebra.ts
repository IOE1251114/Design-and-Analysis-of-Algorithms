/* Unit I — groups, rings and fields on the integers mod n. */

export type Op = "add" | "mul";
export type Structure = { label: string; op: Op; elements: number[] };

export const structures = (n: number): Record<string, Structure> => ({
  add: { label: `(ℤ${sub(n)}, +)`, op: "add", elements: range(n) },
  mul: { label: `(ℤ${sub(n)}, ×)`, op: "mul", elements: range(n) },
  units: {
    label: `(ℤ${sub(n)} \\ {0}, ×)`,
    op: "mul",
    elements: range(n).slice(1),
  },
});

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const sub = (n: number) =>
  String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]);

export const combine = (op: Op, a: number, b: number, n: number) =>
  op === "add" ? (a + b) % n : (a * b) % n;

export type AxiomCheck = {
  name: string;
  ok: boolean;
  /** A counterexample when the axiom fails. */
  witness?: string;
};

export function checkGroup(s: Structure, n: number) {
  const { op, elements } = s;
  const sym = op === "add" ? "+" : "×";
  const set = new Set(elements);
  const f = (a: number, b: number) => combine(op, a, b, n);
  const checks: AxiomCheck[] = [];
  // Closure
  let w: string | undefined;
  outer: for (const a of elements)
    for (const b of elements)
      if (!set.has(f(a, b))) {
        w = `${a} ${sym} ${b} = ${f(a, b)} is not in the set`;
        break outer;
      }
  checks.push({ name: "Closure", ok: !w, witness: w });
  // Associativity holds for + and × mod n.
  checks.push({ name: "Associativity", ok: true });
  const e = elements.find((x) =>
    elements.every((a) => f(x, a) === a && f(a, x) === a),
  );
  checks.push({
    name: "Identity",
    ok: e !== undefined,
    witness:
      e === undefined ? "no element leaves every other unchanged" : undefined,
  });
  let inv: string | undefined;
  if (e !== undefined)
    for (const a of elements)
      if (!elements.some((b) => f(a, b) === e)) {
        inv = `${a} has no inverse: no b gives ${a} ${sym} b = ${e}`;
        break;
      }
  checks.push({
    name: "Inverses",
    ok: e !== undefined && !inv,
    witness: e === undefined ? "needs an identity first" : inv,
  });
  checks.push({ name: "Commutative (abelian)", ok: true });
  const isGroup = checks.slice(0, 4).every((c) => c.ok);
  return { checks, identity: e, isGroup };
}

export const isPrime = (n: number) =>
  n > 1 &&
  Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d !== 0);

/** ℤₙ is always a commutative ring with 1; it is a field exactly when n is prime. */
export function ringSummary(n: number) {
  const zeroDivisors: [number, number][] = [];
  for (let a = 1; a < n; a++)
    for (let b = a; b < n; b++)
      if ((a * b) % n === 0) zeroDivisors.push([a, b]);
  const units = range(n).filter((a) => range(n).some((b) => (a * b) % n === 1));
  return { field: isPrime(n), zeroDivisors, units };
}
