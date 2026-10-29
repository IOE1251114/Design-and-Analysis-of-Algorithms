import { useEffect, useMemo, useState } from "react";
import {
  Axis3d,
  Layers3,
  Orbit,
  Ruler,
  Scale,
  SquareFunction,
} from "lucide-react";
import {
  apply,
  charPoly,
  det,
  eigen,
  fmt,
  fmtC,
  formatPoly,
  identity,
  inverse,
  isDiagonalizable,
  jordanBlocks,
  jordanMatrix,
  matPow,
  matrixNorms,
  minimalPoly,
  mul,
  norm,
  polyAt,
  rank,
  scale,
  sub,
  trace,
  transpose,
  vecNorm,
  type Mat,
  type Vec,
} from "../../../domain/la/linalg";
import {
  Arrow,
  Explain,
  InfiniteLine,
  LC,
  MatrixInput,
  MatrixView,
  Panel,
  Plane,
  PlayerBar,
  Presets,
  Slider,
  Stats,
  Tabs,
  usePlayer,
  VecView,
  type StepProps,
} from "../kit";
import { transformPresets } from "../unit2/TransformExplorers";

/* ======================= Trace and determinant ======================= */

export function DetTraceExplorer() {
  const [A, setA] = useState<Mat>([
    [2, 1],
    [0.5, 1.5],
  ]);
  const [B, setB] = useState<Mat>([
    [2, -1, 0],
    [1, 3, 2],
    [0, 1, 4],
  ]);
  const d = det(A);
  const e = eigen(A);
  const cof = B[0].map((a, j) => {
    const minor = B.slice(1).map((r) => r.filter((_, k) => k !== j));
    return { a, sign: j % 2 ? -1 : 1, minor, m: det(minor) };
  });
  return (
    <Panel
      kicker="UNIT III · TRACE & DETERMINANT"
      title="Area scale and the sum of eigenvalues"
      intro="det A is the factor by which T scales areas (negative when it flips orientation). trace A is the sum of the diagonal — and also the sum of the eigenvalues, while det A is their product. Both are the same for Aᵀ."
      icon={<Scale size={19} />}
    >
      <Presets items={transformPresets} onPick={setA} />
      <div className="la-split">
        <Plane ariaLabel="Unit square and its image" warp={A}>
          {(P) => {
            const pts = [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
            ].map((q) => apply(A, q));
            return (
              <>
                <polygon
                  points={[
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                  ]
                    .map(P.p)
                    .join(" ")}
                  fill={LC.muted}
                  opacity={0.25}
                />
                <polygon
                  points={pts.map(P.p).join(" ")}
                  fill={d < 0 ? LC.bad : LC.result}
                  opacity={0.3}
                  stroke={d < 0 ? LC.bad : LC.result}
                  strokeWidth={2}
                />
                <Arrow P={P} to={pts[1]} color={LC.u} label="Ae₁" />
                <Arrow P={P} to={pts[3]} color={LC.v} label="Ae₂" />
              </>
            );
          }}
        </Plane>
        <div>
          <MatrixInput m={A} onChange={setA} label="A =" />
          <Stats
            items={[
              {
                label: "det A = ad − bc",
                value: fmt(d),
                note:
                  d < 0
                    ? "orientation flipped (red)"
                    : d === 0
                      ? "the square collapses"
                      : "area scale factor",
              },
              { label: "trace A", value: fmt(trace(A)) },
              {
                label: "EIGENVALUES",
                value: e.complex.length
                  ? e.complex.map(fmtC).join(", ")
                  : e.real
                      .flatMap((x) => Array(x.algebraic).fill(fmt(x.value)))
                      .join(", "),
              },
              {
                label: "det Aᵀ · trace Aᵀ",
                value: `${fmt(det(transpose(A)))} · ${fmt(trace(transpose(A)))}`,
                note: "the transpose has the same both",
              },
            ]}
          />
        </div>
      </div>
      <div className="la-split">
        <MatrixInput m={B} onChange={setB} label="3 × 3 — expand along row 1" />
        <Explain
          title={`det = ${fmt(det(B))}`}
          text={
            <>
              {cof.map((c, j) => (
                <span key={j}>
                  {j ? (c.sign < 0 ? " − " : " + ") : ""}
                  {fmt(c.a)}·({fmt(c.m)})
                </span>
              ))}{" "}
              — each term is an entry times the determinant of the 2 × 2 minor
              left after deleting its row and column, with alternating signs.
            </>
          }
        />
      </div>
    </Panel>
  );
}

/* ======================= Eigenvalues and eigenvectors ======================= */

export function EigenExplorer() {
  const [A, setA] = useState<Mat>([
    [2, 1],
    [1, 2],
  ]);
  const [theta, setTheta] = useState(0.3);
  const [spin, setSpin] = useState(true);
  useEffect(() => {
    if (!spin) return;
    const id = setInterval(
      () => setTheta((t) => (t + 0.012) % (2 * Math.PI)),
      30,
    );
    return () => clearInterval(id);
  }, [spin]);
  const x: Vec = [2 * Math.cos(theta), 2 * Math.sin(theta)];
  const Ax = apply(A, x);
  const cross = x[0] * Ax[1] - x[1] * Ax[0];
  const parallel = Math.abs(cross) < 0.18 * norm(Ax) + 1e-9;
  const e = eigen(A);
  const p = charPoly(A);
  return (
    <Panel
      kicker="UNIT III · EIGENVALUES & EIGENVECTORS"
      title="Directions that only stretch"
      intro="An eigenvector v ≠ 0 satisfies Av = λv: T does not turn it, only scales it by λ. Watch x sweep round the circle: when Ax lines up with x, x is an eigenvector."
      icon={<Orbit size={19} />}
    >
      <Presets
        items={[
          {
            label: "Symmetric",
            value: [
              [2, 1],
              [1, 2],
            ],
          },
          ...transformPresets,
        ]}
        onPick={setA}
      />
      <div className="la-split">
        <Plane ariaLabel="Rotating vector x and its image Ax" range={6}>
          {(P) => (
            <>
              <circle
                cx={P.X(0)}
                cy={P.Y(0)}
                r={P.X(2) - P.X(0)}
                fill="none"
                stroke={LC.muted}
                strokeDasharray="3 4"
              />
              {e.real
                .flatMap((ev) => ev.vectors)
                .map((v, i) => (
                  <InfiniteLine
                    key={i}
                    P={P}
                    dir={v}
                    color={LC.result}
                    width={1.4}
                    dash="6 4"
                  />
                ))}
              <Arrow P={P} to={x} color={LC.u} label="x" />
              <Arrow
                P={P}
                to={Ax}
                color={parallel ? LC.result : LC.v}
                width={parallel ? 3.4 : 2.4}
                label="Ax"
              />
            </>
          )}
        </Plane>
        <div>
          <MatrixInput m={A} onChange={setA} label="A =" />
          <div className="la-row">
            <button
              className="btn btn-secondary"
              onClick={() => setSpin((s) => !s)}
            >
              {spin ? "Pause sweep" : "Sweep x around"}
            </button>
          </div>
          <Slider
            label="angle of x (rad)"
            value={+theta.toFixed(2)}
            min={0}
            max={6.28}
            step={0.01}
            onChange={(t) => {
              setSpin(false);
              setTheta(t);
            }}
          />
          <Explain
            title={
              parallel
                ? `x is (nearly) an eigenvector: Ax ≈ ${fmt((norm(Ax) / norm(x)) * Math.sign(Ax[0] * x[0] + Ax[1] * x[1]))}·x`
                : "Ax points somewhere else"
            }
            text={`det(λI − A) = ${formatPoly(p)}. ${e.complex.length ? `Its roots ${e.complex.map(fmtC).join(", ")} are complex, so no real direction is left unturned.` : `Roots λ = ${e.real.map((r) => fmt(r.value)).join(", ")}; the green dashed lines are the eigenspaces.`}`}
          />
          <div className="la-vecs">
            {e.real.map((r) =>
              r.vectors.map((v, i) => (
                <span key={`${r.value}-${i}`}>
                  λ = {fmt(r.value)}: <VecView v={v} color={LC.result} />
                </span>
              )),
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Minimal polynomial and Cayley–Hamilton ======================= */

const chPresets: { label: string; value: Mat }[] = [
  {
    label: "2 × 2",
    value: [
      [1, 2],
      [3, 4],
    ],
  },
  {
    label: "3 × 3",
    value: [
      [2, 1, 0],
      [1, 3, 1],
      [0, 1, 4],
    ],
  },
  {
    label: "3I (min poly degree 1)",
    value: [
      [3, 0, 0],
      [0, 3, 0],
      [0, 0, 3],
    ],
  },
  {
    label: "Repeated eigenvalue",
    value: [
      [2, 1, 0],
      [0, 2, 0],
      [0, 0, 2],
    ],
  },
];

export function CayleyHamiltonExplorer({ onSteps }: StepProps) {
  const [A, setA] = useState<Mat>(chPresets[1].value);
  const p = charPoly(A);
  const n = A.length;
  // Partial sums of p(A) term by term: A³ + c₁A² + c₂A + c₃I.
  const terms = p.map((c, i) => ({
    c,
    k: n - i,
    M: scale(matPow(A, n - i), c),
  }));
  const steps = terms.map((_, i) =>
    terms
      .slice(0, i + 1)
      .reduce(
        (S, t) => S.map((r, a) => r.map((x, b) => x + t.M[a][b])),
        scale(identity(n), 0),
      ),
  );
  const pl = usePlayer(steps.length, JSON.stringify(A), onSteps);
  const t = terms[pl.step];
  const m = minimalPoly(A);
  const d = det(A);
  const inv = Math.abs(d) > 1e-9 ? inverse(A) : null;
  return (
    <Panel
      kicker="UNIT III · MINIMAL POLYNOMIAL · CAYLEY–HAMILTON"
      title="Every matrix satisfies its own characteristic equation"
      intro="Cayley–Hamilton: if p(λ) = det(λI − A), then p(A) = 0. The minimal polynomial is the monic polynomial of least degree with m(A) = 0; it divides p(λ) and has the same roots."
      icon={<SquareFunction size={19} />}
    >
      <Presets items={chPresets} onPick={setA} />
      <div className="la-split">
        <div>
          <MatrixInput m={A} onChange={(M) => setA(M)} label="A =" />
          <p className="la-eq">p(λ) = {formatPoly(p)}</p>
          <p className="la-eq">m(λ) = {formatPoly(m)}</p>
        </div>
        <div>
          <MatrixView
            m={t.M}
            label={`term: ${fmt(t.c)}·A${t.k ? (t.k === 1 ? "" : "^" + t.k) : "⁰ = I"}`}
            small
          />
          <MatrixView
            m={steps[pl.step]}
            label={`running sum after ${pl.step + 1} of ${steps.length} terms`}
          />
        </div>
      </div>
      <Explain
        title={
          pl.step === steps.length - 1
            ? "p(A) = 0 ✓"
            : "Add the next term of p(A)"
        }
        text={
          pl.step === steps.length - 1
            ? `Every entry cancels. ${m.length < p.length ? `Here the minimal polynomial has degree ${m.length - 1} < ${n}: A already satisfies a shorter equation.` : "Here the minimal polynomial equals the characteristic polynomial."}`
            : "Each step adds cₖ·Aᵏ; watch the running sum head to the zero matrix."
        }
      />
      <PlayerBar p={pl} />
      {inv && (
        <p className="u1-small">
          Application: since p(A) = 0 and the constant term is {fmt(p[n])} ≠ 0,
          A⁻¹ = −(1/{fmt(p[n])})·(A{n > 2 ? "²" : ""}
          {p
            .slice(1, n)
            .map(
              (c, i) =>
                ` ${c < 0 ? "−" : "+"} ${fmt(Math.abs(c))}${n - 2 - i > 0 ? "A" : "I"}`,
            )
            .join("")}
          ) — no row reduction needed.
        </p>
      )}
      <Stats
        items={[
          { label: "deg p", value: n },
          { label: "deg m", value: m.length - 1 },
          {
            label: "rank(p(A))",
            value: rank(polyAt(p, A)),
            note: "0 means p(A) is the zero matrix",
          },
        ]}
      />
    </Panel>
  );
}

/* ======================= Diagonalization ======================= */

export function DiagonalizeExplorer() {
  const [A, setA] = useState<Mat>([
    [1.5, 0.5],
    [0.5, 1.5],
  ]);
  const [k, setK] = useState(3);
  const [x, setX] = useState<Vec>([-1, 1.5]);
  const e = eigen(A);
  const vecs = e.real.flatMap((r) => r.vectors);
  const diag = isDiagonalizable(A) && vecs.length === 2;
  const P = diag
    ? [
        [vecs[0][0], vecs[1][0]],
        [vecs[0][1], vecs[1][1]],
      ]
    : null;
  const lambdas = e.real.flatMap((r) => r.vectors.map(() => r.value));
  const D = diag
    ? [
        [lambdas[0], 0],
        [0, lambdas[1]],
      ]
    : null;
  const path = useMemo(() => {
    const out: Vec[] = [x];
    for (let i = 0; i < k; i++) out.push(apply(A, out[out.length - 1]));
    return out;
  }, [A, x, k]);
  return (
    <Panel
      kicker="UNIT III · DIAGONALIZATION"
      title="In the right basis, A only stretches"
      intro="A is diagonalizable when it has n independent eigenvectors. Then A = PDP⁻¹ with eigenvectors in P and eigenvalues on the diagonal of D, and powers are easy: Aᵏ = PDᵏP⁻¹."
      icon={<Axis3d size={19} />}
    >
      <Presets
        items={[
          {
            label: "Symmetric",
            value: [
              [1.5, 0.5],
              [0.5, 1.5],
            ],
          },
          {
            label: "Distinct eigenvalues",
            value: [
              [1, 1],
              [0, 0.5],
            ],
          },
          {
            label: "Shear (defective)",
            value: [
              [1, 1],
              [0, 1],
            ],
          },
          {
            label: "Rotation",
            value: [
              [0, -1],
              [1, 0],
            ],
          },
        ]}
        onPick={setA}
      />
      <div className="la-split">
        <Plane
          ariaLabel="Eigenbasis grid and repeated application of A"
          warp={P ?? undefined}
          range={6}
          handles={[{ id: "x", at: x, color: LC.u, label: "x", drag: true }]}
          onDrag={(_, q) => setX(q)}
        >
          {(Pj) => (
            <>
              {path.slice(1).map((q, i) => (
                <Arrow
                  key={i}
                  P={Pj}
                  from={path[i]}
                  to={q}
                  color={i === path.length - 2 ? LC.result : LC.v}
                  width={1.6}
                  label={
                    i === path.length - 2
                      ? `A${k > 1 ? "^" + k : ""}x`
                      : undefined
                  }
                />
              ))}
            </>
          )}
        </Plane>
        <div>
          <MatrixInput m={A} onChange={setA} label="A =" />
          <Slider
            label="k (powers)"
            value={k}
            min={1}
            max={8}
            step={1}
            onChange={setK}
          />
          {P && D ? (
            <div className="la-row">
              <MatrixView m={P} label="P" small />
              <MatrixView m={D} label="D" small />
              <MatrixView m={inverse(P)!} label="P⁻¹" small />
            </div>
          ) : null}
          <Explain
            title={
              diag
                ? "Diagonalizable"
                : e.complex.length
                  ? "Not diagonalizable over ℝ"
                  : "Not diagonalizable"
            }
            text={
              diag
                ? `The blue grid is the eigenbasis. Each application of A multiplies the coordinates by ${lambdas.map(fmt).join(" and ")}, so Aᵏx drifts toward the eigenvector with the largest |λ|.`
                : e.complex.length
                  ? "The eigenvalues are complex: no real eigenbasis exists."
                  : "A repeated eigenvalue has too few eigenvectors (geometric < algebraic multiplicity). See the Jordan form."
            }
          />
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Jordan canonical form ======================= */

const jPresets: { label: string; value: Mat }[] = [
  {
    label: "Distinct eigenvalues",
    value: [
      [2, 1, 0],
      [0, 3, 1],
      [0, 0, 4],
    ],
  },
  {
    label: "Repeated, diagonalizable",
    value: [
      [2, 0, 0],
      [0, 2, 0],
      [0, 0, 5],
    ],
  },
  {
    label: "One 2-block",
    value: [
      [3, 1, 0],
      [0, 3, 0],
      [0, 0, 3],
    ],
  },
  {
    label: "One 3-block",
    value: [
      [2, 1, 0],
      [0, 2, 1],
      [0, 0, 2],
    ],
  },
  {
    label: "Hidden blocks",
    value: [
      [5, 4, 2],
      [0, 1, -1],
      [-1, -1, 3],
    ],
  },
];

export function JordanExplorer() {
  const [A, setA] = useState<Mat>(jPresets[2].value);
  const e = eigen(A);
  const blocks = jordanBlocks(A);
  const J = jordanMatrix(A);
  return (
    <Panel
      kicker="UNIT III · JORDAN CANONICAL FORM"
      title="As close to diagonal as A allows"
      intro="When eigenvectors run short, A is similar to a block-diagonal Jordan matrix J. Each block has λ on the diagonal and 1s just above it; the number of blocks for λ is its geometric multiplicity, their total size its algebraic multiplicity."
      icon={<Layers3 size={19} />}
    >
      <Presets items={jPresets} onPick={setA} />
      <div className="la-split">
        <MatrixInput m={A} onChange={setA} label="A =" />
        {J ? (
          <div className="la-jordan">
            <MatrixView m={J} label="J =" />
          </div>
        ) : (
          <Explain
            title="Complex eigenvalues"
            text="This form is computed over ℝ only; use a matrix with real eigenvalues."
          />
        )}
      </div>
      <div className="u1-table-wrap">
        <table className="u1-table">
          <thead>
            <tr>
              <th>λ</th>
              <th>Algebraic mult.</th>
              <th>Geometric mult. = n − rank(A − λI)</th>
              <th>Jordan blocks</th>
            </tr>
          </thead>
          <tbody>
            {e.real.map((r) => (
              <tr key={r.value}>
                <td>{fmt(r.value)}</td>
                <td>{r.algebraic}</td>
                <td>
                  {r.geometric} = {A.length} −{" "}
                  {rank(sub(A, scale(identity(A.length), r.value)))}
                </td>
                <td>
                  {blocks
                    .find((b) => b.value === r.value)
                    ?.sizes.map((s) => `J${s}(${fmt(r.value)})`)
                    .join(" ⊕ ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Explain
        title={
          isDiagonalizable(A)
            ? "All blocks have size 1: J is diagonal"
            : "Some block is larger than 1 × 1: A is not diagonalizable"
        }
        text="Block sizes come from ranks: the number of blocks of size ≥ k for λ is rank(A − λI)ᵏ⁻¹ − rank(A − λI)ᵏ. The largest block size equals the multiplicity of λ in the minimal polynomial."
      />
    </Panel>
  );
}

/* ======================= Matrix norms ======================= */

export function NormsExplorer() {
  const [A, setA] = useState<Mat>([
    [2, 1],
    [-0.5, 1],
  ]);
  const [p, setP] = useState<"1" | "2" | "inf">("2");
  const pp = p === "inf" ? "inf" : (Number(p) as 1 | 2);
  // Sample the unit sphere of the chosen vector norm.
  const ball = Array.from({ length: 240 }, (_, i) => {
    const t = (i / 240) * 2 * Math.PI;
    const d: Vec = [Math.cos(t), Math.sin(t)];
    const r = vecNorm(d, pp);
    return [d[0] / r, d[1] / r] as Vec;
  });
  const img = ball.map((v) => apply(A, v));
  let best = 0;
  img.forEach((v, i) => {
    if (vecNorm(v, pp) > vecNorm(img[best], pp)) best = i;
  });
  const N = matrixNorms(A);
  const opNorm = p === "1" ? N.one : p === "inf" ? N.inf : N.two;
  return (
    <Panel
      kicker="UNIT III · MATRIX NORMS"
      title="How much can A stretch a unit vector?"
      intro="The operator norm ‖A‖ = max ‖Ax‖ over unit vectors x. It depends on the vector norm: the unit ‘circle’ is a diamond for ‖·‖₁, a circle for ‖·‖₂ and a square for ‖·‖∞."
      icon={<Ruler size={19} />}
    >
      <Tabs
        value={p}
        onChange={setP}
        options={[
          { id: "1", label: "‖·‖₁ (diamond)" },
          { id: "2", label: "‖·‖₂ (circle)" },
          { id: "inf", label: "‖·‖∞ (square)" },
        ]}
      />
      <div className="la-split">
        <Plane ariaLabel="Unit ball and its image under A" range={4}>
          {(P) => (
            <>
              <polygon
                points={ball.map(P.p).join(" ")}
                fill={LC.u}
                opacity={0.15}
                stroke={LC.u}
              />
              <polygon
                points={img.map(P.p).join(" ")}
                fill={LC.v}
                opacity={0.15}
                stroke={LC.v}
              />
              <Arrow P={P} to={ball[best]} color={LC.u} label="x" />
              <Arrow P={P} to={img[best]} color={LC.result} label="Ax" />
            </>
          )}
        </Plane>
        <div>
          <MatrixInput m={A} onChange={setA} label="A =" />
          <Explain
            title={`‖A‖${p === "inf" ? "∞" : p === "1" ? "₁" : "₂"} = ${fmt(opNorm)}`}
            text={`The blue shape is the unit ball, the gold one its image. The longest image (green) has length ${fmt(vecNorm(img[best], pp))} ≈ ‖A‖.`}
          />
          <Stats
            items={[
              { label: "‖A‖₁ = max column sum", value: fmt(N.one) },
              { label: "‖A‖∞ = max row sum", value: fmt(N.inf) },
              { label: "‖A‖₂ = largest singular value", value: fmt(N.two) },
              {
                label: "‖A‖_F = √Σ aᵢⱼ²",
                value: fmt(N.fro),
                note: "Frobenius (not an operator norm)",
              },
            ]}
          />
          <p className="u1-small">
            All are consistent: ‖Ax‖ ≤ ‖A‖·‖x‖ and ‖AB‖ ≤ ‖A‖·‖B‖. Product
            check: ‖A²‖₂ = {fmt(matrixNorms(mul(A, A)).two)} ≤{" "}
            {fmt(N.two * N.two)}.
          </p>
        </div>
      </div>
    </Panel>
  );
}
