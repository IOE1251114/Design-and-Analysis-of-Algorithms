import { useState } from "react";
import { Box, Grid3x3, Spline, Atom } from "lucide-react";
import {
  addV,
  apply,
  cabs,
  cx,
  fmt,
  fmtC,
  mul,
  norm,
  scaleV,
  type C,
  type Mat,
  type Vec,
} from "../../../domain/la/linalg";
import {
  cinner,
  cnorm,
  cross,
  cscale,
  derivative,
  derivativeMatrix,
  matSubspaces,
  polar,
  polyAdd,
  polyEval,
  polyString,
  shiftedCoords,
  spanShape,
  triple,
  vecOf,
  type Poly,
} from "../../../domain/la/spaces";
import {
  Arrow,
  Explain,
  LC,
  MatrixInput,
  MatrixView,
  Panel,
  Plane,
  Slider,
  Stats,
  Tabs,
  VecView,
} from "../kit";
import { Space3D, Vec3Input, type Item3 } from "../Space3D";

/* ======================= ℝ³ ======================= */

export function R3Explorer() {
  const [u, setU] = useState<Vec>([2, 0, 1]);
  const [v, setV] = useState<Vec>([0, 2, 1]);
  const [w, setW] = useState<Vec>([1, 1, 2.5]);
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [c, setC] = useState(0.5);
  const [view, setView] = useState<"span" | "combo" | "cross" | "volume">(
    "span",
  );
  const two = spanShape([u, v]);
  const three = spanShape([u, v, w]);
  const combo = addV(addV(scaleV(u, a), scaleV(v, b)), scaleV(w, c));
  const n = cross(u, v);
  const vol = triple(u, v, w);
  const box: Item3[] = (() => {
    const P = (x: number, y: number, z: number) =>
      addV(addV(scaleV(u, x), scaleV(v, y)), scaleV(w, z));
    const faces: [number, number, number][][] = [
      [
        [0, 0, 0],
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
        [0, 1, 1],
      ],
      [
        [0, 0, 0],
        [1, 0, 0],
        [1, 0, 1],
        [0, 0, 1],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [1, 1, 1],
        [0, 1, 1],
      ],
      [
        [0, 0, 0],
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1],
      ],
      [
        [1, 0, 0],
        [1, 1, 0],
        [1, 1, 1],
        [1, 0, 1],
      ],
    ];
    return faces.map((f) => ({
      kind: "face" as const,
      pts: f.map(([x, y, z]) => P(x, y, z)),
      color: LC.result,
      opacity: 0.12,
    }));
  })();
  const items: Item3[] = [
    ...(view === "span"
      ? two.rank === 2
        ? [{ kind: "plane" as const, a: u, b: v, color: LC.u }]
        : two.rank === 1
          ? [{ kind: "line" as const, dir: norm(u) ? u : v, color: LC.bad }]
          : []
      : []),
    ...(view === "volume" ? box : []),
    { kind: "vec", v: u, color: LC.u, label: "u" },
    { kind: "vec", v: v, color: LC.v, label: "v" },
    ...(view !== "cross"
      ? [{ kind: "vec" as const, v: w, color: LC.w, label: "w" }]
      : []),
    ...(view === "combo"
      ? [
          {
            kind: "vec" as const,
            from: scaleV(u, a),
            v: addV(scaleV(u, a), scaleV(v, b)),
            color: LC.v,
            width: 1.4,
            dash: "4 3",
          },
          {
            kind: "vec" as const,
            from: addV(scaleV(u, a), scaleV(v, b)),
            v: combo,
            color: LC.w,
            width: 1.4,
            dash: "4 3",
          },
          {
            kind: "vec" as const,
            v: scaleV(u, a),
            color: LC.u,
            width: 1.4,
            dash: "4 3",
          },
          {
            kind: "vec" as const,
            v: combo,
            color: LC.result,
            width: 3.2,
            label: "au+bv+cw",
          },
        ]
      : []),
    ...(view === "cross"
      ? [
          { kind: "plane" as const, a: u, b: v, color: LC.u, opacity: 0.1 },
          {
            kind: "vec" as const,
            v: n,
            color: LC.result,
            width: 3,
            label: "u×v",
          },
        ]
      : []),
  ];
  return (
    <Panel
      kicker="UNIT I · VECTOR SPACES · ℝ³"
      title="Three dimensions you can turn around"
      intro="ℝ³ is the space of triples (x, y, z). Two independent vectors span a plane through the origin, three independent ones span everything. Edit the vectors, then drag the view to see the geometry from any side."
      icon={<Box size={19} />}
    >
      <Tabs
        value={view}
        onChange={setView}
        options={[
          { id: "span", label: "Span of u, v" },
          { id: "combo", label: "Linear combination" },
          { id: "cross", label: "Cross product" },
          { id: "volume", label: "Volume & independence" },
        ]}
      />
      <div className="la-split">
        <Space3D
          items={items}
          ariaLabel="Vectors u, v and w in three dimensions"
        />
        <div>
          <Vec3Input v={u} onChange={setU} label="u" color={LC.u} />
          <Vec3Input v={v} onChange={setV} label="v" color={LC.v} />
          <Vec3Input v={w} onChange={setW} label="w" color={LC.w} />
          {view === "combo" && (
            <>
              <Slider
                label="a"
                value={a}
                min={-2}
                max={2}
                step={0.25}
                onChange={setA}
              />
              <Slider
                label="b"
                value={b}
                min={-2}
                max={2}
                step={0.25}
                onChange={setB}
              />
              <Slider
                label="c"
                value={c}
                min={-2}
                max={2}
                step={0.25}
                onChange={setC}
              />
            </>
          )}
          <Explain
            title={
              view === "span"
                ? `span{u, v} is ${two.shape}`
                : view === "combo"
                  ? `au + bv + cw = (${combo.map(fmt).join(", ")})`
                  : view === "cross"
                    ? `u × v = (${n.map(fmt).join(", ")})`
                    : `det[u v w] = ${fmt(vol)}`
            }
            text={
              view === "span"
                ? two.rank === 2
                  ? "The blue square is part of the plane of all au + bv. It passes through the origin, so it is a 2-dimensional subspace of ℝ³."
                  : "u and v are parallel: their span is only a line (red)."
                : view === "combo"
                  ? "Follow the dashed path: a·u, then add b·v, then add c·w. Every point reachable this way is in span{u, v, w}."
                  : view === "cross"
                    ? `u × v is perpendicular to both (u·(u×v) = 0) and its length ${fmt(norm(n))} is the area of the parallelogram on u and v.`
                    : Math.abs(vol) > 1e-9
                      ? `The box on u, v, w has volume |det| = ${fmt(Math.abs(vol))} > 0, so the three vectors are independent and form a basis of ℝ³.`
                      : "The box is flat (volume 0): the vectors lie in one plane, so they are dependent."
            }
          />
          <Stats
            items={[
              {
                label: "rank{u, v, w}",
                value: three.rank,
                note: `they span ${three.shape}`,
              },
              { label: "dim ℝ³", value: 3 },
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Matrix spaces ======================= */

function Tile({
  m,
  label,
  highlight,
}: {
  m: Mat;
  label?: string;
  highlight?: boolean;
}) {
  const max = Math.max(1, ...m.flat().map(Math.abs));
  return (
    <div>
      <div
        className="la-tile"
        style={highlight ? { borderColor: LC.result } : undefined}
      >
        {m.flat().map((x, i) => (
          <span
            key={i}
            style={{
              background:
                x >= 0
                  ? `rgba(30,160,202,${0.15 + (0.7 * x) / max})`
                  : `rgba(222,101,122,${0.15 + (0.7 * -x) / max})`,
            }}
          >
            {fmt(x)}
          </span>
        ))}
      </div>
      {label && <span className="la-tile-label">{label}</span>}
    </div>
  );
}

export function MatrixSpaceExplorer() {
  const [A, setA] = useState<Mat>([
    [1, 2],
    [2, -1],
  ]);
  const [B, setB] = useState<Mat>([
    [0, 1],
    [-1, 3],
  ]);
  const [a, setAa] = useState(1);
  const [b, setBb] = useState(-1);
  const [sid, setSid] = useState("sym");
  const C = A.map((r, i) => r.map((x, j) => a * x + b * B[i][j]));
  const S = matSubspaces.find((m) => m.id === sid)!;
  return (
    <Panel
      kicker="UNIT I · VECTOR SPACES · MATRICES"
      title="Matrices are vectors too"
      intro="The 2 × 2 real matrices form a vector space M₂ₓ₂: add them entry by entry and scale every entry. With the basis E₁₁, E₁₂, E₂₁, E₂₂ every matrix has four coordinates, so M₂ₓ₂ behaves exactly like ℝ⁴."
      icon={<Grid3x3 size={19} />}
    >
      <div className="la-split">
        <div>
          <div className="la-row">
            <MatrixInput m={A} onChange={setA} label="A =" />
            <MatrixInput m={B} onChange={setB} label="B =" />
          </div>
          <Slider
            label="a"
            value={a}
            min={-2}
            max={2}
            step={0.5}
            onChange={setAa}
          />
          <Slider
            label="b"
            value={b}
            min={-2}
            max={2}
            step={0.5}
            onChange={setBb}
          />
          <div className="la-tiles">
            <span>{fmt(a)}·</span>
            <Tile m={A} label="A" />
            <span>+ {fmt(b)}·</span>
            <Tile m={B} label="B" />
            <span>=</span>
            <Tile m={C} label="aA + bB" highlight />
          </div>
          <p className="la-eq">
            coordinates: A ↦ <VecView v={vecOf(A)} color={LC.u} />, B ↦{" "}
            <VecView v={vecOf(B)} color={LC.v} />, aA + bB ↦{" "}
            <VecView v={vecOf(C)} color={LC.result} />
          </p>
        </div>
        <Plane
          ariaLabel="The combination aA + bB acting on the unit square"
          warp={C}
          range={4}
        >
          {(P) => (
            <>
              <polygon
                points={[
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 1],
                ]
                  .map((q) => apply(C, q))
                  .map(P.p)
                  .join(" ")}
                fill={LC.result}
                opacity={0.25}
                stroke={LC.result}
              />
              <Arrow P={P} to={apply(C, [1, 0])} color={LC.u} label="Ce₁" />
              <Arrow P={P} to={apply(C, [0, 1])} color={LC.v} label="Ce₂" />
            </>
          )}
        </Plane>
      </div>
      <small className="ds-label">SUBSPACES OF M₂ₓ₂ — PICK ONE</small>
      <div className="la-presets">
        {matSubspaces.map((m) => (
          <button
            key={m.id}
            className={`btn ${m.id === sid ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setSid(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="la-split">
        <div>
          <ul className="la-checks">
            {[
              { name: "A is in it", ok: S.test(A) },
              { name: "B is in it", ok: S.test(B) },
              { name: "aA + bB is in it", ok: S.test(C) },
              {
                name: "the zero matrix is in it",
                ok: S.test([
                  [0, 0],
                  [0, 0],
                ]),
              },
            ].map((k) => (
              <li key={k.name} className={k.ok ? "ok" : "no"}>
                <b>{k.ok ? "✓" : "✗"}</b> {k.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Explain
            title={
              S.basis.length
                ? `${S.label}: a subspace of dimension ${S.basis.length}`
                : `${S.label}: not a subspace`
            }
            text={S.basis.length ? `Condition ${S.rule}. Basis:` : S.rule}
          />
          <div className="la-tiles">
            {S.basis.map((m, i) => (
              <Tile key={i} m={m} />
            ))}
          </div>
        </div>
      </div>
      <div className="la-row">
        <MatrixView m={mul(A, B)} small label="AB =" />
        <p className="u1-small">
          Matrices act on vectors as well: the plane shows aA + bB as a
          transformation. Products such as AB are extra structure — the
          vector-space operations are only + and scaling.
        </p>
      </div>
    </Panel>
  );
}

/* ======================= Polynomial spaces ======================= */

function FunctionPlot({
  fns,
  xr = 3,
  yr = 10,
  marks,
}: {
  fns: {
    f: (x: number) => number;
    color: string;
    label: string;
    dash?: string;
    width?: number;
  }[];
  xr?: number;
  yr?: number;
  marks?: { x: number; color: string }[];
}) {
  const W = 420,
    H = 300,
    pad = 14;
  const X = (x: number) => pad + ((x + xr) / (2 * xr)) * (W - 2 * pad);
  const Y = (y: number) => H / 2 - (y / yr) * (H / 2 - pad);
  const xs = Array.from({ length: 241 }, (_, i) => -xr + (i * 2 * xr) / 240);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="la-plane"
      role="img"
      aria-label={`Graphs of ${fns.map((f) => f.label).join(", ")}`}
    >
      <rect
        x={pad}
        y={pad}
        width={W - 2 * pad}
        height={H - 2 * pad}
        rx={6}
        fill="#0b1420"
      />
      {Array.from({ length: 2 * xr + 1 }, (_, i) => i - xr).map((t) => (
        <line
          key={`x${t}`}
          x1={X(t)}
          y1={pad}
          x2={X(t)}
          y2={H - pad}
          stroke={LC.grid}
        />
      ))}
      {[-yr, -yr / 2, 0, yr / 2, yr].map((t) => (
        <g key={`y${t}`}>
          <line
            x1={pad}
            y1={Y(t)}
            x2={W - pad}
            y2={Y(t)}
            stroke={t === 0 ? LC.axis : LC.grid}
            strokeWidth={t === 0 ? 1.4 : 1}
          />
          {t !== 0 && (
            <text x={pad + 4} y={Y(t) - 3} fontSize="9" fill={LC.muted}>
              {t}
            </text>
          )}
        </g>
      ))}
      <line
        x1={X(0)}
        y1={pad}
        x2={X(0)}
        y2={H - pad}
        stroke={LC.axis}
        strokeWidth={1.4}
      />
      <clipPath id="la-fn-clip">
        <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} />
      </clipPath>
      <g clipPath="url(#la-fn-clip)">
        {marks?.map((m, i) => (
          <line
            key={i}
            x1={X(m.x)}
            y1={pad}
            x2={X(m.x)}
            y2={H - pad}
            stroke={m.color}
            strokeDasharray="4 4"
          />
        ))}
        {fns.map((fn) => (
          <polyline
            key={fn.label}
            points={xs
              .map(
                (x) =>
                  `${X(x)},${Y(Math.max(-yr * 3, Math.min(yr * 3, fn.f(x))))}`,
              )
              .join(" ")}
            fill="none"
            stroke={fn.color}
            strokeWidth={fn.width ?? 2}
            strokeDasharray={fn.dash}
          />
        ))}
      </g>
      {fns.map((fn, i) => (
        <text
          key={fn.label}
          x={W - pad - 6}
          y={pad + 16 + i * 15}
          textAnchor="end"
          fontSize="11"
          fill={fn.color}
          fontFamily="DM Mono, monospace"
        >
          {fn.label}
        </text>
      ))}
    </svg>
  );
}

function CoeffInput({
  p,
  onChange,
  label,
  color,
}: {
  p: Poly;
  onChange: (p: Poly) => void;
  label: string;
  color: string;
}) {
  return (
    <div className="la-vec3">
      <b style={{ color }}>{label}</b>
      {p.map((x, i) => (
        <input
          key={i}
          type="number"
          step="0.5"
          value={x}
          aria-label={`${label} coefficient of x^${i}`}
          onChange={(e) =>
            onChange(
              p.map((y, j) => (j === i ? Number(e.target.value) || 0 : y)),
            )
          }
        />
      ))}
    </div>
  );
}

export function PolySpaceExplorer() {
  const [tab, setTab] = useState<"combo" | "basis" | "derivative">("combo");
  const [p, setP] = useState<Poly>([1, -2, 0, 0.5]);
  const [q, setQ] = useState<Poly>([-2, 0, 1, 0]);
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [c, setC] = useState(1);
  const r = polyAdd(p, q, a, b);
  const coords = shiftedCoords(p, c);
  const dp = derivative(p);
  const D = derivativeMatrix(3);
  return (
    <Panel
      kicker="UNIT I · VECTOR SPACES · POLYNOMIALS"
      title="Polynomials as vectors"
      intro="P₃, the polynomials of degree at most 3, is a vector space: add polynomials and scale them coefficient by coefficient. In the basis {1, x, x², x³} each polynomial is the vector of its four coefficients, so dim P₃ = 4. Each box below is one coefficient, from the constant term up."
      icon={<Spline size={19} />}
    >
      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { id: "combo", label: "Linear combination" },
          { id: "basis", label: "Another basis" },
          { id: "derivative", label: "d/dx is linear" },
        ]}
      />
      <div className="la-split">
        <FunctionPlot
          fns={
            tab === "combo"
              ? [
                  {
                    f: (x) => polyEval(p, x),
                    color: LC.u,
                    label: "p",
                    dash: "5 3",
                    width: 1.6,
                  },
                  {
                    f: (x) => polyEval(q, x),
                    color: LC.v,
                    label: "q",
                    dash: "5 3",
                    width: 1.6,
                  },
                  {
                    f: (x) => polyEval(r, x),
                    color: LC.result,
                    label: "ap + bq",
                    width: 3,
                  },
                ]
              : tab === "basis"
                ? [
                    {
                      f: (x) => polyEval(p, x),
                      color: LC.u,
                      label: "p",
                      width: 3,
                    },
                    ...[0, 1, 2, 3].map((k) => ({
                      f: (x: number) => coords[k] * (x - c) ** k,
                      color: [LC.v, LC.w, LC.bad, LC.result][k],
                      label: `${fmt(coords[k])}(x−${fmt(c)})${"⁰¹²³"[k]}`,
                      dash: "3 3",
                      width: 1.2,
                    })),
                  ]
                : [
                    {
                      f: (x) => polyEval(p, x),
                      color: LC.u,
                      label: "p",
                      width: 2.4,
                    },
                    {
                      f: (x) => polyEval(dp, x),
                      color: LC.result,
                      label: "p′ = Dp",
                      width: 2.4,
                    },
                  ]
          }
          marks={tab === "basis" ? [{ x: c, color: LC.muted }] : undefined}
        />
        <div>
          <CoeffInput p={p} onChange={setP} label="p" color={LC.u} />
          {tab === "combo" && (
            <>
              <CoeffInput p={q} onChange={setQ} label="q" color={LC.v} />
              <Slider
                label="a"
                value={a}
                min={-2}
                max={2}
                step={0.25}
                onChange={setA}
              />
              <Slider
                label="b"
                value={b}
                min={-2}
                max={2}
                step={0.25}
                onChange={setB}
              />
              <Explain
                title={`ap + bq = ${polyString(r)}`}
                text={
                  <>
                    Coordinates add like vectors: {fmt(a)}·
                    <VecView v={p} color={LC.u} /> + {fmt(b)}·
                    <VecView v={q} color={LC.v} /> ={" "}
                    <VecView v={r} color={LC.result} />. The polynomials of
                    degree exactly 3 are not a subspace: x³ + (−x³) = 0 drops
                    out.
                  </>
                }
              />
            </>
          )}
          {tab === "basis" && (
            <>
              <Slider
                label="centre c"
                value={c}
                min={-2}
                max={2}
                step={0.5}
                onChange={setC}
              />
              <Explain
                title={`[p] in {1, (x−c), (x−c)², (x−c)³} = (${coords.map(fmt).join(", ")})`}
                text={`p = ${polyString(p)} is the same vector, but its coordinates change with the basis. These ones are p(c), p′(c), p″(c)/2!, p‴(c)/3! — Taylor's formula is a change of basis. The dashed curves are the four pieces; they add up to p.`}
              />
            </>
          )}
          {tab === "derivative" && (
            <>
              <div className="la-row">
                <MatrixView m={D} label="D in basis {1, x, x², x³}" small />
                <MatrixView m={p.map((x) => [x])} label="[p]" small />
                <MatrixView m={dp.map((x) => [x])} label="[p′] = D[p]" small />
              </div>
              <Explain
                title={`p′ = ${polyString(dp)}`}
                text="Differentiation satisfies D(ap + bq) = aDp + bDq, so it is a linear map P₃ → P₃. Its null space is the constants (rank 3, nullity 1), and D⁴ = 0. Evaluation p ↦ p(1) is a linear functional on P₃."
              />
            </>
          )}
          <Stats
            items={[
              { label: "dim P₃", value: 4, note: "dim Pₙ = n + 1" },
              {
                label: "p(1)",
                value: fmt(polyEval(p, 1)),
                note: "the evaluation functional",
              },
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Complex vector spaces ======================= */

export function ComplexSpaceExplorer() {
  const [tab, setTab] = useState<"c1" | "c2">("c1");
  const [z, setZ] = useState<Vec>([2, 1]);
  const [cc, setCc] = useState<Vec>([1, 1]);
  const [u1, setU1] = useState<Vec>([2, 1]);
  const [u2, setU2] = useState<Vec>([-1, 2]);
  const [v1, setV1] = useState<Vec>([1, -2]);
  const [v2, setV2] = useState<Vec>([2, 1]);
  const [mod, setMod] = useState(1);
  const [arg, setArg] = useState(90);
  const Z: C = cx(z[0], z[1]),
    Cc: C = cx(cc[0], cc[1]);
  const cz = cscale(Cc, [Z])[0];
  const s = cx(
    mod * Math.cos((arg * Math.PI) / 180),
    mod * Math.sin((arg * Math.PI) / 180),
  );
  const u = [cx(u1[0], u1[1]), cx(u2[0], u2[1])];
  const v = [cx(v1[0], v1[1]), cx(v2[0], v2[1])];
  const su = cscale(s, u);
  const ip = cinner(u, v);
  const toV = (w: C): Vec => [w.re, w.im];
  return (
    <Panel
      kicker="UNIT I · VECTOR SPACES · COMPLEX"
      title="Complex vector spaces: scalars that rotate"
      intro="In ℂⁿ both the entries and the scalars are complex numbers. Multiplying by a complex scalar c = r·e^{iθ} scales by r and rotates by θ. ℂ is 1-dimensional over ℂ but looks like a plane: as a real space it has dimension 2."
      icon={<Atom size={19} />}
    >
      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { id: "c1", label: "ℂ: the complex plane" },
          { id: "c2", label: "ℂ²: two complex coordinates" },
        ]}
      />
      {tab === "c1" ? (
        <div className="la-split">
          <Plane
            ariaLabel="Complex plane with z, c and c times z"
            handles={[
              {
                id: "z",
                at: z,
                color: LC.u,
                label: "z",
                arrow: true,
                drag: true,
              },
              {
                id: "c",
                at: cc,
                color: LC.v,
                label: "c",
                arrow: true,
                drag: true,
              },
            ]}
            onDrag={(h, p) => (h === "z" ? setZ(p) : setCc(p))}
          >
            {(P) => (
              <>
                <Arrow
                  P={P}
                  to={toV(cz)}
                  color={LC.result}
                  width={3}
                  label="c·z"
                />
                <Arrow
                  P={P}
                  to={[z[0], -z[1]]}
                  color={LC.muted}
                  width={1.4}
                  dash="4 3"
                  label="z̄"
                />
                <text x={P.X(4.2)} y={P.Y(0) - 6} fontSize="10" fill={LC.muted}>
                  Re
                </text>
                <text x={P.X(0) + 6} y={P.Y(4.6)} fontSize="10" fill={LC.muted}>
                  Im
                </text>
              </>
            )}
          </Plane>
          <div>
            <Explain
              title={`(${fmtC(Cc)})(${fmtC(Z)}) = ${fmtC(cz)}`}
              text={`|c·z| = |c|·|z| = ${fmt(cabs(Cc))} × ${fmt(cabs(Z))} = ${fmt(cabs(cz))}, and the angles add: ${fmt((polar(Cc).theta * 180) / Math.PI)}° + ${fmt((polar(Z).theta * 180) / Math.PI)}° = ${fmt((polar(cz).theta * 180) / Math.PI)}° (mod 360). Drag c onto the unit circle for a pure rotation; c = i turns z by 90°.`}
            />
            <Stats
              items={[
                { label: "dim ℂ over ℂ", value: 1, note: "basis {1}: z = z·1" },
                {
                  label: "dim ℂ over ℝ",
                  value: 2,
                  note: "basis {1, i}: z = a·1 + b·i",
                },
                {
                  label: "z̄ (conjugate)",
                  value: fmtC(cx(z[0], -z[1])),
                  note: "reflection in the real axis",
                },
              ]}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="la-row">
            <Slider
              label="|c|"
              value={mod}
              min={0}
              max={2}
              step={0.1}
              onChange={setMod}
            />
            <Slider
              label="arg c (°)"
              value={arg}
              min={-180}
              max={180}
              step={15}
              onChange={setArg}
            />
          </div>
          <div className="la-complex-pair">
            {[
              { k: 0, uu: u1, set: setU1, vv: v1, setV: setV1 },
              { k: 1, uu: u2, set: setU2, vv: v2, setV: setV2 },
            ].map(({ k, uu, set, vv, setV }) => (
              <div key={k}>
                <small className="ds-label">
                  COMPONENT {k + 1} (a complex plane)
                </small>
                <Plane
                  ariaLabel={`Component ${k + 1} of u, v and c·u`}
                  handles={[
                    {
                      id: "u",
                      at: uu,
                      color: LC.u,
                      label: `u${k + 1}`,
                      arrow: true,
                      drag: true,
                    },
                    {
                      id: "v",
                      at: vv,
                      color: LC.v,
                      label: `v${k + 1}`,
                      arrow: true,
                      drag: true,
                    },
                  ]}
                  onDrag={(h, p) => (h === "u" ? set(p) : setV(p))}
                >
                  {(P) => (
                    <Arrow
                      P={P}
                      to={toV(su[k])}
                      color={LC.result}
                      width={3}
                      label={`(cu)${k + 1}`}
                    />
                  )}
                </Plane>
              </div>
            ))}
          </div>
          <Explain
            title={`c = ${fmtC(s)}: c·u = (${su.map(fmtC).join(", ")})`}
            text="A complex scalar acts on every component the same way: each one is scaled by |c| and turned by arg c. A vector in ℂ² needs two planes to draw — it is a point in a 4-dimensional real space."
          />
          <Stats
            items={[
              {
                label: "‖u‖ = √(|u₁|² + |u₂|²)",
                value: fmt(cnorm(u)),
                note: "always real",
              },
              {
                label: "⟨u, v⟩ = u₁v̄₁ + u₂v̄₂",
                value: fmtC(ip),
                note:
                  Math.abs(ip.re) < 1e-9 && Math.abs(ip.im) < 1e-9
                    ? "u ⟂ v"
                    : "complex in general",
              },
              {
                label: "⟨v, u⟩",
                value: fmtC(cinner(v, u)),
                note: "the conjugate of ⟨u, v⟩",
              },
              { label: "dim ℂ²", value: "2 over ℂ · 4 over ℝ" },
            ]}
          />
        </>
      )}
    </Panel>
  );
}
