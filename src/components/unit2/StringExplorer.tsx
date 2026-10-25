import { useMemo, useState } from 'react'
import { CircleHelp, Search } from 'lucide-react'
import { bmTables, lpsTable, matchTrace, type MatchAlgo } from '../../domain/unit2/strings'
import { PlayerBar, Tabs, usePlayer } from '../unit1/shared'

const presets = [
  { label: 'Textbook', text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' },
  { label: 'English text', text: 'HERE IS A SIMPLE EXAMPLE', pattern: 'EXAMPLE' },
  { label: 'Repetitive', text: 'AAAAAAAAAAAAAAAAAAAB', pattern: 'AAAAB' },
  { label: 'Several matches', text: 'ABCABCABCABD', pattern: 'ABC' },
]
const names: Record<MatchAlgo, string> = { naive: 'Naive', kmp: 'Knuth–Morris–Pratt', bm: 'Boyer–Moore' }

export function StringExplorer({ onSteps }: { onSteps?: (k: number) => void }) {
  const [algo, setAlgo] = useState<MatchAlgo>('kmp')
  const [text, setText] = useState(presets[0].text)
  const [pattern, setPattern] = useState(presets[0].pattern)
  const T = text.slice(0, 40), P = pattern.slice(0, 12)
  const run = useMemo(() => matchTrace(algo, T, P), [algo, T, P])
  const counts = useMemo(() => (['naive', 'kmp', 'bm'] as MatchAlgo[]).map(a => ({ a, c: matchTrace(a, T, P, false).comparisons })), [T, P])
  const p = usePlayer(run.frames.length, `${algo}-${T}-${P}`, onSteps)
  const f = run.frames[p.step]
  const mark = new Map(f.marks.map(x => [x.p, x.ok]))
  const maxC = Math.max(...counts.map(c => c.c), 1)
  return <section className="panel">
    <div className="panel-heading"><div><span className="kicker">STRING MATCHING</span><h2>Slide the pattern along the text</h2><p>Green cells matched, the rose cell is the mismatch, and the gold outline is the character being compared now. The interesting part is how far each algorithm is allowed to slide after a mismatch.</p></div><span className="panel-icon"><Search size={19}/></span></div>
    <Tabs value={algo} onChange={setAlgo} options={(['naive', 'kmp', 'bm'] as MatchAlgo[]).map(a => ({ id: a, label: names[a] }))}/>
    <div className="u2-input">
      <label>Text (up to 40)<input value={text} onChange={e => setText(e.target.value.toUpperCase())}/></label>
      <label>Pattern (up to 12)<input value={pattern} onChange={e => setPattern(e.target.value.toUpperCase())}/></label>
      <div className="u2-presets">{presets.map(pr => <button key={pr.label} className="btn btn-secondary" onClick={() => { setText(pr.text); setPattern(pr.pattern) }}>{pr.label}</button>)}</div>
    </div>
    <div className="u2-align">
      <div className="u2-strip"><small>TEXT</small><div>{T.split('').map((c, i) => { const inWin = i >= f.s && i < f.s + P.length, ok = inWin ? mark.get(i - f.s) : undefined, matched = run.frames[p.step].matches.some(m => i >= m && i < m + P.length)
        return <span key={i} className={`${ok === true ? 'ok' : ok === false ? 'bad' : ''} ${inWin ? 'win' : ''} ${f.j !== null && i === f.s + f.j ? 'cur' : ''} ${matched && ok === undefined ? 'was' : ''}`}><b>{c === ' ' ? '␣' : c}</b><i>{i}</i></span> })}</div></div>
      <div className="u2-strip"><small>PATTERN AT SHIFT {f.s}</small><div>{Array.from({ length: f.s }, (_, i) => <span key={`g${i}`} className="gap"/>)}{P.split('').map((c, j) => { const ok = mark.get(j); return <span key={j} className={`${ok === true ? 'ok' : ok === false ? 'bad' : ''} ${f.j === j ? 'cur' : ''}`}><b>{c === ' ' ? '␣' : c}</b><i>{j}</i></span> })}</div></div>
    </div>
    <div className={`stage-explanation ${f.status === 'found' ? 'u2-good' : ''}`}><strong>{f.title}{f.shift ? ` → next shift ${f.s + f.shift}` : ''}</strong><p>{f.text}</p></div>
    <PlayerBar p={p}/>
    <div className="u2-stats">
      <div><small>COMPARISONS SO FAR</small><strong>{f.comparisons}</strong></div>
      <div><small>MATCHES FOUND</small><strong>{f.matches.length ? f.matches.join(', ') : '—'}</strong><span>starting indices</span></div>
      <div><small>TIME</small><strong className="u2-mono">{algo === 'naive' ? 'O((n − m + 1)·m)' : algo === 'kmp' ? 'Θ(n + m)' : 'O(n·m) worst, often sublinear'}</strong></div>
    </div>
    {algo === 'kmp' && <KmpTable P={P} onSteps={onSteps}/>}
    {algo === 'bm' && <BmTables P={P}/>}
    <span className="u1-label">CHARACTER COMPARISONS ON THIS INPUT (n = {T.length}, m = {P.length})</span>
    <div className="u1-strat-bars">{counts.map(c => <div key={c.a} className={c.a === algo ? 'on' : ''}><span>{names[c.a]}</span><i><b style={{ width: `${(c.c / maxC) * 100}%` }}/></i><em>{c.c} comparisons</em></div>)}</div>
    <div className="callout"><CircleHelp size={16}/><p>Try the presets. On “Repetitive” the naive method re-reads the same text characters again and again, while KMP never moves backwards in the text. On “English text” Boyer–Moore compares from the right end and can jump a whole pattern length when the text character does not occur in the pattern at all.</p></div>
  </section>
}

function KmpTable({ P, onSteps }: { P: string; onSteps?: (k: number) => void }) {
  const { lps, frames } = useMemo(() => lpsTable(P), [P])
  const p = usePlayer(Math.max(1, frames.length), P, onSteps)
  const f = frames[p.step]
  return <div className="u2-pre">
    <strong>Preprocessing: the prefix function (lps / failure table)</strong>
    <p className="u1-small" style={{ marginTop: 4 }}>lps[i] is the length of the longest proper prefix of P[0…i] that is also a suffix of it. After a mismatch at P[j], KMP continues from j = lps[j − 1] instead of starting over.</p>
    <div className="u2-lps"><div><small>i</small>{P.split('').map((_, i) => <span key={i} className={f?.i === i ? 'cur' : ''}>{i}</span>)}</div><div><small>P[i]</small>{P.split('').map((c, i) => <span key={i} className={f?.i === i ? 'cur' : ''}>{c}</span>)}</div><div><small>lps[i]</small>{(f ? f.lps : lps).map((v, i) => <span key={i} className={`${f?.i === i ? 'cur' : ''} val`}>{f && i > f.i ? '' : v}</span>)}</div></div>
    {f ? <><p className="u1-small">{f.text}</p><PlayerBar p={p} label={`lps step ${p.step + 1} / ${frames.length}`}/></> : <p className="u1-small">A one-character pattern has lps = [0].</p>}
  </div>
}

function BmTables({ P }: { P: string }) {
  const { last, gs } = useMemo(() => bmTables(P), [P])
  return <div className="u2-pre">
    <strong>Preprocessing: Boyer–Moore's two shift rules</strong>
    <div className="u2-bm">
      <div><small>BAD-CHARACTER TABLE: rightmost index of each character in P</small><div className="u2-lps"><div>{Object.entries(last).map(([c, i]) => <span key={c} className="val">{c === ' ' ? '␣' : c}<br/>{i}</span>)}<span className="val">other<br/>−1</span></div></div>
        <p className="u1-small">On a mismatch at P[j] against text character c, shift by j − last[c]. This lines up the rightmost c in the pattern, or jumps past c entirely if it is not in the pattern.</p></div>
      <div><small>GOOD-SUFFIX SHIFT gs[j]: shift when P[j…m−1] matched and P[j−1] did not</small><div className="u2-lps"><div><small>j</small>{gs.map((_, j) => <span key={j}>{j}</span>)}</div><div><small>gs</small>{gs.map((v, j) => <span key={j} className="val">{v}</span>)}</div></div>
        <p className="u1-small">It slides the pattern so that the part that already matched lines up with another occurrence of it (or with a prefix of the pattern). Boyer–Moore takes the larger of the two shifts.</p></div>
    </div>
  </div>
}