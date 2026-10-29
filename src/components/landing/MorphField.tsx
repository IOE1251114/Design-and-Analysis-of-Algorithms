import { useEffect, useRef, useState } from "react";
import { Rotate3d, Shuffle } from "lucide-react";

/**
 * Hero canvas: one swarm of points that keeps reorganising itself into a new
 * piece of mathematics. Points that come close link up, the cursor pushes them
 * around, and clicking (or the dots below) jumps to the next formation.
 * 3D formations spin in perspective; 4D ones also rotate through the fourth
 * axis before being projected down to 3D and then onto the screen.
 * In "rotate" mode the shape stays put and the viewer drags to turn it
 * (2D shapes become flat sheets that can be tilted).
 */

const N = 160;
const HOLD_MS = 5200;

type Formation = {
  name: string;
  formula: string;
  color: string;
  /** Circular formations keep a 1:1 aspect instead of stretching to the canvas. */
  round?: boolean;
  /** Target for point i at time t (seconds): [x, y], [x, y, z] or [x, y, z, w], roughly in [-1, 1]. */
  at: (i: number, t: number) => number[];
};

type Mode = "morph" | "rotate";
type View = { yaw: number; pitch: number };

/** Automatic camera angle used while morphing. */
const autoView = (t: number): View => ({
  yaw: t * 0.4,
  pitch: 0.45 + Math.sin(t * 0.25) * 0.25,
});

/**
 * Rotate and project a 2D/3D/4D point to screen space: [x, y, nearness].
 * Without a `view`, 2D points stay flat and 3D/4D points use the automatic camera.
 */
function project(
  v: number[],
  t: number,
  view?: View,
): [number, number, number] {
  let [x, y, z = 0, w = 0] = v;
  if (v.length === 2 && !view) return [x, y, 1];
  if (v.length === 4) {
    const a = t * 0.5;
    const b = t * 0.31;
    [x, w] = [
      x * Math.cos(a) - w * Math.sin(a),
      x * Math.sin(a) + w * Math.cos(a),
    ];
    [z, w] = [
      z * Math.cos(b) - w * Math.sin(b),
      z * Math.sin(b) + w * Math.cos(b),
    ];
    const k = 1.4 / (2.2 - w);
    x *= k;
    y *= k;
    z *= k;
  }
  const { yaw: ay, pitch: ax } = view ?? autoView(t);
  [x, z] = [
    x * Math.cos(ay) + z * Math.sin(ay),
    -x * Math.sin(ay) + z * Math.cos(ay),
  ];
  [y, z] = [
    y * Math.cos(ax) - z * Math.sin(ax),
    y * Math.sin(ax) + z * Math.cos(ax),
  ];
  const k = 2.8 / (2.8 + z);
  return [x * k, y * k, k];
}

/** The 32 edges of a tesseract, as pairs of vertex indices 0–15 (bits = coordinates). */
const tesseractEdges: [number, number][] = [];
for (let v = 0; v < 16; v++)
  for (let bit = 0; bit < 4; bit++)
    if (!(v & (1 << bit))) tesseractEdges.push([v, v | (1 << bit)]);
const corner = (v: number) =>
  [0, 1, 2, 3].map((bit) => (v & (1 << bit) ? 0.5 : -0.5));

// Deterministic pseudo-random values so the Gaussian cloud is the same on every load.
const rand = Array.from({ length: N * 2 }, (_, k) => {
  const x = Math.sin(k * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
});

const formations: Formation[] = [
  {
    name: "Phyllotaxis",
    formula: "θₙ = n · 137.5°,  rₙ = √n",
    color: "#64e0b4",
    round: true,
    at: (i, t) => {
      const r = Math.sqrt((i + 1) / N) * 0.95;
      const a = i * 2.39996 + t * 0.08;
      return [r * Math.cos(a), r * Math.sin(a)];
    },
  },
  {
    name: "Linear map",
    formula: "x′ = A(t) · x",
    color: "#67d9ff",
    at: (i, t) => {
      const x = ((i % 16) / 15) * 2 - 1;
      const y = (Math.floor(i / 16) / 9) * 1.6 - 0.8;
      const a = 0.35 * Math.sin(t * 0.6);
      const k = 0.45 * Math.sin(t * 0.4);
      return [
        0.85 * (Math.cos(a) * x - Math.sin(a) * y + k * y),
        0.85 * (Math.sin(a) * x + Math.cos(a) * y),
      ];
    },
  },
  {
    name: "Binary tree",
    formula: "2ᵈ nodes at depth d",
    color: "#b8a5ff",
    at: (i, t) => {
      const d = Math.floor(Math.log2(i + 1));
      const first = 2 ** d - 1;
      const width = Math.min(2 ** d, N - first);
      const p = i - first;
      const sway = Math.sin(t * 0.8 + d * 0.5) * 0.015 * d;
      return [((p + 0.5) / width) * 1.9 - 0.95 + sway, -0.88 + d * 0.25];
    },
  },
  {
    name: "Lissajous curve",
    formula: "x = sin(3s + φ),  y = sin 2s",
    color: "#f4c56a",
    at: (i, t) => {
      const s = (i / N) * Math.PI * 2;
      return [0.92 * Math.sin(3 * s + t * 0.5), 0.88 * Math.sin(2 * s)];
    },
  },
  {
    name: "Normal distribution",
    formula: "X ~ 𝒩(0, 1)",
    color: "#ff8b9a",
    at: (i, t) => {
      const u1 = Math.max(rand[i * 2], 1e-4);
      const u2 = rand[i * 2 + 1];
      const r = Math.sqrt(-2 * Math.log(u1)) * 0.3;
      const a = 2 * Math.PI * u2 + t * 0.05;
      return [r * Math.cos(a) * 1.4, r * Math.sin(a)];
    },
  },
  {
    name: "Fibonacci sphere",
    formula: "yₙ = 1 − 2n/N,  θₙ = n · 137.5°",
    color: "#67d9ff",
    round: true,
    at: (i) => {
      const y = 1 - (2 * (i + 0.5)) / N;
      const r = Math.sqrt(1 - y * y);
      const a = i * 2.39996;
      return [r * Math.cos(a) * 0.9, y * 0.9, r * Math.sin(a) * 0.9];
    },
  },
  {
    name: "Torus",
    formula: "(R + r cos v) · (cos u, sin u),  r sin v",
    color: "#b8a5ff",
    round: true,
    at: (i) => {
      const u = ((i % 20) / 20) * Math.PI * 2;
      const v = (Math.floor(i / 20) / 8) * Math.PI * 2;
      const ring = 0.62 + 0.28 * Math.cos(v);
      return [ring * Math.cos(u), 0.28 * Math.sin(v), ring * Math.sin(u)];
    },
  },
  {
    name: "Double helix",
    formula: "(cos s, s, sin s)  and  (cos(s + π), s, sin(s + π))",
    color: "#64e0b4",
    round: true,
    at: (i) => {
      const s = (Math.floor(i / 2) / (N / 2 - 1)) * 2 - 1;
      const a = s * Math.PI * 2.2 + (i % 2) * Math.PI;
      return [0.42 * Math.cos(a), s * 0.95, 0.42 * Math.sin(a)];
    },
  },
  {
    name: "Trefoil knot",
    formula: "(sin s + 2 sin 2s,  cos s − 2 cos 2s,  −sin 3s)",
    color: "#f4c56a",
    round: true,
    at: (i) => {
      const s = (i / N) * Math.PI * 2;
      return [
        (Math.sin(s) + 2 * Math.sin(2 * s)) / 3.1,
        (Math.cos(s) - 2 * Math.cos(2 * s)) / 3.1,
        -Math.sin(3 * s) / 2.2,
      ];
    },
  },
  {
    name: "Tesseract",
    formula: "16 vertices · 32 edges · 8 cubes",
    color: "#67d9ff",
    round: true,
    at: (i) => {
      const [a, b] = tesseractEdges[Math.floor(i / 5)];
      const f = (i % 5) / 5;
      const p = corner(a);
      const q = corner(b);
      return p.map((c, k) => c + (q[k] - c) * f);
    },
  },
  {
    name: "Clifford torus",
    formula: "(cos u, sin u, cos v, sin v) / √2",
    color: "#ff8b9a",
    round: true,
    at: (i) => {
      const u = ((i % 16) / 16) * Math.PI * 2;
      const v = (Math.floor(i / 16) / 10) * Math.PI * 2;
      const r = 0.95 / Math.SQRT2;
      return [
        r * Math.cos(u),
        r * Math.sin(u),
        r * Math.cos(v),
        r * Math.sin(v),
      ];
    },
  },
];

/** Points nearer the viewer (larger projection factor) are drawn brighter. */
const alpha = (k: number) => Math.min(1, Math.max(0.15, (k - 0.65) * 1.6));

const clampPitch = (p: number) => Math.max(-1.45, Math.min(1.45, p));

const dimension = (f: Formation) => `${f.at(0, 0).length}D`;

export function MorphField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const changedAt = useRef(0);
  const [mode, setModeState] = useState<Mode>("morph");
  const modeRef = useRef<Mode>("morph");
  const view = useRef<View>({ yaw: 0, pitch: 0 });
  const spin = useRef({ yaw: 0, pitch: 0 });

  const setMode = (next: Mode) => {
    if (next === modeRef.current) return;
    const now = performance.now();
    if (next === "rotate") {
      // Start from the angle the shape is currently shown at, so nothing jumps.
      const flat = formations[activeRef.current].at(0, 0).length === 2;
      view.current = flat ? { yaw: 0, pitch: 0 } : autoView(now / 1000);
      spin.current = { yaw: 0.004, pitch: 0 };
    }
    changedAt.current = now;
    modeRef.current = next;
    setModeState(next);
  };

  const go = (k: number) => {
    const next = (k + formations.length) % formations.length;
    activeRef.current = next;
    changedAt.current = performance.now();
    setActive(next);
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const still = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let w = 0;
    let h = 0;
    let frame = 0;
    const pos = Array.from({ length: N }, (_, i) => [
      (rand[i] - 0.5) * 2,
      (rand[i + N] - 0.5) * 2,
    ]);
    const vel = Array.from({ length: N }, () => [0, 0]);
    const near = Array.from({ length: N }, () => 1);
    const mouse = { x: -1e4, y: -1e4 };
    const drag = { on: false, x: 0, y: 0 };
    changedAt.current = performance.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Points live in pixel space; formations are mapped from [-1, 1].
    for (const p of pos) {
      p[0] = w / 2 + p[0] * w * 0.45;
      p[1] = h / 2 + p[1] * h * 0.45;
    }

    const draw = (now: number) => {
      const t = now / 1000;
      const rotating = modeRef.current === "rotate";
      if (rotating && !drag.on && !still) {
        // Coast after a drag, easing back to a slow idle spin.
        view.current.yaw += spin.current.yaw;
        view.current.pitch = clampPitch(
          view.current.pitch + spin.current.pitch,
        );
        spin.current.yaw = spin.current.yaw * 0.95 + 0.004 * 0.05;
        spin.current.pitch *= 0.9;
      }
      if (!rotating && !still && now - changedAt.current > HOLD_MS) {
        const next = (activeRef.current + 1) % formations.length;
        activeRef.current = next;
        changedAt.current = now;
        setActive(next);
      }
      const f = formations[activeRef.current];
      const flat = !rotating && f.at(0, 0).length === 2;
      const sx = f.round ? Math.min(w, h) * 0.46 : w * 0.45;
      const sy = f.round ? Math.min(w, h) * 0.46 : h * 0.44;

      for (let i = 0; i < N; i++) {
        const [tx, ty, k] = project(
          f.at(i, still ? 0 : t),
          still ? 1.2 : t,
          rotating ? view.current : undefined,
        );
        near[i] = k;
        const gx = w / 2 + tx * sx;
        const gy = h / 2 + ty * sy;
        const p = pos[i];
        const v = vel[i];
        const dx = p[0] - mouse.x;
        const dy = p[1] - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (!rotating && d2 < 80 * 80 && d2 > 0.01) {
          const push = (1 - Math.sqrt(d2) / 80) * 2.4;
          v[0] += (dx / Math.sqrt(d2)) * push;
          v[1] += (dy / Math.sqrt(d2)) * push;
        }
        // A stiffer spring while rotating so the shape follows the drag closely.
        const damp = rotating ? 0.7 : 0.86;
        const pull = rotating ? 0.08 : 0.012;
        v[0] = v[0] * damp + (gx - p[0]) * pull;
        v[1] = v[1] * damp + (gy - p[1]) * pull;
        if (still) {
          p[0] = gx;
          p[1] = gy;
        } else {
          p[0] += v[0];
          p[1] += v[1];
        }
      }

      ctx.clearRect(0, 0, w, h);
      const link = Math.max(26, Math.min(w, h) * 0.11);
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pos[i][0] - pos[j][0];
          const dy = pos[i][1] - pos[j][1];
          const d = Math.hypot(dx, dy);
          if (d < link) {
            const depth = flat ? 1 : Math.min(alpha(near[i]), alpha(near[j]));
            ctx.globalAlpha = (1 - d / link) * 0.45 * depth;
            ctx.beginPath();
            ctx.moveTo(pos[i][0], pos[i][1]);
            ctx.lineTo(pos[j][0], pos[j][1]);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = f.color;
      for (let i = 0; i < N; i++) {
        ctx.globalAlpha = flat ? 1 : alpha(near[i]);
        ctx.beginPath();
        ctx.arc(
          pos[i][0],
          pos[i][1],
          flat ? 2 : 0.6 + 1.6 * near[i],
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    const down = (e: PointerEvent) => {
      if (modeRef.current !== "rotate") return;
      drag.on = true;
      drag.x = e.clientX;
      drag.y = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      if (!drag.on) return;
      const dYaw = (e.clientX - drag.x) * 0.01;
      const dPitch = (e.clientY - drag.y) * 0.01;
      view.current.yaw += dYaw;
      view.current.pitch = clampPitch(view.current.pitch + dPitch);
      spin.current = { yaw: dYaw, pitch: dPitch };
      drag.x = e.clientX;
      drag.y = e.clientY;
    };
    const up = () => {
      drag.on = false;
    };
    const leave = () => {
      mouse.x = mouse.y = -1e4;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, []);

  const f = formations[active];
  return (
    <div className={`morph-field morph-${mode}`}>
      <div className="demo-head">
        <span className="live-dot" /> ONE SWARM · MANY SHAPES
        <div className="morph-toggle" role="group" aria-label="Animation mode">
          <button
            aria-pressed={mode === "morph"}
            className={mode === "morph" ? "on" : ""}
            onClick={() => setMode("morph")}
          >
            <Shuffle size={12} /> Morph
          </button>
          <button
            aria-pressed={mode === "rotate"}
            className={mode === "rotate" ? "on" : ""}
            onClick={() => setMode("rotate")}
          >
            <Rotate3d size={12} /> Rotate
          </button>
        </div>
      </div>
      <p className="morph-hint">
        {mode === "morph"
          ? "Move your cursor to push the points · click to morph"
          : "Drag to rotate · pick a shape with the dots below"}
      </p>
      <canvas
        ref={canvasRef}
        onClick={() => mode === "morph" && go(active + 1)}
        aria-label={
          mode === "morph"
            ? `Animated points forming a ${f.name}. Click to change.`
            : `A ${f.name} made of points. Drag to rotate it.`
        }
        role="img"
      />
      <div className="morph-caption">
        <div>
          <strong style={{ color: f.color }}>
            {f.name} <span className="morph-dim">{dimension(f)}</span>
          </strong>
          <code>{f.formula}</code>
        </div>
        <div
          className="morph-dots"
          role="group"
          aria-label="Choose a formation"
        >
          {formations.map((x, k) => (
            <button
              key={x.name}
              aria-label={x.name}
              aria-pressed={k === active}
              className={k === active ? "on" : ""}
              style={k === active ? { background: x.color } : undefined}
              onClick={() => go(k)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
