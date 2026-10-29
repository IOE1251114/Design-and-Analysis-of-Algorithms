/* Unit I — vector spaces beyond the plane: ℝ³, matrix spaces, polynomial spaces and ℂⁿ. */
import {
  cabs,
  cadd,
  cmul,
  conj,
  cx,
  det,
  fmt,
  rank,
  type C,
  type Mat,
  type Vec,
} from "./linalg";

/* ---------- ℝ³ ---------- */

export const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Rank of the span of some vectors in ℝ³ and a name for its shape. */
export function spanShape(vs: Vec[]) {
  const nonzero = vs.filter((v) => v.some((x) => Math.abs(x) > 1e-12));
  const r = nonzero.length ? rank(nonzero.map((v) => [...v])) : 0;
  return {
    rank: r,
    shape: ["the origin", "a line", "a plane", "all of ℝ³"][r],
  };
}

export const triple = (a: Vec, b: Vec, c: Vec) => det([a, b, c]);

/* ---------- Matrix spaces M₂ₓ₂ ---------- */

/** Coordinates of a 2 × 2 matrix in the standard basis E₁₁, E₁₂, E₂₁, E₂₂ (row by row). */
export const vecOf = (A: Mat): Vec => A.flat();
export const matOf = (v: Vec): Mat => [
  [v[0], v[1]],
  [v[2], v[3]],
];

export type MatSubspace = {
  id: string;
  label: string;
  test: (A: Mat) => boolean;
  basis: Mat[];
  rule: string;
};

export const matSubspaces: MatSubspace[] = [
  {
    id: "sym",
    label: "Symmetric (Aᵀ = A)",
    test: (A) => near(A[0][1], A[1][0]),
    basis: [
      [
        [1, 0],
        [0, 0],
      ],
      [
        [0, 1],
        [1, 0],
      ],
      [
        [0, 0],
        [0, 1],
      ],
    ],
    rule: "b = c",
  },
  {
    id: "skew",
    label: "Skew-symmetric (Aᵀ = −A)",
    test: (A) =>
      near(A[0][0], 0) && near(A[1][1], 0) && near(A[0][1], -A[1][0]),
    basis: [
      [
        [0, 1],
        [-1, 0],
      ],
    ],
    rule: "a = d = 0, c = −b",
  },
  {
    id: "diag",
    label: "Diagonal",
    test: (A) => near(A[0][1], 0) && near(A[1][0], 0),
    basis: [
      [
        [1, 0],
        [0, 0],
      ],
      [
        [0, 0],
        [0, 1],
      ],
    ],
    rule: "b = c = 0",
  },
  {
    id: "trace0",
    label: "Trace zero",
    test: (A) => near(A[0][0] + A[1][1], 0),
    basis: [
      [
        [1, 0],
        [0, -1],
      ],
      [
        [0, 1],
        [0, 0],
      ],
      [
        [0, 0],
        [1, 0],
      ],
    ],
    rule: "a + d = 0",
  },
  {
    id: "upper",
    label: "Upper triangular",
    test: (A) => near(A[1][0], 0),
    basis: [
      [
        [1, 0],
        [0, 0],
      ],
      [
        [0, 1],
        [0, 0],
      ],
      [
        [0, 0],
        [0, 1],
      ],
    ],
    rule: "c = 0",
  },
  {
    id: "invertible",
    label: "Invertible (det ≠ 0)",
    test: (A) => !near(det(A), 0),
    basis: [],
    rule: "det ≠ 0 — not a subspace: it misses the zero matrix",
  },
];

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

/* ---------- Polynomial spaces Pₙ ---------- */

/** Coefficients [a₀, a₁, …, aₙ] for a₀ + a₁x + … + aₙxⁿ. */
export type Poly = number[];

export const polyEval = (p: Poly, x: number) =>
  p.reduceRight((acc, a) => acc * x + a, 0);
export const polyAdd = (p: Poly, q: Poly, a = 1, b = 1): Poly =>
  p.map((x, i) => a * x + b * (q[i] ?? 0));
export const derivative = (p: Poly): Poly => [
  ...p.slice(1).map((a, i) => a * (i + 1)),
  0,
];

export function polyString(p: Poly, v = "x") {
  const parts: string[] = [];
  p.forEach((a, i) => {
    if (Math.abs(a) < 1e-12) return;
    const sign = a < 0 ? " − " : parts.length ? " + " : "";
    const abs = Math.abs(a);
    const coef = abs === 1 && i > 0 ? "" : fmt(abs);
    const pow = i === 0 ? "" : i === 1 ? v : `${v}${"⁰¹²³⁴⁵⁶⁷⁸⁹"[i]}`;
    parts.push(`${sign}${coef}${pow}`);
  });
  return parts.join("") || "0";
}

/** Matrix of d/dx on Pₙ in the basis {1, x, …, xⁿ}: column j holds the coordinates of D(xʲ). */
export function derivativeMatrix(n: number): Mat {
  return Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (j === i + 1 ? j : 0)),
  );
}

/** Coordinates of p in the shifted basis {1, (x − c), (x − c)², …}: Taylor coefficients p⁽ᵏ⁾(c)/k!. */
export function shiftedCoords(p: Poly, c: number): Vec {
  const out: number[] = [];
  let d = [...p];
  let fact = 1;
  for (let k = 0; k < p.length; k++) {
    if (k > 0) fact *= k;
    out.push(polyEval(d, c) / fact);
    d = derivative(d);
  }
  return out;
}

/* ---------- Complex vector spaces ℂⁿ ---------- */

export const cscale = (c: C, v: C[]): C[] => v.map((z) => cmul(c, z));
export const cvadd = (u: C[], v: C[]): C[] => u.map((z, i) => cadd(z, v[i]));
/** ⟨u, v⟩ = Σ uᵢ · conj(vᵢ): linear in the first slot, conjugate-linear in the second. */
export const cinner = (u: C[], v: C[]): C =>
  u.reduce((s, z, i) => cadd(s, cmul(z, conj(v[i]))), cx(0));
export const cnorm = (u: C[]) =>
  Math.sqrt(u.reduce((s, z) => s + cabs(z) ** 2, 0));
export const polar = (z: C) => ({ r: cabs(z), theta: Math.atan2(z.im, z.re) });
