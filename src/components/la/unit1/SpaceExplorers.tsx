import { useMemo, useState } from "react";
import { Space3D } from "../Space3D";
import { Boxes, Combine, Grid2x2, Move, Sigma } from "lucide-react";
import {
  checkGroup,
  combine,
  ringSummary,
  structures,
} from "../../../domain/la/algebra";
import {
  addV,
  det,
  fmt,
  inverse,
  nullSpace,
  rank,
  scaleV,
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
  Slider,
  Stats,
  Tabs,
  VecView,
} from "../kit";

/* ======================= Groups, rings and fields ======================= */

export function StructuresExplorer() {
  const [n, setN] = useState(6);
  const [kind, setKind] = useState<"add" | "mul" | "units">("add");
  const [cell, setCell] = useState<[number, number] | null>(null);
  const s = structures(n)[kind];
  const g = checkGroup(s, n);
  const ring = ringSummary(n);
  const sym = s.op === "add" ? "+" : "×";
  return (
    <Panel
      kicker="UNIT I · MODERN ALGEBRA"
      title="Groups, rings and fields on ℤₙ"
      intro="The integers mod n with + or × form a table. A group needs closure, associativity, an identity and inverses; a field needs + and × to both behave, with every non-zero element invertible."
      icon={<Boxes size={19} />}
    >
      <div className="u1-controls">
        <Tabs
          value={kind}
          onChange={(k) => {
            setKind(k);
            setCell(null);
          }}
          options={[
            { id: "add", label: "Addition mod n" },
            { id: "mul", label: "Multiplication mod n" },
            { id: "units", label: "× without 0" },
          ]}
        />
        <Slider
          label="n"
          value={n}
          min={2}
          max={12}
          step={1}
          onChange={(v) => {
            setN(v);
            setCell(null);
          }}
        />
      </div>
      <div className="la-split">
        <div className="u1-table-wrap">
          <table
            className="la-cayley"
            aria-label={`Operation table for ${s.label}`}
          >
            <thead>
              <tr>
                <th>{sym}</th>
                {s.elements.map((b) => (
                  <th key={b}>{b}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.elements.map((a) => (
                <tr key={a}>
                  <th>{a}</th>
                  {s.elements.map((b) => {
                    const c = combine(s.op, a, b, n);
                    const isId = c === g.identity;
                    const sel = cell && cell[0] === a && cell[1] === b;
                    return (
                      <td
                        key={b}
                        className={`${isId ? "id" : ""} ${sel ? "sel" : ""} ${!s.elements.includes(c) ? "out" : ""}`}
                        style={{
                          background: `hsl(${(c * 360) / n} 45% ${sel ? 34 : 20}%)`,
                        }}
                        onClick={() => setCell([a, b])}
                      >
                        {c}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <small className="ds-label">{s.label} — IS IT A GROUP?</small>
          <ul className="la-checks">
            {g.checks.map((c) => (
              <li key={c.name} className={c.ok ? "ok" : "no"}>
                <b>{c.ok ? "✓" : "✗"}</b> {c.name}
                {c.witness && <span>{c.witness}</span>}
              </li>
            ))}
          </ul>
          <Explain
            title={
              g.isGroup
                ? `${s.label} is an abelian group`
                : `${s.label} is not a group`
            }
            text={
              cell
                ? `${cell[0]} ${sym} ${cell[1]} ≡ ${combine(s.op, cell[0], cell[1], n)} (mod ${n}). Cells highlighted in a frame equal the identity, so their row and column are inverses.`
                : "Click a cell to read it. Each row of a group table is a rearrangement of the elements (the Latin-square property)."
            }
          />
        </div>
      </div>
      <Stats
        items={[
          { label: `ℤ${n} AS A RING`, value: "commutative ring with 1" },
          {
            label: "ZERO DIVISORS",
            value: ring.zeroDivisors.length
              ? ring.zeroDivisors
                  .slice(0, 3)
                  .map(([a, b]) => `${a}·${b}`)
                  .join(", ")
              : "none",
            note: "a·b ≡ 0 with a, b ≠ 0",
          },
          {
            label: "IS IT A FIELD?",
            value: ring.field ? "Yes" : "No",
            note: ring.field
              ? `${n} is prime: every non-zero element has an inverse`
              : `${n} is not prime`,
          },
        ]}
      />
    </Panel>
  );
}

/* ======================= Vector spaces and subspaces ======================= */

type SetId = "line" | "shifted" | "axes" | "quadrant" | "plane" | "zero";
const sets: Record<
  SetId,
  {
    label: string;
    contains: (v: Vec) => boolean;
    snap: (v: Vec) => Vec;
    subspace: boolean;
    why: string;
  }
> = {
  line: {
    label: "Line y = 2x",
    contains: (v) => Math.abs(v[1] - 2 * v[0]) < 1e-9,
    snap: (v) => {
      const t = (v[0] + 2 * v[1]) / 5;
      return [t, 2 * t];
    },
    subspace: true,
    why: "A line through the origin contains 0 and is closed under addition and scaling: a subspace of dimension 1.",
  },
  shifted: {
    label: "Line y = 2x + 1",
    contains: (v) => Math.abs(v[1] - 2 * v[0] - 1) < 1e-9,
    snap: (v) => {
      const t = (v[0] + 2 * (v[1] - 1)) / 5;
      return [t, 2 * t + 1];
    },
    subspace: false,
    why: "It misses the origin, so it cannot be a subspace (0·u must be in every subspace).",
  },
  axes: {
    label: "Union of the two axes",
    contains: (v) => Math.abs(v[0]) < 1e-9 || Math.abs(v[1]) < 1e-9,
    snap: (v) => (Math.abs(v[0]) < Math.abs(v[1]) ? [0, v[1]] : [v[0], 0]),
    subspace: false,
    why: "Closed under scaling, but (1, 0) + (0, 1) = (1, 1) lies on neither axis: not closed under addition.",
  },
  quadrant: {
    label: "First quadrant (x, y ≥ 0)",
    contains: (v) => v[0] >= -1e-9 && v[1] >= -1e-9,
    snap: (v) => [Math.max(0, v[0]), Math.max(0, v[1])],
    subspace: false,
    why: "Closed under addition, but −1·u leaves the quadrant: not closed under scalar multiplication.",
  },
  plane: {
    label: "Whole plane ℝ²",
    contains: () => true,
    snap: (v) => v,
    subspace: true,
    why: "ℝ² is a subspace of itself (dimension 2).",
  },
  zero: {
    label: "Only the origin",
    contains: (v) => Math.abs(v[0]) < 1e-9 && Math.abs(v[1]) < 1e-9,
    snap: () => [0, 0],
    subspace: true,
    why: "{0} is the trivial subspace (dimension 0).",
  },
};

export function SubspaceExplorer() {
  const [id, setId] = useState<SetId>("line");
  const S = sets[id];
  const [u, setU] = useState<Vec>([1, 2]);
  const [v, setV] = useState<Vec>([-0.5, -1]);
  const [c, setC] = useState(-1.5);
  const pick = (k: SetId) => {
    setId(k);
    setU(sets[k].snap([1, 2]));
    setV(sets[k].snap([2, 0.5]));
  };
  const sum = addV(u, v),
    cu = scaleV(u, c);
  const checks = [
    { name: "contains 0", ok: S.contains([0, 0]) },
    {
      name: `u + v = (${sum.map(fmt).join(", ")}) is in the set`,
      ok: S.contains(sum),
    },
    {
      name: `c·u = (${cu.map(fmt).join(", ")}) is in the set`,
      ok: S.contains(cu),
    },
  ];
  return (
    <Panel
      kicker="UNIT I · VECTOR SPACES"
      title="Is this set a subspace?"
      intro="A subset W of a vector space is a subspace when it contains 0 and is closed under addition and scalar multiplication. Drag u and v inside the set and change c to hunt for a counterexample."
      icon={<Grid2x2 size={19} />}
    >
      <div className="la-presets">
        {(Object.keys(sets) as SetId[]).map((k) => (
          <button
            key={k}
            className={`btn ${k === id ? "btn-primary" : "btn-secondary"}`}
            onClick={() => pick(k)}
          >
            {sets[k].label}
          </button>
        ))}
      </div>
      <div className="la-split">
        <Plane
          ariaLabel={`Set ${S.label} with vectors u and v`}
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
          onDrag={(h, p) => (h === "u" ? setU(S.snap(p)) : setV(S.snap(p)))}
        >
          {(P) => (
            <>
              {id === "line" && (
                <InfiniteLine P={P} dir={[1, 2]} color={LC.result} width={3} />
              )}
              {id === "shifted" && (
                <InfiniteLine
                  P={P}
                  dir={[1, 2]}
                  through={[0, 1]}
                  color={LC.result}
                  width={3}
                />
              )}
              {id === "axes" && (
                <>
                  <InfiniteLine
                    P={P}
                    dir={[1, 0]}
                    color={LC.result}
                    width={3}
                  />
                  <InfiniteLine
                    P={P}
                    dir={[0, 1]}
                    color={LC.result}
                    width={3}
                  />
                </>
              )}
              {id === "quadrant" && (
                <rect
                  x={P.X(0)}
                  y={P.Y(5)}
                  width={P.X(5) - P.X(0)}
                  height={P.Y(0) - P.Y(5)}
                  fill={LC.result}
                  opacity={0.14}
                />
              )}
              {id === "plane" && (
                <rect
                  x={P.X(-5)}
                  y={P.Y(5)}
                  width={P.X(5) - P.X(-5)}
                  height={P.Y(-5) - P.Y(5)}
                  fill={LC.result}
                  opacity={0.08}
                />
              )}
              {id === "zero" && (
                <circle cx={P.X(0)} cy={P.Y(0)} r={6} fill={LC.result} />
              )}
              <Arrow
                P={P}
                to={sum}
                color={S.contains(sum) ? LC.result : LC.bad}
                dash="5 4"
                label="u+v"
              />
              <Arrow
                P={P}
                to={cu}
                color={S.contains(cu) ? LC.w : LC.bad}
                dash="2 4"
                label="cu"
              />
            </>
          )}
        </Plane>
        <div>
          <Slider
            label="c"
            value={c}
            min={-3}
            max={3}
            step={0.5}
            onChange={setC}
          />
          <ul className="la-checks">
            {checks.map((k) => (
              <li key={k.name} className={k.ok ? "ok" : "no"}>
                <b>{k.ok ? "✓" : "✗"}</b> {k.name}
              </li>
            ))}
          </ul>
          <Explain
            title={
              S.subspace
                ? `${S.label}: a subspace`
                : `${S.label}: not a subspace`
            }
            text={S.why}
          />
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Linear span and (in)dependence ======================= */

export function SpanExplorer() {
  const [v1, setV1] = useState<Vec>([2, 1]);
  const [v2, setV2] = useState<Vec>([-1, 1.5]);
  const [a, setA] = useState(1.5);
  const [b, setB] = useState(1);
  const [M3, setM3] = useState<Mat>([
    [1, 2, 3],
    [0, 1, 1],
    [1, 3, 4],
  ]);
  const D = det([
    [v1[0], v2[0]],
    [v1[1], v2[1]],
  ]);
  const independent = Math.abs(D) > 1e-9;
  const combo = addV(scaleV(v1, a), scaleV(v2, b));
  const lattice: Vec[] = [];
  if (independent)
    for (let i = -6; i <= 6; i++)
      for (let j = -6; j <= 6; j++)
        lattice.push(addV(scaleV(v1, i), scaleV(v2, j)));
  // Columns of M3 are the three vectors in ℝ³.
  const r3 = rank(M3);
  const cols3 = [0, 1, 2].map((j) => M3.map((r) => r[j]));
  const rel = nullSpace(M3)[0];
  return (
    <Panel
      kicker="UNIT I · SPAN & INDEPENDENCE"
      title="Everything you can reach with a·v₁ + b·v₂"
      intro="The span of a set is every linear combination of its vectors. Two vectors in ℝ² span the whole plane unless one is a multiple of the other — exactly when they are linearly dependent."
      icon={<Combine size={19} />}
    >
      <div className="la-split">
        <Plane
          ariaLabel="Vectors v1 and v2 with a linear combination"
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
          onDrag={(h, p) => (h === "v1" ? setV1(p) : setV2(p))}
        >
          {(P) => (
            <>
              {independent ? (
                lattice.map((q, k) => (
                  <circle
                    key={k}
                    cx={P.X(q[0])}
                    cy={P.Y(q[1])}
                    r={2}
                    fill={LC.result}
                    opacity={0.5}
                  />
                ))
              ) : (
                <InfiniteLine
                  P={P}
                  dir={Math.hypot(...v1) > 0 ? v1 : v2}
                  color={LC.bad}
                  width={3}
                />
              )}
              <Arrow
                P={P}
                to={scaleV(v1, a)}
                color={LC.u}
                width={1.4}
                dash="4 3"
              />
              <Arrow
                P={P}
                from={scaleV(v1, a)}
                to={combo}
                color={LC.v}
                width={1.4}
                dash="4 3"
              />
              <Arrow
                P={P}
                to={combo}
                color={LC.result}
                width={3}
                label="av₁+bv₂"
              />
            </>
          )}
        </Plane>
        <div>
          <Slider
            label="a"
            value={a}
            min={-3}
            max={3}
            step={0.25}
            onChange={setA}
          />
          <Slider
            label="b"
            value={b}
            min={-3}
            max={3}
            step={0.25}
            onChange={setB}
          />
          <p className="la-eq">
            {fmt(a)}·<VecView v={v1} color={LC.u} /> + {fmt(b)}·
            <VecView v={v2} color={LC.v} /> ={" "}
            <VecView v={combo} color={LC.result} />
          </p>
          <Explain
            title={
              independent
                ? "Linearly independent: span = ℝ²"
                : "Linearly dependent: span is a line"
            }
            text={
              independent
                ? `det[v₁ v₂] = ${fmt(D)} ≠ 0. The dots are the integer combinations; every point of the plane is some a·v₁ + b·v₂.`
                : "det[v₁ v₂] = 0: one vector is a multiple of the other, so every combination stays on the red line."
            }
          />
        </div>
      </div>
      <div className="la-split">
        <Space3D
          ariaLabel="The three column vectors in three dimensions"
          items={[
            ...(r3 === 2
              ? [
                  {
                    kind: "plane" as const,
                    a: cols3[0],
                    b: rank([cols3[0], cols3[1]]) === 2 ? cols3[1] : cols3[2],
                    color: LC.bad,
                  },
                ]
              : []),
            ...cols3.map((c, i) => ({
              kind: "vec" as const,
              v: c,
              color: [LC.u, LC.v, LC.w][i],
              label: `c${i + 1}`,
            })),
          ]}
        />
        <div>
          <MatrixInput
            m={M3}
            onChange={setM3}
            label="Three vectors in ℝ³ (as columns)"
          />
          <Explain
            title={
              r3 === 3
                ? "Independent: they span ℝ³"
                : `Dependent: they span a ${r3 === 2 ? "plane" : r3 === 1 ? "line" : "point"}`
            }
            text={
              rel
                ? `Rank ${r3}. A non-trivial relation: ${rel.map((x, i) => `${fmt(x)}·c${i + 1}`).join(" + ")} = 0.`
                : `Rank 3: the only solution of x₁c₁ + x₂c₂ + x₃c₃ = 0 is x = 0.`
            }
          />
          {r3 === 2 && (
            <p className="u1-small">
              The red plane is their span: all three arrows lie in it.
            </p>
          )}
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Bases and dimension ======================= */

export function BasisExplorer() {
  const [b1, setB1] = useState<Vec>([2, 1]);
  const [b2, setB2] = useState<Vec>([-1, 1]);
  const [p, setP] = useState<Vec>([1, 3]);
  const B = [
    [b1[0], b2[0]],
    [b1[1], b2[1]],
  ];
  const inv = inverse(B);
  const coords = inv
    ? [inv[0][0] * p[0] + inv[0][1] * p[1], inv[1][0] * p[0] + inv[1][1] * p[1]]
    : null;
  return (
    <Panel
      kicker="UNIT I · BASES & DIMENSION"
      title="The same point in a different coordinate system"
      intro="A basis is an independent spanning set. Every vector has exactly one set of coordinates in it. Drag the basis vectors to tilt the grid, and drag p to read its coordinates."
      icon={<Move size={19} />}
    >
      <div className="la-split">
        <Plane
          ariaLabel="Basis grid with point p"
          warp={inv ? B : undefined}
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
            { id: "p", at: p, color: LC.result, label: "p", drag: true },
          ]}
          onDrag={(h, q) =>
            h === "b1" ? setB1(q) : h === "b2" ? setB2(q) : setP(q)
          }
        >
          {(P) =>
            coords && (
              <>
                <Arrow
                  P={P}
                  to={scaleV(b1, coords[0])}
                  color={LC.u}
                  width={1.5}
                  dash="5 3"
                />
                <Arrow
                  P={P}
                  from={scaleV(b1, coords[0])}
                  to={p}
                  color={LC.v}
                  width={1.5}
                  dash="5 3"
                />
              </>
            )
          }
        </Plane>
        <div>
          <Explain
            title={
              coords ? `[p]_B = (${coords.map(fmt).join(", ")})` : "Not a basis"
            }
            text={
              coords
                ? `p = ${fmt(coords[0])}·b₁ + ${fmt(coords[1])}·b₂. In the standard basis p = (${p.map(fmt).join(", ")}). The blue grid is the B-grid: its lines are where one B-coordinate is a whole number.`
                : "b₁ and b₂ are parallel, so they do not span ℝ²: some points have no coordinates and others have many."
            }
          />
          <Stats
            items={[
              {
                label: "dim ℝ²",
                value: 2,
                note: "every basis has exactly 2 vectors",
              },
              {
                label: "det[b₁ b₂]",
                value: fmt(det(B)),
                note: "non-zero ⇔ basis",
              },
            ]}
          />
          {inv && (
            <MatrixView m={inv} label="B⁻¹ converts standard → B coordinates" />
          )}
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Direct sums ======================= */

export function DirectSumExplorer() {
  const [u, setU] = useState<Vec>([2, 0.5]);
  const [w, setW] = useState<Vec>([0.5, 2]);
  const [v, setV] = useState<Vec>([3, 3]);
  const sol = useMemo(() => {
    const M = [
      [u[0], w[0]],
      [u[1], w[1]],
    ];
    const inv = inverse(M);
    return inv
      ? [
          inv[0][0] * v[0] + inv[0][1] * v[1],
          inv[1][0] * v[0] + inv[1][1] * v[1],
        ]
      : null;
  }, [u, w, v]);
  const r = rank([
    [u[0], w[0]],
    [u[1], w[1]],
  ]);
  return (
    <Panel
      kicker="UNIT I · DIRECT SUMS"
      title="ℝ² = U ⊕ W: one way to split every vector"
      intro="V = U ⊕ W when V = U + W and U ∩ W = {0}. Then every v splits uniquely as v = u + w with u in U and w in W. Here U and W are lines through the origin."
      icon={<Sigma size={19} />}
    >
      <div className="la-split">
        <Plane
          ariaLabel="Two lines U and W and a vector v split along them"
          handles={[
            { id: "u", at: u, color: LC.u, label: "U", drag: true },
            { id: "w", at: w, color: LC.v, label: "W", drag: true },
            {
              id: "v",
              at: v,
              color: LC.result,
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
              <InfiniteLine P={P} dir={u} color={LC.u} width={1.6} />
              <InfiniteLine P={P} dir={w} color={LC.v} width={1.6} />
              {sol && (
                <>
                  <Arrow
                    P={P}
                    to={scaleV(u, sol[0])}
                    color={LC.u}
                    width={2.4}
                    label="u"
                  />
                  <Arrow
                    P={P}
                    from={scaleV(u, sol[0])}
                    to={v}
                    color={LC.v}
                    width={1.6}
                    dash="5 3"
                  />
                  <Arrow
                    P={P}
                    to={scaleV(w, sol[1])}
                    color={LC.v}
                    width={2.4}
                    label="w"
                  />
                  <Arrow
                    P={P}
                    from={scaleV(w, sol[1])}
                    to={v}
                    color={LC.u}
                    width={1.6}
                    dash="5 3"
                  />
                </>
              )}
            </>
          )}
        </Plane>
        <div>
          <Explain
            title={sol ? "Direct sum: the split is unique" : "Not a direct sum"}
            text={
              sol
                ? `v = (${scaleV(u, sol[0]).map(fmt).join(", ")}) + (${scaleV(w, sol[1]).map(fmt).join(", ")}). U ∩ W = {0} and dim U + dim W = 1 + 1 = 2 = dim ℝ².`
                : "U and W are the same line: U ∩ W ≠ {0} and U + W is only a line, so vectors off it cannot be split at all."
            }
          />
          <Stats
            items={[
              { label: "dim(U + W)", value: r },
              {
                label: "dim(U ∩ W)",
                value: 2 - r,
                note: "dim U + dim W − dim(U + W)",
              },
            ]}
          />
          <p className="u1-small">
            In ℝ³ a plane and a line through the origin not lying in it form a
            direct sum; two planes never do (they meet in a line).
          </p>
        </div>
      </div>
    </Panel>
  );
}
