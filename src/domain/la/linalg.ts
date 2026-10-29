/* Linear algebra core: small dense matrices, row reduction with recorded steps, determinants,
 * characteristic and minimal polynomials, eigen-analysis, Gram–Schmidt and norms.
 * Everything is pure; visualizers replay the steps these functions return. */

export type Vec = number[];
export type Mat = number[][];

const EPS = 1e-9;
export const near = (a: number, b: number, eps = 1e-7) => Math.abs(a - b) < eps;
/** Remove floating-point noise: snap values within 1e-9 of an integer, round the rest to 12 places. */
const clean = (x: number) => {
  const r = Math.round(x);
  if (Math.abs(x - r) < EPS) return r === 0 ? 0 : r;
  return Math.round(x * 1e12) / 1e12;
};

/* ---------- Formatting ---------- */

/** Show a number as an integer, a small fraction (p/q, q ≤ 12) or a 2-decimal value. */
export function fmt(x: number): string {
  if (!Number.isFinite(x)) return x > 0 ? "∞" : x < 0 ? "−∞" : "NaN";
  const r = Math.round(x);
  if (near(x, r)) return r < 0 ? `−${-r}` : String(r);
  for (let q = 2; q <= 12; q++) {
    const p = Math.round(x * q);
    if (near(x, p / q)) return `${p < 0 ? "−" : ""}${Math.abs(p)}/${q}`;
  }
  const s = x.toFixed(2);
  return s.startsWith("-") ? `−${s.slice(1)}` : s;
}

/* ---------- Basics ---------- */

export const identity = (n: number): Mat =>
  Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
export const copy = (A: Mat): Mat => A.map((r) => [...r]);
export const transpose = (A: Mat): Mat =>
  A[0].map((_, j) => A.map((r) => r[j]));
export const mul = (A: Mat, B: Mat): Mat =>
  A.map((r) =>
    B[0].map((_, j) => clean(r.reduce((s, a, k) => s + a * B[k][j], 0))),
  );
export const apply = (A: Mat, v: Vec): Vec =>
  A.map((r) => clean(r.reduce((s, a, k) => s + a * v[k], 0)));
export const add = (A: Mat, B: Mat): Mat =>
  A.map((r, i) => r.map((a, j) => a + B[i][j]));
export const scale = (A: Mat, c: number): Mat =>
  A.map((r) => r.map((a) => a * c));
export const sub = (A: Mat, B: Mat): Mat => add(A, scale(B, -1));
export const dot = (u: Vec, v: Vec) => u.reduce((s, a, i) => s + a * v[i], 0);
export const norm = (v: Vec) => Math.sqrt(dot(v, v));
export const addV = (u: Vec, v: Vec) => u.map((a, i) => a + v[i]);
export const scaleV = (v: Vec, c: number) => v.map((a) => a * c);
export const subV = (u: Vec, v: Vec) => u.map((a, i) => a - v[i]);
export const trace = (A: Mat) => A.reduce((s, r, i) => s + r[i], 0);

export function matPow(A: Mat, k: number): Mat {
  let R = identity(A.length);
  for (let i = 0; i < k; i++) R = mul(R, A);
  return R;
}

export function det(A: Mat): number {
  const M = copy(A);
  const n = M.length;
  let d = 1;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++)
      if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < EPS) return 0;
    if (p !== c) {
      [M[p], M[c]] = [M[c], M[p]];
      d = -d;
    }
    d *= M[c][c];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k < n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return clean(d);
}

/* ---------- Row reduction ---------- */

export type RowStep = {
  m: Mat;
  pivot?: [number, number];
  op: string;
  text: string;
};

/** Reduced row echelon form, recording each elementary row operation. */
export function rrefSteps(
  A: Mat,
  augmentAt?: number,
): { steps: RowStep[]; R: Mat; pivots: number[] } {
  const M = copy(A);
  const rows = M.length,
    cols = augmentAt ?? M[0].length;
  const steps: RowStep[] = [
    {
      m: copy(M),
      op: "Start",
      text: "Use row swaps, scaling and row additions to reach reduced row echelon form.",
    },
  ];
  const pivots: number[] = [];
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    let p = r;
    for (let i = r + 1; i < rows; i++)
      if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    if (Math.abs(M[p][c]) < EPS) {
      steps.push({
        m: copy(M),
        op: `Column ${c + 1}: no pivot`,
        text: `Every entry at or below row ${r + 1} in column ${c + 1} is 0, so x${c + 1} is a free variable.`,
      });
      continue;
    }
    if (p !== r) {
      [M[p], M[r]] = [M[r], M[p]];
      steps.push({
        m: copy(M),
        pivot: [r, c],
        op: `R${r + 1} ↔ R${p + 1}`,
        text: "Swap rows to bring a non-zero entry into the pivot position.",
      });
    }
    const pv = M[r][c];
    if (!near(pv, 1)) {
      M[r] = M[r].map((x) => clean(x / pv));
      steps.push({
        m: copy(M),
        pivot: [r, c],
        op: `R${r + 1} → R${r + 1} ÷ ${fmt(pv)}`,
        text: "Scale the pivot row so the pivot is 1.",
      });
    }
    for (let i = 0; i < rows; i++) {
      if (i === r || Math.abs(M[i][c]) < EPS) continue;
      const f = M[i][c];
      M[i] = M[i].map((x, k) => clean(x - f * M[r][k]));
      steps.push({
        m: copy(M),
        pivot: [r, c],
        op: `R${i + 1} → R${i + 1} − ${fmt(f)}·R${r + 1}`,
        text: `Clear the entry ${i < r ? "above" : "below"} the pivot.`,
      });
    }
    pivots.push(c);
    r++;
  }
  steps.push({
    m: copy(M),
    op: "Done",
    text: `${pivots.length} pivot${pivots.length === 1 ? "" : "s"}: the rank is ${pivots.length}.`,
  });
  return { steps, R: M, pivots };
}

export const rank = (A: Mat) => rrefSteps(A).pivots.length;

/** Basis of the null space N(A): one vector per free variable. */
export function nullSpace(A: Mat): Vec[] {
  const { R, pivots } = rrefSteps(A);
  const n = A[0].length;
  const free = Array.from({ length: n }, (_, i) => i).filter(
    (c) => !pivots.includes(c),
  );
  return free.map((f) => {
    const v = new Array(n).fill(0);
    v[f] = 1;
    pivots.forEach((pc, r) => (v[pc] = clean(-R[r][f])));
    return v;
  });
}

/** Basis of the column space R(A): the pivot columns of the original matrix. */
export function columnSpace(A: Mat): Vec[] {
  const { pivots } = rrefSteps(A);
  return pivots.map((c) => A.map((r) => r[c]));
}

/** Gauss–Jordan on [A | I]. Returns the steps and A⁻¹, or null when A is singular. */
export function inverseSteps(A: Mat): { steps: RowStep[]; inv: Mat | null } {
  const n = A.length;
  const aug = A.map((r, i) => [...r, ...identity(n)[i]]);
  const { steps, R, pivots } = rrefSteps(aug, n);
  if (pivots.length < n) return { steps, inv: null };
  return { steps, inv: R.map((r) => r.slice(n)) };
}

export const inverse = (A: Mat) => inverseSteps(A).inv;

/* ---------- Polynomials ---------- */

/** Characteristic polynomial det(λI − A) = λⁿ + c₁λⁿ⁻¹ + … + cₙ (Faddeev–LeVerrier). Returns [1, c₁, …, cₙ]. */
export function charPoly(A: Mat): number[] {
  const n = A.length;
  const c = [1];
  let M = identity(n);
  for (let k = 1; k <= n; k++) {
    const AM = mul(A, M);
    const ck = clean(-trace(AM) / k);
    c.push(ck);
    M = add(AM, scale(identity(n), ck));
  }
  return c.map(clean);
}

/** p(A) for coefficients [a₀ (leading), …, aₙ]. */
export function polyAt(coeffs: number[], A: Mat): Mat {
  const n = A.length;
  let R = scale(identity(n), 0);
  for (const a of coeffs) R = add(mul(R, A), scale(identity(n), a));
  return R.map((r) => r.map(clean));
}

export function formatPoly(coeffs: number[], v = "λ"): string {
  const d = coeffs.length - 1;
  const parts: string[] = [];
  coeffs.forEach((a, i) => {
    const p = d - i;
    if (near(a, 0)) return;
    const sign = a < 0 ? " − " : parts.length ? " + " : "";
    const abs = Math.abs(a);
    const coef = near(abs, 1) && p > 0 ? "" : fmt(abs);
    const pow = p === 0 ? "" : p === 1 ? v : `${v}${"⁰¹²³⁴⁵⁶⁷⁸⁹"[p]}`;
    parts.push(`${sign}${coef}${pow}`);
  });
  return parts.join("") || "0";
}

/** Monic polynomial of least degree with m(A) = 0, found from the first linear dependence among I, A, A², … */
export function minimalPoly(A: Mat): number[] {
  const n = A.length;
  const flat = (M: Mat) => M.flat();
  const powers: Vec[] = [flat(identity(n))];
  for (let k = 1; k <= n; k++) {
    const Ak = flat(matPow(A, k));
    // Solve Σ cᵢ·vec(Aⁱ) = vec(Aᵏ) for i < k.
    const cols = powers.length;
    const aug = Ak.map((_, row) => [...powers.map((p) => p[row]), Ak[row]]);
    const { R, pivots } = rrefSteps(aug, cols);
    const consistent = R.every(
      (r) => !(r.slice(0, cols).every((x) => near(x, 0)) && !near(r[cols], 0)),
    );
    if (consistent && pivots.length === cols) {
      const sol = new Array(cols).fill(0);
      pivots.forEach((pc, r) => (sol[pc] = R[r][cols]));
      // m(λ) = λᵏ − Σ cᵢλⁱ, listed from the leading coefficient down.
      return [1, ...sol.reverse().map((x) => clean(-x))];
    }
    powers.push(Ak);
  }
  return charPoly(A);
}

/* ---------- Complex numbers and polynomial roots ---------- */

export type C = { re: number; im: number };
export const cx = (re: number, im = 0): C => ({ re, im });
export const cadd = (a: C, b: C): C => cx(a.re + b.re, a.im + b.im);
export const csub = (a: C, b: C): C => cx(a.re - b.re, a.im - b.im);
export const cmul = (a: C, b: C): C =>
  cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const cdiv = (a: C, b: C): C => {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
export const conj = (a: C): C => cx(a.re, -a.im);
export const cabs = (a: C) => Math.hypot(a.re, a.im);
export const fmtC = (a: C) =>
  near(a.im, 0)
    ? fmt(a.re)
    : near(a.re, 0)
      ? `${fmt(a.im)}i`
      : `${fmt(a.re)} ${a.im < 0 ? "−" : "+"} ${fmt(Math.abs(a.im))}i`;

/** All roots of a polynomial (leading coefficient first) by Durand–Kerner, real parts cleaned. */
export function roots(coeffs: number[]): C[] {
  const lead = coeffs[0];
  const a = coeffs.map((x) => x / lead);
  const n = a.length - 1;
  if (n === 0) return [];
  if (n === 1) return [cx(-a[1])];
  if (n === 2) {
    const disc = a[1] * a[1] - 4 * a[2];
    if (disc >= -1e-7 * Math.max(1, a[1] * a[1])) {
      const s = Math.sqrt(Math.max(0, disc));
      return [cx(clean((-a[1] + s) / 2)), cx(clean((-a[1] - s) / 2))];
    }
    const s = Math.sqrt(-disc);
    return [cx(clean(-a[1] / 2), s / 2), cx(clean(-a[1] / 2), -s / 2)];
  }
  if (n === 3) {
    // A real cubic always has a real root: bisect for it, then deflate to a quadratic.
    // This stays accurate for repeated roots, where iterative methods drift off the real line.
    const f = (x: number) => ((x + a[1]) * x + a[2]) * x + a[3];
    let lo = -(1 + Math.max(...a.slice(1).map(Math.abs))),
      hi = -lo;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      if (f(mid) > 0) hi = mid;
      else lo = mid;
    }
    const r = snap((lo + hi) / 2);
    const b1 = a[1] + r,
      b2 = a[2] + r * b1;
    return [cx(r), ...roots([1, b1, b2]).map((z) => cx(snap(z.re), z.im))].sort(
      (x, y) => y.re - x.re || y.im - x.im,
    );
  }
  const p = (z: C) => a.reduce((acc, c) => cadd(cmul(acc, z), cx(c)), cx(0));
  let zs = Array.from({ length: n }, (_, k) =>
    cmul(cx(0.4, 0.9), cx(Math.cos(k), Math.sin(k))),
  );
  for (let it = 0; it < 500; it++) {
    zs = zs.map((z, i) => {
      let den = cx(1);
      zs.forEach((w, j) => {
        if (j !== i) den = cmul(den, csub(z, w));
      });
      return csub(z, cdiv(p(z), den));
    });
  }
  // Snap near-real and near-integer values so repeated roots compare equal.
  return zs
    .map((z) => cx(snap(z.re), Math.abs(z.im) < 1e-5 ? 0 : z.im))
    .sort((x, y) => y.re - x.re || y.im - x.im);
}

const snap = (x: number) => {
  for (const q of [1, 2, 3, 4])
    if (Math.abs(x * q - Math.round(x * q)) < 1e-4)
      return Math.round(x * q) / q;
  return x;
};

/* ---------- Eigen-analysis ---------- */

export type Eigen = {
  value: number;
  algebraic: number;
  geometric: number;
  vectors: Vec[];
};

/** Real eigenvalues with multiplicities and eigenspace bases; complex ones are reported separately. */
export function eigen(A: Mat): { real: Eigen[]; complex: C[] } {
  const rs = roots(charPoly(A));
  const real: Eigen[] = [];
  const complex: C[] = [];
  for (const r of rs) {
    if (!near(r.im, 0, 1e-6)) {
      complex.push(r);
      continue;
    }
    const e = real.find((x) => near(x.value, r.re, 1e-4));
    if (e) e.algebraic++;
    else real.push({ value: r.re, algebraic: 1, geometric: 0, vectors: [] });
  }
  for (const e of real) {
    const N = nullSpace(sub(A, scale(identity(A.length), e.value)));
    e.vectors = N;
    e.geometric = N.length;
  }
  return { real, complex };
}

export const isDiagonalizable = (A: Mat) => {
  const { real, complex } = eigen(A);
  return !complex.length && real.every((e) => e.geometric === e.algebraic);
};

/** Jordan block sizes for each real eigenvalue, from ranks of (A − λI)ᵏ. */
export function jordanBlocks(A: Mat): { value: number; sizes: number[] }[] {
  const n = A.length;
  return eigen(A).real.map((e) => {
    const N = sub(A, scale(identity(n), e.value));
    const ranks = [n];
    for (let k = 1; k <= e.algebraic; k++) ranks.push(rank(matPow(N, k)));
    // blocks of size ≥ k: ranks[k−1] − ranks[k]
    const atLeast = ranks.slice(1).map((r, k) => ranks[k] - r);
    const sizes: number[] = [];
    atLeast.forEach((cnt, k) => {
      const exactly = cnt - (atLeast[k + 1] ?? 0);
      for (let i = 0; i < exactly; i++) sizes.push(k + 1);
    });
    return { value: e.value, sizes: sizes.sort((a, b) => b - a) };
  });
}

/** The Jordan matrix assembled from the blocks (real eigenvalues only). */
export function jordanMatrix(A: Mat): Mat | null {
  const { complex } = eigen(A);
  if (complex.length) return null;
  const n = A.length;
  const J = scale(identity(n), 0);
  let at = 0;
  for (const { value, sizes } of jordanBlocks(A))
    for (const s of sizes) {
      for (let i = 0; i < s; i++) {
        J[at + i][at + i] = value;
        if (i < s - 1) J[at + i][at + i + 1] = 1;
      }
      at += s;
    }
  return J;
}

/* ---------- Inner products ---------- */

export type GSStep = {
  k: number;
  v: Vec;
  projections: Vec[];
  u: Vec;
  q: Vec | null;
  text: string;
};

/** Classical Gram–Schmidt: uₖ = vₖ − Σ ⟨vₖ, qᵢ⟩qᵢ, qₖ = uₖ/‖uₖ‖ (dependent vectors are skipped). */
export function gramSchmidt(vs: Vec[]): { steps: GSStep[]; q: Vec[] } {
  const q: Vec[] = [];
  const steps: GSStep[] = [];
  vs.forEach((v, k) => {
    const projections = q.map((qi) => scaleV(qi, dot(v, qi)));
    const u = projections.reduce((acc, p) => subV(acc, p), v).map(clean);
    const len = norm(u);
    const qk = len < 1e-9 ? null : u.map((x) => x / len);
    if (qk) q.push(qk);
    steps.push({
      k,
      v,
      projections,
      u,
      q: qk,
      text: qk
        ? `u${k + 1} = v${k + 1}${q.length > 1 ? " − its projections onto the earlier q's" : ""}; q${q.length} = u${k + 1}/‖u${k + 1}‖ (‖u‖ = ${fmt(len)}).`
        : `v${k + 1} lies in the span of the earlier vectors, so nothing is left after removing the projections: it is skipped.`,
    });
  });
  return { steps, q };
}

/** Orthogonal projection matrix onto the column space of B (columns independent). */
export function projectionMatrix(B: Mat): Mat | null {
  const Bt = transpose(B);
  const inv = inverse(mul(Bt, B));
  return inv ? mul(mul(B, inv), Bt) : null;
}

/** Least-squares line y = m·x + c through points. */
export function leastSquaresLine(
  pts: [number, number][],
): { m: number; c: number } | null {
  const A = pts.map(([x]) => [x, 1]);
  const y = pts.map(([, yy]) => [yy]);
  const At = transpose(A);
  const inv = inverse(mul(At, A));
  if (!inv) return null;
  const sol = mul(mul(inv, At), y);
  return { m: sol[0][0], c: sol[1][0] };
}

/* ---------- Norms ---------- */

export const vecNorm = (v: Vec, p: 1 | 2 | "inf") =>
  p === 1
    ? v.reduce((s, x) => s + Math.abs(x), 0)
    : p === 2
      ? norm(v)
      : Math.max(...v.map(Math.abs));

export function matrixNorms(A: Mat) {
  const one = Math.max(
    ...A[0].map((_, j) => A.reduce((s, r) => s + Math.abs(r[j]), 0)),
  );
  const inf = Math.max(...A.map((r) => r.reduce((s, x) => s + Math.abs(x), 0)));
  const fro = Math.sqrt(A.flat().reduce((s, x) => s + x * x, 0));
  const ev = eigen(mul(transpose(A), A)).real.map((e) => e.value);
  const two = Math.sqrt(Math.max(0, ...ev));
  return { one, inf, fro, two };
}

/* ---------- Classifying operators (real or complex 2 × 2 and up) ---------- */

export type CMat = C[][];
export const toC = (A: Mat): CMat => A.map((r) => r.map((x) => cx(x)));
export const adjoint = (A: CMat): CMat =>
  A[0].map((_, j) => A.map((r) => conj(r[j])));
export const cmmul = (A: CMat, B: CMat): CMat =>
  A.map((r) =>
    B[0].map((_, j) => r.reduce((s, a, k) => cadd(s, cmul(a, B[k][j])), cx(0))),
  );
const cmEq = (A: CMat, B: CMat) =>
  A.every((r, i) =>
    r.every(
      (a, j) => near(a.re, B[i][j].re, 1e-6) && near(a.im, B[i][j].im, 1e-6),
    ),
  );

export function classifyOperator(A: CMat) {
  const n = A.length;
  const As = adjoint(A);
  const I = toC(identity(n));
  const self = cmEq(A, As);
  const skew = cmEq(
    A,
    As.map((r) => r.map((x) => cx(-x.re, -x.im))),
  );
  const unitary = cmEq(cmmul(As, A), I);
  const normal = cmEq(cmmul(As, A), cmmul(A, As));
  return { selfAdjoint: self, skewAdjoint: skew, unitary, normal, adjoint: As };
}

/* ---------- Bilinear and quadratic forms ---------- */

export const bilinear = (M: Mat, u: Vec, v: Vec) => dot(u, apply(M, v));
export const symPart = (M: Mat) => scale(add(M, transpose(M)), 0.5);
export const skewPart = (M: Mat) => scale(sub(M, transpose(M)), 0.5);

export type Definiteness =
  | "positive definite"
  | "negative definite"
  | "positive semidefinite"
  | "negative semidefinite"
  | "indefinite";

/** Classify a symmetric matrix by the signs of its eigenvalues; also report leading principal minors. */
export function definiteness(S: Mat): {
  kind: Definiteness;
  minors: number[];
  eigenvalues: number[];
} {
  const minors = S.map((_, k) =>
    det(S.slice(0, k + 1).map((r) => r.slice(0, k + 1))),
  );
  const eigenvalues = roots(charPoly(S)).map((z) => z.re);
  const pos = eigenvalues.filter((x) => x > 1e-9).length,
    neg = eigenvalues.filter((x) => x < -1e-9).length;
  const n = S.length;
  const kind: Definiteness =
    pos === n
      ? "positive definite"
      : neg === n
        ? "negative definite"
        : neg === 0
          ? "positive semidefinite"
          : pos === 0
            ? "negative semidefinite"
            : "indefinite";
  return { kind, minors, eigenvalues };
}
