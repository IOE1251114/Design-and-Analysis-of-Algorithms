import { useEffect, useMemo, useState } from "react";
import {
  Blend,
  Crosshair,
  RefreshCcw,
  ScanLine,
  Shuffle,
  Undo2,
} from "lucide-react";
import {
  add,
  addV,
  apply,
  columnSpace,
  det,
  dot,
  eigen,
  fmt,
  identity,
  inverse,
  inverseSteps,
  mul,
  nullSpace,
  rrefSteps,
  scale,
  scaleV,
  subV,
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

const lerp = (A: Mat, t: number): Mat =>
  add(scale(identity(2), 1 - t), scale(A, t));
const square = (
  P: { X: (x: number) => number; Y: (y: number) => number },
  M: Mat,
) =>
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ]
    .map((q) => apply(M, q))
    .map((q) => `${P.X(q[0])},${P.Y(q[1])}`)
    .join(" ");

export const transformPresets: { label: string; value: Mat }[] = [
  {
    label: "Rotate 90°",
    value: [
      [0, -1],
      [1, 0],
    ],
  },
  {
    label: "Shear",
    value: [
      [1, 1],
      [0, 1],
    ],
  },
  {
    label: "Scale (2, ½)",
    value: [
      [2, 0],
      [0, 0.5],
    ],
  },
  {
    label: "Reflect in y = x",
    value: [
      [0, 1],
      [1, 0],
    ],
  },
  {
    label: "Project onto x-axis",
    value: [
      [1, 0],
      [0, 0],
    ],
  },
  {
    label: "Stretch & turn",
    value: [
      [1.5, -0.5],
      [0.5, 1],
    ],
  },
];

/** Animates t from 0 to 1 when `run` changes to a new value. */
function useMorph(key: unknown) {
  const [t, setT] = useState(1);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    setT(0);
    setPlaying(true);
  }, [key]);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () =>
        setT((x) => {
          if (x >= 1) {
            setPlaying(false);
            return 1;
          }
          return Math.min(1, x + 0.025);
        }),
      30,
    );
    return () => clearInterval(id);
  }, [playing]);
  return {
    t,
    setT: (x: number) => {
      setPlaying(false);
      setT(x);
    },
    replay: () => {
      setT(0);
      setPlaying(true);
    },
  };
}

/* ======================= Linear transformations ======================= */

export function TransformExplorer({ onSteps }: StepProps) {
  const [A, setA] = useState<Mat>(transformPresets[5].value);
  const [x, setX] = useState<Vec>([2, 1]);
  const [y, setY] = useState<Vec>([-1, 2]);
  const m = useMorph(JSON.stringify(A));
  const M = lerp(A, m.t);
  const Tx = apply(A, x),
    Ty = apply(A, y),
    Tsum = apply(A, addV(x, y));
  return (
    <Panel
      kicker="UNIT II · LINEAR TRANSFORMATIONS"
      title="Watch the whole plane move"
      intro="A linear transformation keeps grid lines straight, parallel and evenly spaced, and keeps the origin fixed. Its matrix columns are where e₁ and e₂ land."
      icon={<Shuffle size={19} />}
    >
      <Presets
        items={transformPresets}
        onPick={(v) => {
          setA(v);
          onSteps?.(1);
        }}
      />
      <div className="la-split">
        <Plane
          ariaLabel="Grid transformed by the matrix"
          warp={M}
          handles={[
            { id: "x", at: x, color: LC.u, label: "x", drag: true },
            { id: "y", at: y, color: LC.v, label: "y", drag: true },
          ]}
          onDrag={(h, p) => (h === "x" ? setX(p) : setY(p))}
        >
          {(P) => (
            <>
              <polygon
                points={square(P, M)}
                fill={LC.result}
                opacity={0.18}
                stroke={LC.result}
              />
              <Arrow P={P} to={apply(M, [1, 0])} color={LC.bad} label="Te₁" />
              <Arrow P={P} to={apply(M, [0, 1])} color={LC.w} label="Te₂" />
              <Arrow
                P={P}
                to={apply(M, x)}
                color={LC.u}
                width={1.8}
                dash="4 3"
                label="Tx"
              />
              <Arrow
                P={P}
                to={apply(M, y)}
                color={LC.v}
                width={1.8}
                dash="4 3"
                label="Ty"
              />
            </>
          )}
        </Plane>
        <div>
          <MatrixInput m={A} onChange={setA} label="A =" />
          <Slider
            label="morph t (I → A)"
            value={m.t}
            min={0}
            max={1}
            step={0.01}
            onChange={m.setT}
          />
          <button className="btn btn-secondary" onClick={m.replay}>
            Replay animation
          </button>
          <Explain
            title="Linearity, checked on your x and y"
            text={
              <>
                T(x + y) = <VecView v={Tsum} /> and T(x) + T(y) ={" "}
                <VecView v={addV(Tx, Ty)} />. T(2x) ={" "}
                <VecView v={apply(A, scaleV(x, 2))} /> = 2·T(x). The green
                square is the image of the unit square: its area is |det A| ={" "}
                {fmt(Math.abs(det(A)))}.
              </>
            }
          />
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Range, null space and rank–nullity ======================= */

const rnPresets: { label: string; value: Mat }[] = [
  {
    label: "3 × 4, rank 2",
    value: [
      [1, 2, 1, 0],
      [2, 4, 0, 2],
      [3, 6, 1, 2],
    ],
  },
  {
    label: "3 × 3, invertible",
    value: [
      [2, 1, 0],
      [1, 3, 1],
      [0, 1, 4],
    ],
  },
  {
    label: "3 × 3, rank 1",
    value: [
      [1, 2, 3],
      [2, 4, 6],
      [3, 6, 9],
    ],
  },
  {
    label: "2 × 4",
    value: [
      [1, 0, 2, -1],
      [0, 1, -1, 3],
    ],
  },
];

export function RankNullityExplorer({ onSteps }: StepProps) {
  const [A, setA] = useState<Mat>(rnPresets[0].value);
  const run = useMemo(() => rrefSteps(A), [A]);
  const p = usePlayer(run.steps.length, JSON.stringify(A), onSteps);
  const s = run.steps[p.step];
  const n = A[0].length;
  const r = run.pivots.length;
  const N = nullSpace(A);
  const R = columnSpace(A);
  const done = p.step === run.steps.length - 1;
  return (
    <Panel
      kicker="UNIT II · RANGE, NULL SPACE & RANK–NULLITY"
      title="rank + nullity = number of columns"
      intro="Row-reduce A. Pivot columns give a basis of the range (column space); each free variable gives one vector of the null space. Together they account for every column."
      icon={<ScanLine size={19} />}
    >
      <Presets items={rnPresets} onPick={setA} />
      <div className="la-split">
        <MatrixInput m={A} onChange={setA} label={`A (${A.length} × ${n})`} />
        <div>
          <MatrixView m={s.m} hi={s.pivot} label={s.op} />
          <Explain title={s.op} text={s.text} />
        </div>
      </div>
      <PlayerBar p={p} />
      {done && (
        <div className="la-split">
          <div>
            <small className="ds-label">
              BASIS OF THE RANGE R(A) — pivot columns of A
            </small>
            <div className="la-vecs">
              {R.map((v, i) => (
                <VecView key={i} v={v} color={LC.u} />
              ))}
            </div>
          </div>
          <div>
            <small className="ds-label">BASIS OF THE NULL SPACE N(A)</small>
            <div className="la-vecs">
              {N.length ? (
                N.map((v, i) => <VecView key={i} v={v} color={LC.v} />)
              ) : (
                <span className="u1-small">only 0 — the map is one-to-one</span>
              )}
            </div>
          </div>
        </div>
      )}
      <Stats
        items={[
          { label: "RANK = dim R(A)", value: r },
          { label: "NULLITY = dim N(A)", value: n - r },
          {
            label: "RANK + NULLITY",
            value: `${r} + ${n - r} = ${n}`,
            note: "number of columns (dim of the domain)",
          },
          {
            label: "ONTO? ONE-TO-ONE?",
            value: `${r === A.length ? "onto" : "not onto"} · ${r === n ? "1-1" : "not 1-1"}`,
          },
        ]}
      />
    </Panel>
  );
}

/* ======================= Projections ======================= */

export function ProjectionExplorer() {
  const [kind, setKind] = useState<"orth" | "oblique">("orth");
  const [u, setU] = useState<Vec>([3, 1]);
  const [w, setW] = useState<Vec>([1, 2]);
  const [v, setV] = useState<Vec>([1, 3]);
  const along = kind === "orth" ? [-u[1], u[0]] : w;
  // P projects onto span(u) along span(along): v = a·u + b·along, Pv = a·u.
  const M = [
    [u[0], along[0]],
    [u[1], along[1]],
  ];
  const inv = inverse(M);
  const Pmat = inv
    ? mul(
        mul(M, [
          [1, 0],
          [0, 0],
        ]),
        inv,
      )
    : null;
  const Pv = Pmat ? apply(Pmat, v) : null;
  return (
    <Panel
      kicker="UNIT II · PROJECTIONS"
      title="P² = P: projecting twice changes nothing"
      intro="A projection maps V onto a subspace U along a complementary subspace W: it keeps the U-part of each vector and drops the W-part. When W is perpendicular to U it is an orthogonal projection."
      icon={<Crosshair size={19} />}
    >
      <Tabs
        value={kind}
        onChange={setKind}
        options={[
          { id: "orth", label: "Orthogonal projection" },
          { id: "oblique", label: "Oblique (along W)" },
        ]}
      />
      <div className="la-split">
        <Plane
          ariaLabel="Projection of v onto a line"
          handles={[
            { id: "u", at: u, color: LC.u, label: "U", drag: true },
            ...(kind === "oblique"
              ? [{ id: "w", at: w, color: LC.w, label: "W", drag: true }]
              : []),
            {
              id: "v",
              at: v,
              color: LC.v,
              label: "v",
              arrow: true,
              drag: true,
            },
          ]}
          onDrag={(h, q) =>
            h === "u" ? setU(q) : h === "w" ? setW(q) : setV(q)
          }
        >
          {(P) => (
            <>
              <InfiniteLine P={P} dir={u} color={LC.u} width={2} />
              {kind === "oblique" && (
                <InfiniteLine
                  P={P}
                  dir={w}
                  color={LC.w}
                  width={1.2}
                  dash="4 4"
                />
              )}
              {Pv && (
                <>
                  <Arrow P={P} to={Pv} color={LC.result} width={3} label="Pv" />
                  <line
                    x1={P.X(v[0])}
                    y1={P.Y(v[1])}
                    x2={P.X(Pv[0])}
                    y2={P.Y(Pv[1])}
                    stroke={LC.muted}
                    strokeDasharray="4 3"
                  />
                </>
              )}
            </>
          )}
        </Plane>
        <div>
          {Pmat && <MatrixView m={Pmat} label="P =" />}
          {Pmat && <MatrixView m={mul(Pmat, Pmat)} label="P² =" small />}
          <Explain
            title={
              Pv
                ? `Pv = (${Pv.map(fmt).join(", ")})`
                : "U and W must not be parallel"
            }
            text={
              Pv
                ? kind === "orth"
                  ? `v − Pv = (${subV(v, Pv).map(fmt).join(", ")}) is perpendicular to U: their dot product is ${fmt(dot(subV(v, Pv), u))}. P is symmetric.`
                  : `v − Pv lies along W. The matrix is idempotent (P² = P) but not symmetric, because W is not perpendicular to U.`
                : "A projection along W onto U needs ℝ² = U ⊕ W."
            }
          />
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Inverse transformations ======================= */

export function InverseExplorer({ onSteps }: StepProps) {
  const [A, setA] = useState<Mat>([
    [2, 1, 0],
    [1, 1, 1],
    [0, 1, 3],
  ]);
  const [A2, setA2] = useState<Mat>([
    [1, 1],
    [-0.5, 1],
  ]);
  const [x, setX] = useState<Vec>([2, 1]);
  const run = useMemo(() => inverseSteps(A), [A]);
  const p = usePlayer(run.steps.length, JSON.stringify(A), onSteps);
  const s = run.steps[p.step];
  const inv2 = inverse(A2);
  return (
    <Panel
      kicker="UNIT II · INVERSE LINEAR TRANSFORMATION"
      title="Undo a transformation"
      intro="T is invertible exactly when it is one-to-one and onto, i.e. det A ≠ 0. Gauss–Jordan elimination on [A | I] turns the left half into I and the right half into A⁻¹."
      icon={<Undo2 size={19} />}
    >
      <div className="la-split">
        <MatrixInput m={A} onChange={setA} label="A =" />
        <div>
          <MatrixView m={s.m} hi={s.pivot} split={A.length} label="[A | I]" />
          <Explain
            title={
              p.step === run.steps.length - 1
                ? run.inv
                  ? "A⁻¹ is the right half"
                  : "A is singular"
                : s.op
            }
            text={
              p.step === run.steps.length - 1
                ? run.inv
                  ? "The left half became I, so the same row operations turned I into A⁻¹."
                  : "A row of zeros appeared on the left: det A = 0, so no inverse exists."
                : s.text
            }
          />
        </div>
      </div>
      <PlayerBar p={p} />
      {run.inv && (
        <MatrixView m={mul(A, run.inv)} label="Check: A·A⁻¹ =" small />
      )}
      <div className="la-split">
        <Plane
          ariaLabel="A vector, its image and the image mapped back"
          warp={A2}
          handles={[
            {
              id: "x",
              at: x,
              color: LC.u,
              label: "x",
              arrow: true,
              drag: true,
            },
          ]}
          onDrag={(_, q) => setX(q)}
        >
          {(P) => (
            <>
              <Arrow P={P} to={apply(A2, x)} color={LC.v} label="Ax" />
              {inv2 && (
                <Arrow
                  P={P}
                  from={apply(A2, x)}
                  to={apply(inv2, apply(A2, x))}
                  color={LC.result}
                  dash="5 3"
                  width={1.6}
                />
              )}
            </>
          )}
        </Plane>
        <div>
          <MatrixInput m={A2} onChange={setA2} label="2 × 2 map B =" />
          {inv2 ? (
            <MatrixView m={inv2} label="B⁻¹ = (1/det)[d −b; −c a] =" />
          ) : null}
          <Explain
            title={inv2 ? "B⁻¹(Bx) = x" : "B squashes the plane"}
            text={
              inv2
                ? `det B = ${fmt(det(A2))}. The green arrow carries Bx straight back to x.`
                : "det B = 0: B flattens the plane onto a line, and many x share the same image, so nothing can undo it."
            }
          />
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Matrix representation and change of basis ======================= */

export function ChangeBasisExplorer() {
  const [A, setA] = useState<Mat>([
    [1, 2],
    [2, 1],
  ]);
  const [b1, setB1] = useState<Vec>([1, 0]);
  const [b2, setB2] = useState<Vec>([0, 1]);
  const B = [
    [b1[0], b2[0]],
    [b1[1], b2[1]],
  ];
  const Binv = inverse(B);
  const TB = Binv ? mul(mul(Binv, A), B) : null;
  const ev = eigen(A).real.flatMap((e) => e.vectors);
  const diagonal = TB && Math.abs(TB[0][1]) < 1e-9 && Math.abs(TB[1][0]) < 1e-9;
  return (
    <Panel
      kicker="UNIT II · MATRICES OF LINEAR MAPS · CHANGE OF BASIS"
      title="One transformation, many matrices"
      intro="The matrix of T depends on the basis. If P has the new basis vectors as columns, then [T]_B = P⁻¹AP. Drag b₁ and b₂ — or snap them to eigenvectors and watch the matrix become diagonal."
      icon={<RefreshCcw size={19} />}
    >
      <Presets
        items={[
          {
            label: "Standard basis",
            value: [
              [1, 0],
              [0, 1],
            ],
          },
          ...(ev.length === 2
            ? [{ label: "Eigenvectors of A", value: [ev[0], ev[1]] }]
            : []),
          {
            label: "Tilted basis",
            value: [
              [1, 1],
              [-1, 2],
            ],
          },
        ]}
        onPick={(v) => {
          setB1(v[0]);
          setB2(v[1]);
        }}
      />
      <div className="la-split">
        <Plane
          ariaLabel="Basis vectors and their images"
          warp={Binv ? B : undefined}
          handles={[
            {
              id: "b1",
              at: b1,
              color: LC.u,
              label: "b₁",
              arrow: true,
              drag: true,
            },
            {
              id: "b2",
              at: b2,
              color: LC.v,
              label: "b₂",
              arrow: true,
              drag: true,
            },
          ]}
          onDrag={(h, q) => (h === "b1" ? setB1(q) : setB2(q))}
        >
          {(P) => (
            <>
              <Arrow
                P={P}
                to={apply(A, b1)}
                color={LC.u}
                dash="4 3"
                width={1.6}
                label="Tb₁"
              />
              <Arrow
                P={P}
                to={apply(A, b2)}
                color={LC.v}
                dash="4 3"
                width={1.6}
                label="Tb₂"
              />
            </>
          )}
        </Plane>
        <div>
          <MatrixInput
            m={A}
            onChange={setA}
            label="A = [T] in the standard basis"
          />
          <div className="la-row">
            <MatrixView m={B} label="P =" small />
            {TB && <MatrixView m={TB} label="[T]_B = P⁻¹AP" />}
          </div>
          <Explain
            title={
              !TB
                ? "b₁ and b₂ do not form a basis"
                : diagonal
                  ? "Diagonal: B is an eigenbasis"
                  : "Column j of [T]_B = coordinates of T(bⱼ) in B"
            }
            text={
              !TB
                ? "Pick two non-parallel vectors."
                : diagonal
                  ? "Each Tbⱼ is a multiple of bⱼ, so in this basis T just stretches along the axes. Similar matrices share trace and determinant."
                  : `trace = ${fmt(TB[0][0] + TB[1][1])} and det = ${fmt(det(TB))} are the same in every basis.`
            }
          />
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Dual space and dual bases ======================= */

export function DualExplorer() {
  const [b1, setB1] = useState<Vec>([2, 1]);
  const [b2, setB2] = useState<Vec>([0.5, 2]);
  const [v, setV] = useState<Vec>([3, 2]);
  const B = [
    [b1[0], b2[0]],
    [b1[1], b2[1]],
  ];
  const inv = inverse(B);
  const f = inv ? [inv[0], inv[1]] : null;
  const levels = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  return (
    <Panel
      kicker="UNIT II · DUAL SPACE · DUAL BASES"
      title="Functionals that read off coordinates"
      intro="The dual space V* holds the linear functionals f : V → ℝ. The dual basis {f₁, f₂} of {b₁, b₂} is defined by fᵢ(bⱼ) = 1 if i = j and 0 otherwise — so fᵢ(v) is the i-th coordinate of v. Each fᵢ is drawn as its level lines fᵢ = k."
      icon={<Blend size={19} />}
    >
      <div className="la-split">
        <Plane
          ariaLabel="Level lines of the dual basis functionals"
          handles={[
            {
              id: "b1",
              at: b1,
              color: LC.u,
              label: "b₁",
              arrow: true,
              drag: true,
            },
            {
              id: "b2",
              at: b2,
              color: LC.v,
              label: "b₂",
              arrow: true,
              drag: true,
            },
            { id: "v", at: v, color: LC.result, label: "v", drag: true },
          ]}
          onDrag={(h, q) =>
            h === "b1" ? setB1(q) : h === "b2" ? setB2(q) : setV(q)
          }
        >
          {(P) =>
            f && (
              <>
                {levels.map((k) => {
                  // fᵢ(x) = k is a line: the set of points with i-th B-coordinate k, parallel to the other basis vector.
                  return (
                    <g key={k}>
                      <InfiniteLine
                        P={P}
                        dir={b2}
                        through={scaleV(b1, k)}
                        color={LC.u}
                        width={k === 0 ? 1.4 : 0.8}
                        dash={k === 0 ? undefined : "3 4"}
                      />
                      <InfiniteLine
                        P={P}
                        dir={b1}
                        through={scaleV(b2, k)}
                        color={LC.v}
                        width={k === 0 ? 1.4 : 0.8}
                        dash={k === 0 ? undefined : "3 4"}
                      />
                    </g>
                  );
                })}
              </>
            )
          }
        </Plane>
        <div>
          {f ? (
            <>
              <p className="la-eq">
                f₁(x, y) = {fmt(f[0][0])}x + {fmt(f[0][1])}y
                <br />
                f₂(x, y) = {fmt(f[1][0])}x + {fmt(f[1][1])}y
              </p>
              <div className="u1-table-wrap">
                <table className="u1-table la-delta">
                  <thead>
                    <tr>
                      <th />
                      <th>b₁</th>
                      <th>b₂</th>
                      <th>v</th>
                    </tr>
                  </thead>
                  <tbody>
                    {f.map((fi, i) => (
                      <tr key={i}>
                        <th>f{i + 1}</th>
                        <td>{fmt(dot(fi, b1))}</td>
                        <td>{fmt(dot(fi, b2))}</td>
                        <td className="hi">{fmt(dot(fi, v))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Explain
                title={`v = ${fmt(dot(f[0], v))}·b₁ + ${fmt(dot(f[1], v))}·b₂`}
                text="The rows of B⁻¹ are the dual basis. Blue dashed lines are where f₁ is constant (they run parallel to b₂), gold ones where f₂ is constant."
              />
            </>
          ) : (
            <Explain
              title="Not a basis"
              text="b₁ and b₂ are parallel, so no dual basis exists."
            />
          )}
        </div>
      </div>
    </Panel>
  );
}
