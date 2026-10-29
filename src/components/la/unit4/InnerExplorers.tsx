import { useMemo, useState } from "react";
import { Space3D } from "../Space3D";
import { Compass, Spline, Target, Waves } from "lucide-react";
import {
  apply,
  cadd,
  classifyOperator,
  cmul,
  conj,
  cx,
  dot,
  eigen,
  fmt,
  fmtC,
  gramSchmidt,
  leastSquaresLine,
  mul,
  norm,
  scaleV,
  subV,
  transpose,
  type C,
  type CMat,
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
  Stats,
  Tabs,
  usePlayer,
  VecView,
  type StepProps,
} from "../kit";

/* ======================= Inner products, norms, orthogonality ======================= */

const W: Mat = [
  [2, 0.5],
  [0.5, 1],
];

export function InnerProductExplorer() {
  const [kind, setKind] = useState<"dot" | "weighted">("dot");
  const [u, setU] = useState<Vec>([3, 1]);
  const [v, setV] = useState<Vec>([1, 2.5]);
  const ip = (a: Vec, b: Vec) =>
    kind === "dot" ? dot(a, b) : dot(a, apply(W, b));
  const nn = (a: Vec) => Math.sqrt(ip(a, a));
  const uv = ip(u, v);
  const cos = uv / (nn(u) * nn(v) || 1);
  const proj = scaleV(v, uv / (ip(v, v) || 1));
  const orth = Math.abs(uv) < 1e-9;
  // Unit "circle" of the norm: an ellipse for the weighted inner product.
  const circle = Array.from({ length: 120 }, (_, i) => {
    const t = (i / 120) * 2 * Math.PI;
    const d: Vec = [Math.cos(t), Math.sin(t)];
    return scaleV(d, 1 / nn(d));
  });
  return (
    <Panel
      kicker="UNIT IV · INNER PRODUCT SPACES"
      title="Length, angle and right angles from one formula"
      intro="An inner product ⟨u, v⟩ is linear, symmetric and positive (⟨v, v⟩ > 0 for v ≠ 0). It defines the norm ‖v‖ = √⟨v, v⟩, the angle cos θ = ⟨u, v⟩ / (‖u‖‖v‖), and orthogonality ⟨u, v⟩ = 0."
      icon={<Compass size={19} />}
    >
      <Tabs
        value={kind}
        onChange={setKind}
        options={[
          { id: "dot", label: "Dot product u·v" },
          { id: "weighted", label: "Weighted ⟨u, v⟩ = uᵀWv" },
        ]}
      />
      <div className="la-split">
        <Plane
          ariaLabel="Vectors u and v with the projection of u onto v"
          handles={[
            {
              id: "u",
              at: u,
              color: LC.u,
              label: "u",
              arrow: true,
              drag: true,
            },
            {
              id: "v",
              at: v,
              color: LC.v,
              label: "v",
              arrow: true,
              drag: true,
            },
          ]}
          onDrag={(h, q) => (h === "u" ? setU(q) : setV(q))}
        >
          {(P) => (
            <>
              <polygon
                points={circle.map(P.p).join(" ")}
                fill="none"
                stroke={LC.muted}
                strokeDasharray="3 3"
              />
              <InfiniteLine P={P} dir={v} color={LC.v} width={0.8} dash="2 5" />
              <Arrow P={P} to={proj} color={LC.result} width={3} label="proj" />
              <line
                x1={P.X(u[0])}
                y1={P.Y(u[1])}
                x2={P.X(proj[0])}
                y2={P.Y(proj[1])}
                stroke={LC.muted}
                strokeDasharray="4 3"
              />
            </>
          )}
        </Plane>
        <div>
          {kind === "weighted" && (
            <MatrixView
              m={W}
              label="W (symmetric, positive definite) ="
              small
            />
          )}
          <Explain
            title={orth ? "u ⟂ v" : `⟨u, v⟩ = ${fmt(uv)}`}
            text={`‖u‖ = ${fmt(nn(u))}, ‖v‖ = ${fmt(nn(v))}, angle = ${fmt((Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI)}°. The dashed curve is the unit circle of this norm${kind === "weighted" ? " — an ellipse, because W changes what “length 1” means" : ""}.`}
          />
          <Stats
            items={[
              {
                label: "CAUCHY–SCHWARZ",
                value: `${fmt(Math.abs(uv))} ≤ ${fmt(nn(u) * nn(v))}`,
                note: "|⟨u,v⟩| ≤ ‖u‖‖v‖",
              },
              {
                label: "TRIANGLE INEQUALITY",
                value: `${fmt(nn([u[0] + v[0], u[1] + v[1]]))} ≤ ${fmt(nn(u) + nn(v))}`,
                note: "‖u + v‖ ≤ ‖u‖ + ‖v‖",
              },
              {
                label: "PROJECTION OF u ON v",
                value: `(${proj.map(fmt).join(", ")})`,
                note: "(⟨u,v⟩/⟨v,v⟩)·v",
              },
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Gram–Schmidt ======================= */

export function GramSchmidtExplorer({ onSteps }: StepProps) {
  const [v1, setV1] = useState<Vec>([3, 1]);
  const [v2, setV2] = useState<Vec>([2, 3]);
  const [M, setM] = useState<Mat>([
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 1],
  ]);
  const gs2 = useMemo(() => gramSchmidt([v1, v2]), [v1, v2]);
  const q1 = gs2.q[0],
    q2 = gs2.q[1];
  const proj = q1 ? scaleV(q1, dot(v2, q1)) : [0, 0];
  const u2 = subV(v2, proj);
  const stages = [
    "Start with v₁, v₂",
    "q₁ = v₁ / ‖v₁‖",
    "Project v₂ onto q₁",
    "u₂ = v₂ − proj",
    "q₂ = u₂ / ‖u₂‖",
  ];
  const p = usePlayer(stages.length, `${v1}-${v2}`, onSteps);
  const s = p.step;
  const gs3 = useMemo(() => gramSchmidt(transpose(M)), [M]);
  return (
    <Panel
      kicker="UNIT IV · GRAM–SCHMIDT ORTHONORMALIZATION"
      title="Straighten a basis, one vector at a time"
      intro="Gram–Schmidt turns any basis into an orthonormal one with the same span at every stage: from each new vector subtract its projections on the earlier q's, then scale it to length 1."
      icon={<Spline size={19} />}
    >
      <div className="la-split">
        <Plane
          ariaLabel="Gram–Schmidt in the plane"
          handles={[
            {
              id: "v1",
              at: v1,
              color: LC.u,
              label: "v₁",
              arrow: true,
              drag: true,
            },
            {
              id: "v2",
              at: v2,
              color: LC.v,
              label: "v₂",
              arrow: true,
              drag: true,
            },
          ]}
          onDrag={(h, q) => (h === "v1" ? setV1(q) : setV2(q))}
        >
          {(P) => (
            <>
              <circle
                cx={P.X(0)}
                cy={P.Y(0)}
                r={P.X(1) - P.X(0)}
                fill="none"
                stroke={LC.muted}
                strokeDasharray="3 3"
              />
              {s >= 1 && q1 && (
                <Arrow P={P} to={q1} color={LC.result} width={3.2} label="q₁" />
              )}
              {s >= 2 && q1 && (
                <>
                  <InfiniteLine
                    P={P}
                    dir={q1}
                    color={LC.u}
                    width={0.8}
                    dash="2 5"
                  />
                  <Arrow P={P} to={proj} color={LC.w} width={2} label="proj" />
                </>
              )}
              {s >= 3 && (
                <Arrow
                  P={P}
                  from={proj}
                  to={v2}
                  color={LC.bad}
                  width={2}
                  dash="5 3"
                />
              )}
              {s >= 3 && (
                <Arrow P={P} to={u2} color={LC.bad} width={2} label="u₂" />
              )}
              {s >= 4 && q2 && (
                <Arrow P={P} to={q2} color={LC.result} width={3.2} label="q₂" />
              )}
            </>
          )}
        </Plane>
        <div>
          <Explain
            title={stages[s]}
            text={
              [
                "Two independent vectors that are not perpendicular.",
                `Normalize the first vector: ‖v₁‖ = ${fmt(norm(v1))}.`,
                `⟨v₂, q₁⟩q₁ = (${proj.map(fmt).join(", ")}) is the part of v₂ along q₁.`,
                `What is left, u₂ = (${u2.map(fmt).join(", ")}), is perpendicular to q₁: ⟨u₂, q₁⟩ = ${fmt(q1 ? dot(u2, q1) : 0)}.`,
                q2
                  ? `Normalize it. {q₁, q₂} is an orthonormal basis of span{v₁, v₂}.`
                  : "v₂ is parallel to v₁: nothing is left, so the vectors were dependent.",
              ][s]
            }
          />
          <PlayerBar p={p} />
        </div>
      </div>
      <div className="la-split">
        <Space3D
          ariaLabel="Original vectors (dashed) and the orthonormal vectors from Gram–Schmidt"
          items={[
            ...transpose(M).map((v, i) => ({
              kind: "vec" as const,
              v,
              color: LC.muted,
              width: 1.4,
              dash: "4 3",
              label: `v${i + 1}`,
            })),
            ...gs3.q.map((q, i) => ({
              kind: "vec" as const,
              v: scaleV(q, 2),
              color: [LC.u, LC.v, LC.w][i],
              width: 3,
              label: `2q${i + 1}`,
            })),
          ]}
        />
        <div>
          <MatrixInput
            m={M}
            onChange={setM}
            label="Three vectors in ℝ³ (as columns)"
          />
          <div className="u1-table-wrap">
            <table className="u1-table">
              <thead>
                <tr>
                  <th>k</th>
                  <th>uₖ = vₖ − Σ projections</th>
                  <th>qₖ</th>
                </tr>
              </thead>
              <tbody>
                {gs3.steps.map((st) => (
                  <tr key={st.k}>
                    <td>{st.k + 1}</td>
                    <td>({st.u.map(fmt).join(", ")})</td>
                    <td>
                      {st.q
                        ? `(${st.q.map(fmt).join(", ")})`
                        : "— dependent, skipped"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="u1-small">
            Dashed: the original vectors. Solid: the orthonormal vectors (drawn
            at length 2 so they are easy to see) — turn the view to check they
            meet at right angles.
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Orthogonal projections and least squares ======================= */

export function OrthProjectionExplorer() {
  const [pts, setPts] = useState<Vec[]>([
    [-3, -2],
    [-1, -1.5],
    [0, 0.5],
    [2, 1],
    [3, 3],
  ]);
  const line = leastSquaresLine(pts as [number, number][]);
  const A = pts.map(([x]) => [x, 1]);
  const AtA = mul(transpose(A), A);
  const Atb = mul(
    transpose(A),
    pts.map(([, y]) => [y]),
  );
  const res = line ? pts.map(([x, y]) => y - (line.m * x + line.c)) : [];
  const sse = res.reduce((s, r) => s + r * r, 0);
  return (
    <Panel
      kicker="UNIT IV · ORTHOGONAL PROJECTIONS"
      title="Least squares is a projection"
      intro="Ax = b has no exact solution when the points are not collinear. The best fit projects b orthogonally onto the column space of A: the residual b − Ax̂ is perpendicular to every column, which gives the normal equations AᵀAx̂ = Aᵀb."
      icon={<Target size={19} />}
    >
      <div className="la-split">
        <Plane
          ariaLabel="Data points with the least-squares line"
          handles={pts.map((q, i) => ({
            id: String(i),
            at: q,
            color: LC.v,
            drag: true,
          }))}
          onDrag={(id, q) =>
            setPts((ps) => ps.map((pp, i) => (String(i) === id ? q : pp)))
          }
        >
          {(P) =>
            line && (
              <>
                <InfiniteLine
                  P={P}
                  dir={[1, line.m]}
                  through={[0, line.c]}
                  color={LC.result}
                  width={2.4}
                />
                {pts.map(([x, y], i) => (
                  <line
                    key={i}
                    x1={P.X(x)}
                    y1={P.Y(y)}
                    x2={P.X(x)}
                    y2={P.Y(line.m * x + line.c)}
                    stroke={LC.bad}
                    strokeWidth={1.6}
                  />
                ))}
              </>
            )
          }
        </Plane>
        <div>
          <Explain
            title={
              line
                ? `ŷ = ${fmt(line.m)}x ${line.c < 0 ? "−" : "+"} ${fmt(Math.abs(line.c))}`
                : "Spread the points out"
            }
            text={`Drag the gold points. Red segments are the residuals; least squares makes the sum of their squares (${fmt(sse)}) as small as possible. The residual vector is orthogonal to both columns of A: Σrᵢxᵢ = ${fmt(res.reduce((s, r, i) => s + r * pts[i][0], 0))}, Σrᵢ = ${fmt(res.reduce((s, r) => s + r, 0))}.`}
          />
          <div className="la-row">
            <MatrixView m={AtA} label="AᵀA" small />
            <MatrixView m={Atb} label="Aᵀb" small />
          </div>
          <p className="u1-small">
            Projection matrix onto the column space: P = A(AᵀA)⁻¹Aᵀ. It is
            symmetric and idempotent (P² = P).
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Adjoints; Hermitian, unitary and normal operators ======================= */

const parseC = (s: string): C => {
  const t = s.replace(/\s+/g, "").replace(/−/g, "-");
  if (!t) return cx(0);
  const m = t.match(/^([+-]?\d*\.?\d*)?(?:([+-])(\d*\.?\d*)i)?$/);
  if (/^[+-]?\d*\.?\d*i$/.test(t)) {
    const k = t.slice(0, -1);
    return cx(0, k === "" || k === "+" ? 1 : k === "-" ? -1 : Number(k));
  }
  if (!m) return cx(Number.NaN);
  const re = m[1] ? Number(m[1]) : 0;
  const im = m[2]
    ? (m[2] === "-" ? -1 : 1) * (m[3] === "" ? 1 : Number(m[3]))
    : 0;
  return cx(re, im);
};

const opPresets: { label: string; value: string[][] }[] = [
  {
    label: "Hermitian",
    value: [
      ["2", "1-i"],
      ["1+i", "3"],
    ],
  },
  {
    label: "Real symmetric",
    value: [
      ["2", "1"],
      ["1", "1"],
    ],
  },
  {
    label: "Rotation (unitary)",
    value: [
      ["0.6", "-0.8"],
      ["0.8", "0.6"],
    ],
  },
  {
    label: "Skew-Hermitian",
    value: [
      ["i", "2"],
      ["-2", "0"],
    ],
  },
  {
    label: "Normal, not Hermitian",
    value: [
      ["1", "-1"],
      ["1", "1"],
    ],
  },
  {
    label: "Shear (not normal)",
    value: [
      ["1", "1"],
      ["0", "1"],
    ],
  },
];

export function OperatorsExplorer() {
  const [S, setS] = useState<string[][]>(opPresets[0].value);
  const A: CMat = S.map((r) => r.map(parseC));
  const valid = A.flat().every(
    (z) => Number.isFinite(z.re) && Number.isFinite(z.im),
  );
  const c = valid ? classifyOperator(A) : null;
  const real = valid && A.flat().every((z) => Math.abs(z.im) < 1e-12);
  const Ar: Mat = A.map((r) => r.map((z) => z.re));
  const circle = Array.from(
    { length: 120 },
    (_, i) =>
      [
        Math.cos((i / 120) * 2 * Math.PI),
        Math.sin((i / 120) * 2 * Math.PI),
      ] as Vec,
  );
  // ⟨Au, v⟩ = ⟨u, A*v⟩ on a fixed pair of complex vectors.
  const u = [cx(1, 1), cx(2, -1)],
    v = [cx(0, 1), cx(1, 0)];
  const mv = (M: CMat, x: C[]) =>
    M.map((r) => r.reduce((s, a, k) => cadd(s, cmul(a, x[k])), cx(0)));
  const inner = (x: C[], y: C[]) =>
    x.reduce((s, a, k) => cadd(s, cmul(a, conj(y[k]))), cx(0));
  const types = c
    ? [
        { name: "Self-adjoint (Hermitian): A* = A", ok: c.selfAdjoint },
        { name: "Skew-adjoint: A* = −A", ok: c.skewAdjoint },
        { name: "Unitary: A*A = I", ok: c.unitary },
        { name: "Normal: A*A = AA*", ok: c.normal },
      ]
    : [];
  return (
    <Panel
      kicker="UNIT IV · LINEAR FUNCTIONALS, ADJOINTS & SPECIAL OPERATORS"
      title="The adjoint and the operators that respect it"
      intro="Every linear functional on an inner product space is f(v) = ⟨v, w⟩ for one vector w. Likewise every operator A has an adjoint A* with ⟨Au, v⟩ = ⟨u, A*v⟩; for matrices A* is the conjugate transpose. Enter complex entries like 1-i or 2i."
      icon={<Waves size={19} />}
    >
      <Presets items={opPresets} onPick={setS} />
      <div className="la-split">
        <div>
          <div className="la-cgrid">
            {S.flatMap((row, i) =>
              row.map((x, j) => (
                <input
                  key={`${i}${j}`}
                  className="u2-small-input"
                  value={x}
                  aria-label={`Entry ${i + 1}, ${j + 1}`}
                  onChange={(e) =>
                    setS((m) =>
                      m.map((r, a) =>
                        r.map((y, b) =>
                          a === i && b === j ? e.target.value : y,
                        ),
                      ),
                    )
                  }
                />
              )),
            )}
          </div>
          {c && (
            <p className="la-eq">
              A* = [{c.adjoint.map((r) => r.map(fmtC).join(", ")).join(" ; ")}]
            </p>
          )}
          <ul className="la-checks">
            {types.map((t) => (
              <li key={t.name} className={t.ok ? "ok" : "no"}>
                <b>{t.ok ? "✓" : "✗"}</b> {t.name}
              </li>
            ))}
          </ul>
          {c && (
            <p className="u1-small">
              Adjoint identity on sample vectors: ⟨Au, v⟩ ={" "}
              {fmtC(inner(mv(A, u), v))}, ⟨u, A*v⟩ ={" "}
              {fmtC(inner(u, mv(c.adjoint, v)))}.
            </p>
          )}
        </div>
        {real ? (
          <Plane ariaLabel="Unit circle and its image" range={4}>
            {(P) => (
              <>
                <polygon
                  points={circle.map(P.p).join(" ")}
                  fill="none"
                  stroke={LC.u}
                />
                <polygon
                  points={circle
                    .map((q) => apply(Ar, q))
                    .map(P.p)
                    .join(" ")}
                  fill={LC.v}
                  opacity={0.15}
                  stroke={LC.v}
                />
                {eigen(Ar)
                  .real.flatMap((e) => e.vectors)
                  .map((ev, i) => (
                    <InfiniteLine
                      key={i}
                      P={P}
                      dir={ev}
                      color={LC.result}
                      dash="6 4"
                    />
                  ))}
              </>
            )}
          </Plane>
        ) : (
          <Explain
            title="Complex entries"
            text="The picture is drawn for real matrices only; the checks on the left work for complex ones."
          />
        )}
      </div>
      <Explain
        title={
          !c
            ? "Could not read an entry"
            : c.unitary
              ? "Unitary: lengths and angles are preserved"
              : c.selfAdjoint
                ? "Self-adjoint: real eigenvalues, orthogonal eigenvectors"
                : c.normal
                  ? "Normal: unitarily diagonalizable"
                  : "Not normal"
        }
        text={
          !c
            ? "Use forms like 3, -2.5, i, 1-i or 0.5+2i."
            : c.unitary
              ? "A*A = I, so ‖Ax‖ = ‖x‖: the unit circle maps onto itself (rotations and reflections). Eigenvalues have |λ| = 1."
              : c.selfAdjoint
                ? "The spectral theorem: a Hermitian matrix has real eigenvalues and an orthonormal eigenbasis — the green dashed lines meet at right angles and line up with the axes of the gold ellipse."
                : c.normal
                  ? "A commutes with A*. Normal operators (Hermitian, skew-Hermitian, unitary, …) are exactly those with an orthonormal eigenbasis over ℂ."
                  : "A*A ≠ AA*: no orthonormal basis of eigenvectors exists."
        }
      />
      {real && <MatrixView m={Ar} label="A (real) =" small />}
      <p className="u1-small">
        Sample vectors: u = <VecView v={[1, 2]} /> + i<VecView v={[1, -1]} />, v
        = <VecView v={[0, 1]} /> + i<VecView v={[1, 0]} />.
      </p>
    </Panel>
  );
}
