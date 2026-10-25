import type { EState, GFrame, VState } from '../../domain/unit3/algos'
import { edgeKey, type Graph } from '../../domain/unit3/graphs'
import { SERIES } from '../unit1/shared'

/* One drawing for every Unit 3 graph. Colours always match the legend chips used beside it. */
export const ECOL: Record<EState | 'none', { c: string; w: number; dash?: string }> = {
  none: { c: '#33485f', w: 1.6 }, checked: { c: '#4d6a84', w: 1.6 }, tree: { c: '#1aab80', w: 3.2 }, sp: { c: '#1aab80', w: 3.6 },
  back: { c: '#de657a', w: 2.4, dash: '6 4' }, forward: { c: '#9582db', w: 2.4, dash: '6 4' }, cross: { c: '#ce7b2c', w: 2.4, dash: '6 4' },
  removed: { c: '#1f2d3d', w: 1.4, dash: '2 4' }, relaxed: { c: '#f4c56a', w: 2.8 }, bridge: { c: '#ff8b9a', w: 4 }, focus: { c: '#e7f4ff', w: 3 },
}
export const VCOL: Record<VState, { fill: string; stroke: string }> = {
  unseen: { fill: '#121c28', stroke: '#3a5068' }, frontier: { fill: '#2a2412', stroke: '#f4c56a' }, active: { fill: '#11304a', stroke: '#67d9ff' },
  done: { fill: '#10302a', stroke: '#1aab80' }, ap: { fill: '#3a1f28', stroke: '#ff8b9a' }, bad: { fill: '#2a1520', stroke: '#de657a' },
}
export const groupColor = (i: number) => SERIES[i % SERIES.length]

export function GraphView({ g, f, onNode, selected, removed, maxWidth = 760, view = '0 0 660 350' }: { g: Graph; f?: Partial<GFrame>; onNode?: (i: number) => void; selected?: number | null; removed?: number | null; maxWidth?: number; view?: string }) {
  const R = 20
  const keys = new Set(g.edges.map(e => `${e.u}>${e.v}`))
  return <svg viewBox={view} className="u1-svg u3-graph" style={{ maxWidth }} role="img" aria-label={`${g.directed ? 'Directed' : 'Undirected'} graph with ${g.labels.length} vertices and ${g.edges.length} edges`}>
    {g.edges.map((e, i) => {
      if (removed !== undefined && removed !== null && (e.u === removed || e.v === removed)) return null
      const k = edgeKey(g, e.u, e.v), st = f?.estate?.[k], focus = f?.focusEdge === k
      const groupC = f?.ecomp?.[k] !== undefined ? groupColor(f.ecomp[k]) : null
      const sty = ECOL[st ?? 'none'], color = st === 'bridge' ? sty.c : groupC ?? sty.c
      const [x1, y1] = g.pos[e.u], [x2, y2] = g.pos[e.v]
      const twin = g.directed && keys.has(`${e.v}>${e.u}`)
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len
      const bend = twin ? 26 : 0, cx = (x1 + x2) / 2 + nx * bend, cy = (y1 + y2) / 2 + ny * bend
      // endpoint trimmed to the node border, along the curve's end tangent
      const tx = x2 - cx, ty = y2 - cy, tl = Math.hypot(tx, ty) || 1, ex = x2 - (tx / tl) * (R + 2), ey = y2 - (ty / tl) * (R + 2)
      const sx0 = cx - x1, sy0 = cy - y1, sl = Math.hypot(sx0, sy0) || 1, sx = x1 + (sx0 / sl) * R, sy = y1 + (sy0 / sl) * R
      const path = `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`
      const ah = 10, ux = tx / tl, uy = ty / tl
      const arrow = `${ex},${ey} ${ex - ux * ah - uy * ah * 0.5},${ey - uy * ah + ux * ah * 0.5} ${ex - ux * ah + uy * ah * 0.5},${ey - uy * ah - ux * ah * 0.5}`
      // weight label 40% along the edge from its tail, so labels of crossing edges do not land on the same spot
      const t = 0.4, mx = (1 - t) ** 2 * sx + 2 * (1 - t) * t * cx + t * t * ex, my = (1 - t) ** 2 * sy + 2 * (1 - t) * t * cy + t * t * ey
      return <g key={i}>
        {focus && <path d={path} fill="none" stroke="#e7f4ff" strokeWidth={sty.w + 5} strokeOpacity={0.35}/>}
        <path d={path} fill="none" stroke={color} strokeWidth={groupC && !st ? 3 : sty.w} strokeDasharray={sty.dash}/>
        {g.directed && <polygon points={arrow} fill={color}/>}
        {g.weighted && <g><rect x={mx - 12 + nx * 9} y={my - 9 + ny * 9} width={24} height={16} rx={4} fill="#0b1420" stroke="#27394d"/><text x={mx + nx * 9} y={my + 3 + ny * 9} fontSize="10" textAnchor="middle" fill={e.w < 0 ? '#ff8b9a' : '#e2c37f'}>{e.w}</text></g>}
      </g>
    })}
    {g.labels.map((l, i) => {
      if (removed === i) return <g key={i} opacity={0.5}><circle cx={g.pos[i][0]} cy={g.pos[i][1]} r={R} fill="none" stroke="#5d738b" strokeDasharray="4 3"/><text x={g.pos[i][0]} y={g.pos[i][1] + 4} fontSize="11" textAnchor="middle" fill="#7890a8">{l}</text></g>
      const vs = f?.vstate?.[i] ?? 'unseen', base = VCOL[vs], gc = f?.comp?.[i] !== undefined && f.comp[i] !== null ? groupColor(f.comp[i]!) : null
      const [x, y] = g.pos[i]
      return <g key={i} onClick={onNode ? () => onNode(i) : undefined} style={onNode ? { cursor: 'pointer' } : undefined} role={onNode ? 'button' : undefined} aria-label={onNode ? `Vertex ${l}` : undefined}>
        {selected === i && <circle cx={x} cy={y} r={R + 6} fill="none" stroke="#e7f4ff" strokeWidth={1.5} strokeDasharray="3 3"/>}
        <circle cx={x} cy={y} r={R} fill={gc ? `${gc}33` : base.fill} stroke={gc && vs !== 'ap' ? gc : base.stroke} strokeWidth={vs === 'active' || vs === 'ap' ? 3.2 : 2}/>
        <text x={x} y={y + 4} fontSize={l.length > 2 ? 9.5 : 12} textAnchor="middle" fill="#f0f8ff" fontWeight={600}>{l}</text>
        {f?.under?.[i] && <g><rect x={x - 26} y={y + R + 4} width={52} height={15} rx={4} fill="#0b1420" opacity={0.85}/><text x={x} y={y + R + 15} fontSize="10" textAnchor="middle" fill={vs === 'ap' ? '#ffc2cb' : '#c9dcef'}>{f.under[i]}</text></g>}
      </g>
    })}
  </svg>
}

export function DSPanel({ ds, out, outLabel }: { ds?: { name: string; items: string[] }; out?: string[]; outLabel?: string }) {
  return <div className="u3-ds">
    {ds && <div><small>{ds.name}</small><div>{ds.items.length ? ds.items.map((x, i) => <span key={i} className={i === 0 ? 'first' : ''}>{x}</span>) : <em>empty</em>}</div></div>}
    {out && <div><small>{outLabel ?? 'Order'}</small><div>{out.length ? out.map((x, i) => <span key={i} className="out">{x}</span>) : <em>—</em>}</div></div>}
  </div>
}