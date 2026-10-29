import { useEffect, useRef, useState } from "react";
import { norm, scaleV, subV, dot, type Vec } from "../../domain/la/linalg";

export type Item3 =
  | {
      kind: "vec";
      v: Vec;
      color: string;
      label?: string;
      from?: Vec;
      width?: number;
      dash?: string;
    }
  | { kind: "plane"; a: Vec; b: Vec; color: string; opacity?: number }
  | { kind: "line"; dir: Vec; color: string; dash?: string }
  | { kind: "point"; v: Vec; color: string; label?: string }
  | { kind: "face"; pts: Vec[]; color: string; opacity?: number };

/**
 * A rotatable 3-D view of ℝ³ drawn in SVG. Drag to orbit; it turns slowly on its own until touched.
 * z points up; the floor grid is the xy-plane.
 */
export function Space3D({
  items,
  range = 4,
  ariaLabel,
  size = 420,
}: {
  items: Item3[];
  range?: number;
  ariaLabel: string;
  size?: number;
}) {
  const [yaw, setYaw] = useState(-0.7);
  const [pitch, setPitch] = useState(0.45);
  const [spin, setSpin] = useState(true);
  const drag = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (
      !spin ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const id = setInterval(() => setYaw((y) => y + 0.006), 30);
    return () => clearInterval(id);
  }, [spin]);

  const c = size / 2,
    s = (size * 0.36) / range,
    D = range * 5;
  const cyw = Math.cos(yaw),
    syw = Math.sin(yaw),
    cp = Math.cos(pitch),
    sp = Math.sin(pitch);
  const proj = (p: Vec) => {
    const x1 = p[0] * cyw - p[1] * syw;
    const y1 = p[0] * syw + p[1] * cyw;
    const y2 = y1 * cp - p[2] * sp;
    const z2 = y1 * sp + p[2] * cp;
    const f = D / (D + y2);
    return { X: c + s * x1 * f, Y: c - s * z2 * f, depth: y2 };
  };
  const pt = (p: Vec) => {
    const q = proj(p);
    return `${q.X},${q.Y}`;
  };

  const arrow = (
    from: Vec,
    to: Vec,
    color: string,
    width = 2.6,
    dash?: string,
    label?: string,
    key?: string,
  ) => {
    const a = proj(from),
      b = proj(to);
    const len = Math.hypot(b.X - a.X, b.Y - a.Y);
    if (len < 2)
      return <circle key={key} cx={b.X} cy={b.Y} r={3} fill={color} />;
    const ux = (b.X - a.X) / len,
      uy = (b.Y - a.Y) / len,
      h = Math.min(11, len * 0.4);
    const bx = b.X - ux * h,
      by = b.Y - uy * h;
    return (
      <g key={key}>
        <line
          x1={a.X}
          y1={a.Y}
          x2={bx}
          y2={by}
          stroke={color}
          strokeWidth={width}
          strokeDasharray={dash}
          strokeLinecap="round"
        />
        <polygon
          points={`${b.X},${b.Y} ${bx - uy * h * 0.45},${by + ux * h * 0.45} ${bx + uy * h * 0.45},${by - ux * h * 0.45}`}
          fill={color}
        />
        {label && (
          <text
            x={b.X + ux * 10 + 3}
            y={b.Y + uy * 10 + 4}
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
  };

  const ticks = Array.from({ length: 2 * range + 1 }, (_, i) => i - range);
  // Draw far things first so nearer ones overlap them.
  const depthOf = (it: Item3) =>
    it.kind === "vec"
      ? proj(scaleV(it.v, 0.5)).depth
      : it.kind === "point"
        ? proj(it.v).depth
        : it.kind === "face"
          ? Math.max(...it.pts.map((p) => proj(p).depth))
          : 1e9;
  const ordered = [...items].sort((a, b) => depthOf(b) - depthOf(a));

  return (
    <div className="la-3d">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="la-plane la-3d-svg"
        role="img"
        aria-label={`${ariaLabel}. Drag to rotate.`}
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY };
          setSpin(false);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setYaw((y) => y - (e.clientX - drag.current!.x) * 0.01);
          setPitch((p) =>
            Math.max(
              -1.45,
              Math.min(1.45, p + (e.clientY - drag.current!.y) * 0.01),
            ),
          );
          drag.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
      >
        <rect
          x={6}
          y={6}
          width={size - 12}
          height={size - 12}
          rx={8}
          fill="#0b1420"
        />
        {ticks.map((t) => (
          <g key={t} opacity={0.6}>
            <line
              {...xy(proj([t, -range, 0]), proj([t, range, 0]))}
              stroke="#2a405a"
            />
            <line
              {...xy(proj([-range, t, 0]), proj([range, t, 0]))}
              stroke="#2a405a"
            />
          </g>
        ))}
        {items
          .filter(
            (it): it is Extract<Item3, { kind: "plane" }> =>
              it.kind === "plane",
          )
          .map((it, i) => {
            const [u1, u2] = planeBasis(it.a, it.b);
            if (!u2) return null;
            const L = range * 0.7;
            const corners = [
              scaleV(addS(u1, u2, 1, 1), L),
              scaleV(addS(u1, u2, 1, -1), L),
              scaleV(addS(u1, u2, -1, -1), L),
              scaleV(addS(u1, u2, -1, 1), L),
            ];
            return (
              <polygon
                key={`p${i}`}
                points={corners.map(pt).join(" ")}
                fill={it.color}
                opacity={it.opacity ?? 0.18}
                stroke={it.color}
                strokeOpacity={0.5}
              />
            );
          })}
        {items
          .filter(
            (it): it is Extract<Item3, { kind: "line" }> => it.kind === "line",
          )
          .map((it, i) => {
            const n = norm(it.dir) || 1;
            const d = scaleV(it.dir, (range * 1.6) / n);
            return (
              <line
                key={`l${i}`}
                {...xy(proj(scaleV(d, -1)), proj(d))}
                stroke={it.color}
                strokeWidth={1.6}
                strokeDasharray={it.dash}
              />
            );
          })}
        {(["x", "y", "z"] as const).map((ax, k) => {
          const e: Vec = [0, 0, 0];
          e[k] = range;
          const col = ["#de657a", "#1aab80", "#1ea0ca"][k];
          const neg = proj(scaleV(e, -1)),
            pos = proj(e);
          return (
            <g key={ax}>
              <line
                x1={neg.X}
                y1={neg.Y}
                x2={pos.X}
                y2={pos.Y}
                stroke={col}
                strokeOpacity={0.55}
                strokeWidth={1.2}
              />
              <text
                x={pos.X + 4}
                y={pos.Y + 4}
                fontSize="11"
                fill={col}
                fontFamily="DM Mono, monospace"
              >
                {ax}
              </text>
            </g>
          );
        })}
        {ordered.map((it, i) => {
          if (it.kind === "vec")
            return arrow(
              it.from ?? [0, 0, 0],
              it.v,
              it.color,
              it.width,
              it.dash,
              it.label,
              `v${i}`,
            );
          if (it.kind === "point") {
            const q = proj(it.v);
            return (
              <g key={`pt${i}`}>
                <circle cx={q.X} cy={q.Y} r={4.5} fill={it.color} />
                {it.label && (
                  <text
                    x={q.X + 7}
                    y={q.Y - 6}
                    fontSize="11"
                    fill={it.color}
                    fontFamily="DM Mono, monospace"
                  >
                    {it.label}
                  </text>
                )}
              </g>
            );
          }
          if (it.kind === "face")
            return (
              <polygon
                key={`f${i}`}
                points={it.pts.map(pt).join(" ")}
                fill={it.color}
                opacity={it.opacity ?? 0.2}
                stroke={it.color}
                strokeOpacity={0.6}
              />
            );
          return null;
        })}
      </svg>
      <div className="la-3d-controls">
        <button
          className="btn btn-secondary"
          onClick={() => setSpin((v) => !v)}
        >
          {spin ? "Stop rotating" : "Auto-rotate"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setYaw(-0.7);
            setPitch(0.45);
          }}
        >
          Reset view
        </button>
        <span className="u1-small">Drag the picture to turn it.</span>
      </div>
    </div>
  );
}

const xy = (a: { X: number; Y: number }, b: { X: number; Y: number }) => ({
  x1: a.X,
  y1: a.Y,
  x2: b.X,
  y2: b.Y,
});
const addS = (u: Vec, v: Vec, a: number, b: number) =>
  u.map((x, i) => a * x + b * v[i]);

/** Orthonormal basis of span{a, b} (second vector undefined if they are parallel). */
function planeBasis(a: Vec, b: Vec): [Vec, Vec | undefined] {
  const u1 = scaleV(a, 1 / (norm(a) || 1));
  const w = subV(b, scaleV(u1, dot(b, u1)));
  const n = norm(w);
  return [u1, n < 1e-9 ? undefined : scaleV(w, 1 / n)];
}

/** Three number inputs for one vector in ℝ³. */
export function Vec3Input({
  v,
  onChange,
  label,
  color,
}: {
  v: Vec;
  onChange: (v: Vec) => void;
  label: string;
  color: string;
}) {
  return (
    <div className="la-vec3">
      <b style={{ color }}>{label}</b>
      {v.map((x, i) => (
        <input
          key={i}
          type="number"
          step="0.5"
          value={x}
          aria-label={`${label} component ${i + 1}`}
          onChange={(e) =>
            onChange(
              v.map((y, j) => (j === i ? Number(e.target.value) || 0 : y)),
            )
          }
        />
      ))}
    </div>
  );
}
