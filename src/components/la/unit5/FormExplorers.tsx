import { useState } from "react";
import { FunctionSquare, Radar } from "lucide-react";
import {
  apply,
  bilinear,
  definiteness,
  dot,
  eigen,
  fmt,
  mul,
  skewPart,
  symPart,
  transpose,
  type Mat,
  type Vec,
} from "../../../domain/la/linalg";
import {
  Explain,
  InfiniteLine,
  LC,
  MatrixInput,
  MatrixView,
  Panel,
  Plane,
  Presets,
  Slider,
  Stats,
} from "../kit";

/* ======================= Bilinear forms ======================= */

const bPresets: { label: string; value: Mat }[] = [
  {
    label: "Dot product (I)",
    value: [
      [1, 0],
      [0, 1],
    ],
  },
  {
    label: "Symmetric",
    value: [
      [2, 1],
      [1, -1],
    ],
  },
  {
    label: "Skew-symmetric",
    value: [
      [0, 1],
      [-1, 0],
    ],
  },
  {
    label: "General",
    value: [
      [1, 3],
      [-1, 2],
    ],
  },
];
const R45: Mat = [
  [Math.SQRT1_2, -Math.SQRT1_2],
  [Math.SQRT1_2, Math.SQRT1_2],
];

export function BilinearExplorer() {
  const [M, setM] = useState<Mat>(bPresets[3].value);
  const [u, setU] = useState<Vec>([2, 1]);
  const [v, setV] = useState<Vec>([-1, 2]);
  const S = symPart(M),
    K = skewPart(M);
  const buv = bilinear(M, u, v),
    bvu = bilinear(M, v, u);
  const isSym = K.flat().every((x) => Math.abs(x) < 1e-12);
  const isSkew = S.flat().every((x) => Math.abs(x) < 1e-12);
  return (
    <Panel
      kicker="UNIT V · BILINEAR FORMS"
      title="B(u, v) = uᵀMv: linear in each argument"
      intro="A bilinear form takes two vectors to a number and is linear in each one separately. In a basis it is a matrix M. Symmetric forms have B(u, v) = B(v, u); skew-symmetric ones have B(u, v) = −B(v, u), so B(v, v) = 0."
      icon={<FunctionSquare size={19} />}
    >
      <Presets items={bPresets} onPick={setM} />
      <div className="la-split">
        <Plane
          ariaLabel="Vectors u and v"
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
        />
        <div>
          <MatrixInput m={M} onChange={setM} label="M =" />
          <Stats
            items={[
              { label: "B(u, v)", value: fmt(buv) },
              { label: "B(v, u)", value: fmt(bvu) },
              {
                label: "B(u, u)",
                value: fmt(bilinear(M, u, u)),
                note: isSkew ? "always 0 for a skew form" : undefined,
              },
            ]}
          />
          <div className="la-row">
            <MatrixView m={S} label="symmetric part (M + Mᵀ)/2" small />
            <MatrixView m={K} label="skew part (M − Mᵀ)/2" small />
          </div>
          <Explain
            title={
              isSym
                ? "Symmetric form"
                : isSkew
                  ? "Skew-symmetric form"
                  : "Neither: a sum of both"
            }
            text={`Every bilinear form splits uniquely as symmetric + skew-symmetric. B(u, v) = ${fmt(bilinear(S, u, v))} + ${fmt(bilinear(K, u, v))}. Only the symmetric part matters for B(v, v), i.e. for the quadratic form.`}
          />
          <p className="u1-small">
            Changing basis by P changes the matrix by congruence, PᵀMP (not
            P⁻¹MP). For P = rotation by 45°:
          </p>
          <MatrixView
            m={mul(mul(transpose(R45), M), R45)}
            label="PᵀMP ="
            small
          />
        </div>
      </div>
    </Panel>
  );
}

/* ======================= Quadratic forms and positive definiteness ======================= */

const qPresets: { label: string; value: [number, number, number] }[] = [
  { label: "Positive definite", value: [2, -1, 2] },
  { label: "Indefinite (saddle)", value: [1, 2, 1] },
  { label: "Semidefinite", value: [1, 1, 1] },
  { label: "Negative definite", value: [-2, 0.5, -1] },
];

export function QuadraticExplorer() {
  const [[a, b, c], setABC] = useState<[number, number, number]>(
    qPresets[0].value,
  );
  const [x, setX] = useState<Vec>([1.5, 1]);
  const S: Mat = [
    [a, b],
    [b, c],
  ];
  const q = (v: Vec) => dot(v, apply(S, v));
  const d = definiteness(S);
  const ev = eigen(S).real.flatMap((e) => e.vectors);
  const N = 24,
    R = 5;
  const vals: number[] = [];
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      vals.push(q([-R + ((j + 0.5) * 2 * R) / N, R - ((i + 0.5) * 2 * R) / N]));
  const max = Math.max(...vals.map(Math.abs), 1e-9);
  return (
    <Panel
      kicker="UNIT V · REAL QUADRATIC FORMS · POSITIVE DEFINITENESS"
      title="q(x) = xᵀSx: a bowl, a saddle or a trough"
      intro="A real quadratic form q(x, y) = ax² + 2bxy + cy² has a symmetric matrix S. It is positive definite when q(x) > 0 for every x ≠ 0 — equivalently, all eigenvalues are positive, or (Sylvester) all leading principal minors are positive."
      icon={<Radar size={19} />}
    >
      <Presets items={qPresets} onPick={setABC} />
      <div className="la-split">
        <Plane
          ariaLabel="Heat map of the quadratic form"
          handles={[{ id: "x", at: x, color: LC.text, label: "x", drag: true }]}
          onDrag={(_, p) => setX(p)}
        >
          {(P) => (
            <>
              {vals.map((val, k) => {
                const i = Math.floor(k / N),
                  j = k % N;
                const t = val / max;
                const x0 = -R + (j * 2 * R) / N,
                  y0 = R - (i * 2 * R) / N;
                return (
                  <rect
                    key={k}
                    x={P.X(x0)}
                    y={P.Y(y0)}
                    width={P.X(x0 + (2 * R) / N) - P.X(x0) + 0.5}
                    height={P.Y(y0 - (2 * R) / N) - P.Y(y0) + 0.5}
                    fill={
                      t >= 0
                        ? `rgba(30,160,202,${Math.abs(t) * 0.75})`
                        : `rgba(222,101,122,${Math.abs(t) * 0.75})`
                    }
                  />
                );
              })}
              {ev.map((v, i) => (
                <InfiniteLine
                  key={i}
                  P={P}
                  dir={v}
                  color={LC.result}
                  width={1.6}
                  dash="6 4"
                />
              ))}
            </>
          )}
        </Plane>
        <div>
          <Slider
            label="a"
            value={a}
            min={-3}
            max={3}
            step={0.5}
            onChange={(v) => setABC([v, b, c])}
          />
          <Slider
            label="b"
            value={b}
            min={-3}
            max={3}
            step={0.5}
            onChange={(v) => setABC([a, v, c])}
          />
          <Slider
            label="c"
            value={c}
            min={-3}
            max={3}
            step={0.5}
            onChange={(v) => setABC([a, b, v])}
          />
          <p className="la-eq">
            q(x, y) = {fmt(a)}x² {2 * b < 0 ? "−" : "+"} {fmt(Math.abs(2 * b))}
            xy {c < 0 ? "−" : "+"} {fmt(Math.abs(c))}y²
          </p>
          <MatrixView m={S} label="S =" small />
          <Explain
            title={`${d.kind[0].toUpperCase()}${d.kind.slice(1)}`}
            text={`Blue means q > 0, red q < 0. Eigenvalues ${d.eigenvalues.map(fmt).join(", ")}; the green dashed lines are the principal axes (eigenvectors). At your point x, q(x) = ${fmt(q(x))}.`}
          />
          <Stats
            items={[
              {
                label: "LEADING MINORS Δ₁, Δ₂",
                value: d.minors.map(fmt).join(", "),
                note: "all > 0 ⇔ positive definite",
              },
              {
                label: "SIGNATURE (+, −)",
                value: `${d.eigenvalues.filter((e) => e > 1e-9).length}, ${d.eigenvalues.filter((e) => e < -1e-9).length}`,
              },
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}
