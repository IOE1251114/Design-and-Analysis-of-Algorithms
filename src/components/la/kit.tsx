import { useId, useRef, useState, type ReactNode } from "react";
import { apply, fmt, type Mat, type Vec } from "../../domain/la/linalg";

export {
  Explain,
  Panel,
  PlayerBar,
  Stats,
  Tabs,
  usePlayer,
  type StepProps,
} from "../ds/kit";

/* Colours with a fixed meaning across every Linear Algebra visual (each is also named in text). */
export const LC = {
  u: "#67d9ff",
  v: "#f4c56a",
  w: "#b8a5ff",
  result: "#64e0b4",
  bad: "#ff8b9a",
  grid: "#1b2838",
  axis: "#3a5975",
  warp: "#2c7fa8",
  muted: "#60748c",
  text: "#e7f4ff",
};

export type Proj = {
  X: (x: number) => number;
  Y: (y: number) => number;
  /** "x,y" in SVG units for a world point. */
  p: (v: Vec) => string;
  range: number;
};

export type Handle = {
  id: string;
  at: Vec;
  color: string;
  label?: string;
  /** Draw an arrow from `from` (default the origin) to `at`. */
  arrow?: boolean;
  from?: Vec;
  drag?: boolean;
};

/** Arrow in world coordinates. */
export function Arrow({
  P,
  from = [0, 0],
  to,
  color,
  width = 2.4,
  dash,
  label,
}: {
  P: Proj;
  from?: Vec;
  to: Vec;
  color: string;
  width?: number;
  dash?: string;
  label?: string;
}) {
  const x1 = P.X(from[0]),
    y1 = P.Y(from[1]),
    x2 = P.X(to[0]),
    y2 = P.Y(to[1]);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return null;
  const ux = (x2 - x1) / len,
    uy = (y2 - y1) / len;
  const h = Math.min(11, len * 0.45);
  const bx = x2 - ux * h,
    by = y2 - uy * h;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={bx}
        y2={by}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap="round"
      />
      <polygon
        points={`${x2},${y2} ${bx - uy * h * 0.45},${by + ux * h * 0.45} ${bx + uy * h * 0.45},${by - ux * h * 0.45}`}
        fill={color}
      />
      {label && (
        <text
          x={x2 + ux * 10 + 4}
          y={y2 + uy * 10 + 4}
          fontSize="12"
          fill={color}
          fontFamily="DM Mono, monospace"
          fontWeight={600}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** Line through the origin (or a point) along a direction, clipped to the plane. */
export function InfiniteLine({
  P,
  dir,
  through = [0, 0],
  color,
  width = 1.6,
  dash,
}: {
  P: Proj;
  dir: Vec;
  through?: Vec;
  color: string;
  width?: number;
  dash?: string;
}) {
  const L = P.range * 3;
  const n = Math.hypot(dir[0], dir[1]) || 1;
  const d = [dir[0] / n, dir[1] / n];
  return (
    <line
      x1={P.X(through[0] - d[0] * L)}
      y1={P.Y(through[1] - d[1] * L)}
      x2={P.X(through[0] + d[0] * L)}
      y2={P.Y(through[1] + d[1] * L)}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dash}
    />
  );
}

/**
 * A square coordinate plane from −range to range. Handles with `drag` can be moved with a mouse,
 * pen or finger and snap to `snap` units. `warp` draws the image of the grid under a 2 × 2 matrix.
 */
export function Plane({
  range = 5,
  handles = [],
  onDrag,
  warp,
  snap = 0.5,
  children,
  ariaLabel,
  size = 400,
}: {
  range?: number;
  handles?: Handle[];
  onDrag?: (id: string, v: Vec) => void;
  warp?: Mat;
  snap?: number;
  children?: (P: Proj) => ReactNode;
  ariaLabel: string;
  size?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const clipId = `la-clip-${useId().replace(/:/g, "")}`;
  const pad = 14;
  const k = (size - 2 * pad) / (2 * range);
  const P: Proj = {
    X: (x) => pad + (x + range) * k,
    Y: (y) => pad + (range - y) * k,
    p: (v) => `${pad + (v[0] + range) * k},${pad + (range - v[1]) * k}`,
    range,
  };
  const toWorld = (e: React.PointerEvent): Vec => {
    const svg = ref.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    const s = (x: number) =>
      Math.max(-range, Math.min(range, Math.round(x / snap) * snap));
    return [s((q.x - pad) / k - range), s(range - (q.y - pad) / k)];
  };
  const ticks = Array.from({ length: 2 * range + 1 }, (_, i) => i - range);
  const W = (x: number, y: number) => (warp ? apply(warp, [x, y]) : [x, y]);
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${size} ${size}`}
      className={`la-plane ${dragging ? "dragging" : ""}`}
      role="img"
      aria-label={ariaLabel}
      onPointerMove={(e) => dragging && onDrag?.(dragging, toWorld(e))}
      onPointerUp={() => setDragging(null)}
      onPointerLeave={() => setDragging(null)}
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={pad}
            y={pad}
            width={size - 2 * pad}
            height={size - 2 * pad}
          />
        </clipPath>
      </defs>
      <rect
        x={pad}
        y={pad}
        width={size - 2 * pad}
        height={size - 2 * pad}
        rx={6}
        fill="#0b1420"
      />
      <g clipPath={`url(#${clipId})`}>
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={P.X(t)}
              y1={P.Y(-range)}
              x2={P.X(t)}
              y2={P.Y(range)}
              stroke={LC.grid}
            />
            <line
              x1={P.X(-range)}
              y1={P.Y(t)}
              x2={P.X(range)}
              y2={P.Y(t)}
              stroke={LC.grid}
            />
          </g>
        ))}
        <line
          x1={P.X(0)}
          y1={P.Y(-range)}
          x2={P.X(0)}
          y2={P.Y(range)}
          stroke={LC.axis}
          strokeWidth={1.4}
        />
        <line
          x1={P.X(-range)}
          y1={P.Y(0)}
          x2={P.X(range)}
          y2={P.Y(0)}
          stroke={LC.axis}
          strokeWidth={1.4}
        />
        {warp &&
          Array.from({ length: 4 * range + 1 }, (_, i) => i - 2 * range).map(
            (t) => {
              const a = W(t, -3 * range),
                b = W(t, 3 * range),
                c = W(-3 * range, t),
                d = W(3 * range, t);
              return (
                <g key={`w${t}`} opacity={t === 0 ? 0.9 : 0.45}>
                  <line
                    x1={P.X(a[0])}
                    y1={P.Y(a[1])}
                    x2={P.X(b[0])}
                    y2={P.Y(b[1])}
                    stroke={LC.warp}
                    strokeWidth={t === 0 ? 1.8 : 1}
                  />
                  <line
                    x1={P.X(c[0])}
                    y1={P.Y(c[1])}
                    x2={P.X(d[0])}
                    y2={P.Y(d[1])}
                    stroke={LC.warp}
                    strokeWidth={t === 0 ? 1.8 : 1}
                  />
                </g>
              );
            },
          )}
        {children?.(P)}
        {handles
          .filter((h) => h.arrow)
          .map((h) => (
            <Arrow
              key={`a${h.id}`}
              P={P}
              from={h.from}
              to={h.at}
              color={h.color}
              label={h.label}
            />
          ))}
      </g>
      {handles
        .filter((h) => h.drag)
        .map((h) => (
          <g key={`h${h.id}`}>
            <circle
              cx={P.X(h.at[0])}
              cy={P.Y(h.at[1])}
              r={14}
              fill="transparent"
              className="la-handle-hit"
              onPointerDown={(e) => {
                (e.target as Element).setPointerCapture?.(e.pointerId);
                setDragging(h.id);
              }}
              onPointerMove={(e) =>
                dragging === h.id && onDrag?.(h.id, toWorld(e))
              }
              onPointerUp={() => setDragging(null)}
            />
            <circle
              cx={P.X(h.at[0])}
              cy={P.Y(h.at[1])}
              r={dragging === h.id ? 7 : 5.5}
              fill={h.color}
              stroke="#0b1420"
              strokeWidth={2}
              pointerEvents="none"
            />
            {!h.arrow && h.label && (
              <text
                x={P.X(h.at[0]) + 9}
                y={P.Y(h.at[1]) - 8}
                fontSize="12"
                fill={h.color}
                fontFamily="DM Mono, monospace"
                fontWeight={600}
                pointerEvents="none"
              >
                {h.label}
              </text>
            )}
          </g>
        ))}
    </svg>
  );
}

/** A matrix drawn with brackets. `hi` highlights one cell, `hiRow` one row, `split` draws an augmentation bar. */
export function MatrixView({
  m,
  label,
  hi,
  hiRow,
  split,
  small,
}: {
  m: Mat;
  label?: ReactNode;
  hi?: [number, number];
  hiRow?: number;
  split?: number;
  small?: boolean;
}) {
  return (
    <div className={`la-matrix ${small ? "small" : ""}`}>
      {label && <span className="la-matrix-label">{label}</span>}
      <div className="la-bracket">
        <table>
          <tbody>
            {m.map((row, i) => (
              <tr key={i} className={i === hiRow ? "row-hi" : ""}>
                {row.map((x, j) => (
                  <td
                    key={j}
                    className={`${hi && hi[0] === i && hi[1] === j ? "hi" : ""} ${split === j ? "split" : ""}`}
                  >
                    {fmt(x)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VecView({
  v,
  label,
  color,
}: {
  v: Vec;
  label?: string;
  color?: string;
}) {
  return (
    <span className="la-vec" style={color ? { borderColor: color } : undefined}>
      {label && <b style={color ? { color } : undefined}>{label}</b>}(
      {v.map(fmt).join(", ")})
    </span>
  );
}

/** Editable matrix of numbers. */
export function MatrixInput({
  m,
  onChange,
  label,
}: {
  m: Mat;
  onChange: (m: Mat) => void;
  label?: string;
}) {
  return (
    <div className="la-matrix-input">
      {label && <span className="la-matrix-label">{label}</span>}
      <div className="la-bracket">
        <div
          className="la-input-grid"
          style={{ gridTemplateColumns: `repeat(${m[0].length}, 48px)` }}
        >
          {m.flatMap((row, i) =>
            row.map((x, j) => (
              <input
                key={`${i}-${j}`}
                type="number"
                step="any"
                value={Number.isFinite(x) ? x : 0}
                aria-label={`Entry row ${i + 1}, column ${j + 1}`}
                onChange={(e) => {
                  const next = m.map((r) => [...r]);
                  next[i][j] =
                    e.target.value === "" ? 0 : Number(e.target.value);
                  onChange(next);
                }}
              />
            )),
          )}
        </div>
      </div>
    </div>
  );
}

/** Preset buttons that load a matrix (or anything) by name. */
export function Presets<T>({
  items,
  onPick,
}: {
  items: { label: string; value: T }[];
  onPick: (v: T) => void;
}) {
  return (
    <div className="la-presets">
      {items.map((it) => (
        <button
          key={it.label}
          className="btn btn-secondary"
          onClick={() => onPick(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/** A labelled slider for one number. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="u1-select la-slider">
      <span>
        {label} = <b>{fmt(value)}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
