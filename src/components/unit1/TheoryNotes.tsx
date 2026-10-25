import type { ReactNode } from 'react'
import { AlertTriangle, BookOpenCheck, GraduationCap, ListChecks, PenLine, Sigma } from 'lucide-react'

/* Theory notes for Unit I, written against the syllabus:
 * "Introduction to RAM model of computation, asymptotic notations and their significance,
 *  complexity analysis of algorithms, basic introduction to algorithmic paradigms like
 *  divide and conquer, greedy, backtracking, branch and bound." */

type Note = { syllabus: string; intro: string; cards: { icon: 'def' | 'key' | 'math' | 'example' | 'mistake' | 'exam'; title: string; body: ReactNode; wide?: boolean }[] }

const Code = ({ children }: { children: string }) => <pre className="u1-pre">{children}</pre>

const notes: Record<string, Note> = {
  ram: {
    syllabus: 'Introduction to RAM model of computation',
    intro: 'To compare algorithms fairly we need a machine that is simple enough to reason about but close enough to real computers that the answers transfer. The Random Access Machine (RAM) is that agreed-upon machine. Every running-time statement in this course is a statement about it.',
    cards: [
      { icon: 'def', title: 'What the RAM model assumes', body: <ul>
        <li><b>One processor</b> executes instructions one after another, with no parallelism.</li>
        <li><b>Memory</b> is an unbounded array of words. Any word can be read or written by its address in constant time; this is why it is called <i>random access</i>.</li>
        <li>Every <b>primitive operation</b> costs one unit of time.</li>
        <li>A word holds a number of about c·log n bits, enough to index the input, so arithmetic on it is constant time.</li>
      </ul> },
      { icon: 'key', title: 'Primitive operations (cost 1 each)', body: <ul>
        <li>Arithmetic: + − × ÷ mod, and floor/ceiling.</li>
        <li>Comparison: &lt;, ≤, =, and so on.</li>
        <li>Assignment, and reading or writing A[i].</li>
        <li>Control: a branch, a function call or a return.</li>
        <li><b>Not</b> primitive: “sort the array”, “find the maximum”. Library calls cost whatever their own algorithm costs.</li>
      </ul> },
      { icon: 'math', title: 'Running time on the RAM', body: <>
        <p>Let the <b>input size n</b> be the natural measure of input: the number of items for an array, the number of bits for a number, or V and E for a graph. Then:</p>
        <div className="u1-formula">T(n) = Σ (cost of statement i) × (times statement i executes)</div>
        <p>A loop header <code>for i ← 1 to n</code> executes <b>n + 1</b> times: the last test fails and ends the loop.</p>
      </> },
      { icon: 'key', title: 'Best, worst and average case', body: <ul>
        <li><b>Worst case:</b> the maximum T over all inputs of size n. It is a guarantee, and the usual choice.</li>
        <li><b>Best case:</b> the minimum T. It is rarely useful on its own.</li>
        <li><b>Average case:</b> the expected T under an assumed distribution of inputs.</li>
        <li>Linear search for a key that is present and equally likely at every position: best 1, worst n, average (n + 1)/2 comparisons.</li>
      </ul> },
      { icon: 'example', title: 'Worked example: linear search', wide: true, body: <div className="u1-two-col">
        <Code>{`LinearSearch(A, n, key)        cost   worst-case runs
1  for i ← 1 to n               1      n + 1
2      if A[i] = key            1      n
3          return i             1      0
4  return −1                    1      1`}</Code>
        <div><p><b>Worst case</b> (key absent): T(n) = (n + 1) + n + 1 = <b>2n + 2</b>, so Θ(n).</p><p><b>Best case</b> (key at A[1]): one loop test, one comparison and one return: T = <b>3</b>, so Θ(1).</p><p>The same algorithm has two different cost functions. That is why “the complexity of linear search” must always say which case.</p></div>
      </div> },
    ],
  },
  asymptotic: {
    syllabus: 'Asymptotic notations and their significance',
    intro: 'Exact operation counts like 3n² + 8n + 12 depend on the cost model and on small details of the code. What survives across machines and implementations is how fast the count grows as n becomes large. Asymptotic notation is the precise language for that growth.',
    cards: [
      
      { icon: 'math', title: 'Limit test and properties', body: <>
        <div className="u1-formula">L = lim<sub>n→∞</sub> f(n) / g(n)</div>
        <ul>
          <li>L = 0 ⇒ f = o(g), so f = O(g).</li>
          <li>0 &lt; L &lt; ∞ ⇒ f = Θ(g).</li>
          <li>L = ∞ ⇒ f = ω(g), so f = Ω(g).</li>
          <li><b>Theorem:</b> f = Θ(g) ⇔ f = O(g) and f = Ω(g).</li>
          <li><b>Transitivity</b> holds for all five notations. <b>Reflexivity</b> holds for O, Ω and Θ. <b>Symmetry:</b> f = Θ(g) ⇔ g = Θ(f).</li>
          <li><b>Transpose symmetry:</b> f = O(g) ⇔ g = Ω(f).</li>
          <li>Sum rule: O(f) + O(g) = O(max(f, g)).</li>
        </ul>
      </> },
      { icon: 'key', title: 'Growth-rate hierarchy', body: <>
        <div className="u1-formula u1-chain">1 &lt; log log n &lt; log n &lt; √n &lt; n &lt; n log n &lt; n² &lt; n³ &lt; 2ⁿ &lt; n! &lt; nⁿ</div>
        <p>Each function is o() of the next. The base of a logarithm does not matter (log<sub>a</sub> n = log<sub>b</sub> n / log<sub>b</sub> a, a constant factor), but the base of an exponential does: 3ⁿ is not O(2ⁿ).</p>
      </> },
      { icon: 'example', title: 'Worked proof: 3n² + 8n + 12 = Θ(n²)', wide: true, body: <div className="u1-two-col">
        <div>
          <p><b>Upper bound.</b> We want 3n² + 8n + 12 ≤ c₂n². Choose c₂ = 4. This needs 8n + 12 ≤ n², that is n² − 8n − 12 ≥ 0. The positive root is 4 + √28 ≈ 9.29, so the inequality holds for all n ≥ 10.</p>
          <p><b>Lower bound.</b> 3n² + 8n + 12 ≥ 3n² for every n ≥ 1, so c₁ = 3 works.</p>
        </div>
        <div>
          <p><b>Conclusion.</b> With c₁ = 3, c₂ = 4 and n₀ = 10, we have 3n² ≤ f(n) ≤ 4n² for all n ≥ 10, so f(n) = Θ(n²).</p>
          <p>Check at n = 9: f(9) = 327 &gt; 4 · 81 = 324, so n₀ = 10 really is the smallest valid choice for c₂ = 4. The “Prove a bound” lab below computes exactly this.</p>
        </div>
      </div> },
    ],
  },
  complexity: {
    syllabus: 'Complexity analysis of algorithms',
    intro: 'Complexity analysis turns an algorithm into a function of n: the time (number of basic operations) or space (extra memory) it needs. Iterative code becomes a sum; recursive code becomes a recurrence. Both are then simplified to a Θ class.',
    cards: [
      { icon: 'key', title: 'The analysis procedure', body: <ol>
        <li>Fix the <b>input size</b> n.</li>
        <li>Pick the <b>basic operation</b>: the one in the innermost loop that runs most often.</li>
        <li>Check whether its count depends only on n. If it also depends on the input, analyse best, worst and average case separately.</li>
        <li>Write the count as a <b>sum</b> (loops) or a <b>recurrence</b> (recursion).</li>
        <li>Solve it and keep the <b>dominant term</b>.</li>
      </ol> },
      { icon: 'math', title: 'Rules for loops', body: <ul>
        <li>Statements in sequence: <b>add</b>, so the larger term dominates.</li>
        <li>Independent nested loops: <b>multiply</b>, n × n = n².</li>
        <li>Dependent inner loop (j ≤ i): <b>sum</b> it, Σ i = n(n+1)/2 = Θ(n²).</li>
        <li>A loop variable multiplied or divided by a constant each time: <b>Θ(log n)</b> iterations.</li>
        <li>if / else: take the more expensive branch for the worst case.</li>
      </ul> },
      { icon: 'def', title: 'Solving recurrences', wide: true, body: <div className="u1-two-col">
        <div>
          <p><b>Substitution:</b> guess the answer, then prove it by induction.</p>
          <p><b>Recursion tree:</b> draw the calls level by level, add the work on each level, then add up the levels. This is the lab below.</p>
          <p><b>Master theorem</b> for T(n) = a·T(n/b) + f(n) with a ≥ 1 and b &gt; 1. Compare f(n) with n<sup>log<sub>b</sub> a</sup>:</p>
        </div>
        <div className="u1-cases">
          <div><b>Case 1</b> f(n) = O(n<sup>log<sub>b</sub>a − ε</sup>) ⇒ T(n) = Θ(n<sup>log<sub>b</sub>a</sup>). The leaves dominate.</div>
          <div><b>Case 2</b> f(n) = Θ(n<sup>log<sub>b</sub>a</sup>) ⇒ T(n) = Θ(n<sup>log<sub>b</sub>a</sup> log n). Every level costs the same.</div>
          <div><b>Case 3</b> f(n) = Ω(n<sup>log<sub>b</sub>a + ε</sup>) and a·f(n/b) ≤ c·f(n) for some c &lt; 1 ⇒ T(n) = Θ(f(n)). The root dominates.</div>
        </div>
      </div> },
      { icon: 'example', title: 'Worked examples', body: <ul>
        <li><b>Merge sort</b>, T(n) = 2T(n/2) + n: a = 2, b = 2, n<sup>log₂2</sup> = n = f(n). Case 2 gives <b>Θ(n log n)</b>.</li>
        <li><b>Binary search</b>, T(n) = T(n/2) + 1: n<sup>log₂1</sup> = 1 = f(n). Case 2 gives <b>Θ(log n)</b>.</li>
        <li>T(n) = 4T(n/2) + n: n<sup>log₂4</sup> = n² dominates n. Case 1 gives <b>Θ(n²)</b>.</li>
        <li>T(n) = T(n − 1) + n is <i>not</i> a Master-theorem form, because the size is reduced by subtraction. Unrolling it gives Σ i = <b>Θ(n²)</b>.</li>
      </ul> },
      { icon: 'key', title: 'Space complexity', body: <ul>
        <li>Count <b>extra</b> memory beyond the input: arrays, and the recursion stack (stack depth × size of one call frame).</li>
        <li>Merge sort: Θ(n) for the merge buffer plus Θ(log n) of stack.</li>
        <li>Binary search: Θ(log n) when recursive, Θ(1) when iterative.</li>
        <li>An algorithm that runs in place uses Θ(1) extra space.</li>
      </ul> },
    ],
  },
  paradigms: {
    syllabus: 'Basic introduction to algorithmic paradigms like divide and conquer, greedy, backtracking, branch and bound',
    intro: 'An algorithmic paradigm is a general design strategy: a template you can apply to many different problems. Recognising which template fits a problem is often the hardest step. Each paradigm also comes with its own way of proving correctness and its own way of analysing running time.',
    cards: [
      { icon: 'def', title: 'Key terms used by all four', body: <ul>
        <li><b>State-space tree:</b> the tree of all partial solutions; the root is the empty solution and each level fixes one more decision.</li>
        <li><b>Live node:</b> generated, but its children are not all generated yet. <b>E-node:</b> the live node currently being expanded. <b>Dead node:</b> will not be expanded further.</li>
        <li><b>Promising:</b> a partial solution that can still lead to a valid (or better) solution.</li>
        <li><b>Optimal substructure:</b> an optimal solution contains optimal solutions to its subproblems.</li>
      </ul> },
      { icon: 'key', title: 'How the paradigms relate', body: <ul>
        <li>Divide and conquer needs <b>independent</b> subproblems. When subproblems overlap, use dynamic programming instead (Unit IV).</li>
        <li>Greedy commits to one choice and never looks back, so it needs a proof that the choice is safe.</li>
        <li>Backtracking and branch and bound both search a state-space tree. Backtracking prunes on <b>constraints</b> (feasibility); branch and bound prunes on <b>bounds</b> (optimality).</li>
      </ul> },
      { icon: 'exam', title: 'Exam checklist', body: <ul>
        <li>Name the paradigm and give its general template.</li>
        <li>State the property that makes it correct: the combine step, the greedy-choice property, a sound pruning rule or a valid bound.</li>
        <li>Give one classic example with its time complexity.</li>
        <li>For backtracking and branch and bound, draw part of the state-space tree.</li>
      </ul> },
    ],
  },
}

const icons = { def: BookOpenCheck, key: ListChecks, math: Sigma, example: PenLine, mistake: AlertTriangle, exam: GraduationCap }

export function hasUnit1Theory(topic: string) { return topic in notes }

export function Unit1Theory({ topic }: { topic: string }) {
  const n = notes[topic]
  if (!n) return null
  return <section className="panel u1-notes">
    <div className="u1-syllabus"><span>SYLLABUS · UNIT I</span>{n.syllabus}</div>
    <p className="u1-notes-intro">{n.intro}</p>
    <div className="u1-notes-grid">{n.cards.map(c => { const I = icons[c.icon]; return <article key={c.title} className={`u1-note ${c.wide ? 'wide' : ''} k-${c.icon}`}>
      <h4><I size={15}/>{c.title}</h4>
      <div className="u1-note-body">{c.body}</div>
    </article> })}</div>
  </section>
}