import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from 'lucide-react'
import type { GrowthId } from '../../domain/unit1'

/* Chart palette: the site's hues stepped into the dark-surface lightness band and ordered so every
 * adjacent pair stays distinguishable for colour-blind readers (validated: worst adjacent CVD ΔE 10.1).
 * A growth class always wears the same colour on every Unit 1 chart. */
export const SERIES = ['#1ea0ca', '#b78a28', '#1aab80', '#ce7b2c', '#9582db', '#de657a'] as const
export const growthColor: Record<GrowthId, string> = { one: SERIES[0], log: SERIES[1], n: SERIES[2], nlogn: SERIES[3], n2: SERIES[4], exp: SERIES[5] }

export const axis = { stroke: '#2a3b50', tick: { fill: '#8498ae', fontSize: 10, fontFamily: 'DM Mono, monospace' }, tickLine: false }
export const grid = { stroke: '#1b2838', strokeDasharray: '0', vertical: false }
export const tooltipStyle = {
  contentStyle: { background: '#0d1521', border: '1px solid #2a3b50', borderRadius: 8, fontSize: 11, color: '#dce7f5', padding: '8px 10px' },
  labelStyle: { color: '#8da1b7', fontFamily: 'DM Mono, monospace', fontSize: 10, marginBottom: 4 },
  itemStyle: { color: '#dce7f5', padding: 0 },
  cursor: { stroke: '#3a5975', strokeWidth: 1 },
}

/** Round numbers for axis ends and ticks (1, 2, 2.5, 5 × 10^k) so every chart reads the same way. */
export function niceTicks(max: number, count = 5, min = 0) {
  const raw = (max - min) / count, mag = 10 ** Math.floor(Math.log10(raw || 1))
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw)!
  const top = Math.ceil(max / step) * step
  const ticks: number[] = []; for (let t = Math.ceil(min / step) * step; t <= top + 1e-9; t += step) ticks.push(+t.toFixed(6))
  return { top, ticks }
}

export const compact = (v: number) => {
  if (!Number.isFinite(v)) return '∞'
  const a = Math.abs(v)
  if (a >= 1e9) return v.toExponential(1).replace('e+', 'e')
  if (a >= 1e6) return `${+(v / 1e6).toFixed(1)}M`
  if (a >= 1e4) return `${+(v / 1e3).toFixed(1)}k`
  return Number.isInteger(v) ? String(v) : v.toFixed(a < 10 ? 2 : 1)
}

/** Legend chips. Identity is never colour-alone: every chip carries the series name. */
export function Legend({ items, hidden, onToggle }: { items: { id: string; label: string; color: string; dash?: boolean }[]; hidden?: Set<string>; onToggle?: (id: string) => void }) {
  return <div className="u1-legend" role={onToggle ? 'group' : undefined} aria-label="Chart series">{items.map(it => {
    const off = hidden?.has(it.id)
    const body = <><i className={it.dash ? 'dash' : ''} style={{ background: it.dash ? 'transparent' : it.color, borderColor: it.color }}/>{it.label}</>
    return onToggle
      ? <button key={it.id} className={off ? 'off' : ''} aria-pressed={!off} onClick={() => onToggle(it.id)}>{body}</button>
      : <span key={it.id}>{body}</span>
  })}</div>
}

/** Step player with play/pause. Every trace is precomputed, so playback is repeatable frame-for-frame. */
export function usePlayer(total: number, resetKey: unknown, onSteps?: (k: number) => void) {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(4)
  const last = Math.max(0, total - 1)
  useEffect(() => { setStep(0); setPlaying(false) }, [resetKey])
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setStep(s => { if (s >= last) { setPlaying(false); return s } return s + 1 }), 1000 / speed)
    return () => clearInterval(t)
  }, [playing, speed, last])
  const safe = Math.min(step, last)
  return {
    step: safe, last, playing, speed, setSpeed,
    go: (s: number) => { setPlaying(false); setStep(Math.max(0, Math.min(last, s))) },
    next: () => { setPlaying(false); setStep(s => Math.min(last, s + 1)); onSteps?.(1) },
    prev: () => { setPlaying(false); setStep(s => Math.max(0, s - 1)) },
    reset: () => { setPlaying(false); setStep(0) },
    toggle: () => { if (safe >= last) { setStep(0); setPlaying(true) } else setPlaying(p => !p); if (!playing) onSteps?.(1) },
  }
}
export type Player = ReturnType<typeof usePlayer>

export function PlayerBar({ p, label, nextLabel = 'Next' }: { p: Player; label?: ReactNode; nextLabel?: string }) {
  return <div className="u1-player">
    <div className="step-controls">
      <button className="btn btn-secondary" onClick={p.reset} aria-label="Reset"><RotateCcw size={14}/></button>
      <button className="btn btn-secondary" disabled={p.step === 0} onClick={p.prev}><ArrowLeft size={14}/> Back</button>
      <button className="btn btn-primary u1-play" onClick={p.toggle} aria-label={p.playing ? 'Pause' : 'Play'}>{p.playing ? <Pause size={14}/> : <Play size={14}/>}{p.playing ? 'Pause' : p.step >= p.last && p.last > 0 ? 'Replay' : 'Play'}</button>
      <button className="btn btn-secondary" disabled={p.step >= p.last} onClick={p.next}>{nextLabel} <ArrowRight size={14}/></button>
      <label className="u1-speed">Speed<select value={p.speed} onChange={e => p.setSpeed(Number(e.target.value))}><option value={1.5}>Slow</option><option value={4}>Normal</option><option value={12}>Fast</option><option value={40}>Very fast</option></select></label>
    </div>
    <div className="u1-scrub"><span>{label ?? `Step ${p.step + 1} / ${p.last + 1}`}</span><input type="range" min={0} max={p.last} value={p.step} onChange={e => p.go(Number(e.target.value))} aria-label="Scrub through steps"/></div>
  </div>
}

export function Tabs<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return <div className="strategy-tabs" role="tablist">{options.map(o => <button key={o.id} role="tab" aria-selected={value === o.id} className={value === o.id ? 'active' : ''} onClick={() => onChange(o.id)}>{o.label}</button>)}</div>
}