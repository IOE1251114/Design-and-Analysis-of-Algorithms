/** Auto-gradable practice problems. Every wrong answer maps to a named misconception,
 *  which is what lets the teacher dashboard say *why* students are stuck, not just that they are. */
export interface Problem {
  id: string
  topic: string
  kind: 'mcq' | 'num'
  prompt: string
  options?: string[]
  /** mcq: index of the correct option. num: the correct number. */
  answer: number
  /** Default misconception label for any wrong answer. */
  tag: string
  /** Optional specific misconception, keyed by option index (mcq) or by the wrong number (num). */
  tags?: Record<string, string>
  hint: string
  explain: string
}

const mcq = (id: string, topic: string, prompt: string, options: string[], answer: number, tag: string, hint: string, explain: string, tags?: Record<string, string>): Problem =>
  ({ id, topic, kind: 'mcq', prompt, options, answer, tag, hint, explain, tags })
const num = (id: string, topic: string, prompt: string, answer: number, tag: string, hint: string, explain: string, tags?: Record<string, string>): Problem =>
  ({ id, topic, kind: 'num', prompt, answer, tag, hint, explain, tags })

export const problems: Problem[] = [
  num('ram-1', 'ram', 'for i in 1..n { for j in 1..n { x ← x + 1 } }. For n = 8, how many times does x ← x + 1 execute?', 64, 'Miscounts loop iterations', 'Multiply outer iterations by inner iterations.', 'Outer loop runs n times, inner runs n times each: n × n = 64.', { '16': 'Adds loop counts instead of multiplying', '8': 'Counts only the outer loop' }),
  mcq('ram-2', 'ram', 'In the RAM model, one assignment x ← a[i] costs:', ['Θ(n), arrays are large', '1 unit (constant)', 'Depends on the value stored', 'Θ(log n)'], 1, 'Misunderstands RAM unit-cost assumption', 'What does the model assume about primitive operations?', 'The RAM model charges constant cost for primitive operations including indexed access.'),
  mcq('asym-1', 'asymptotic', 'f(n) = 3n² + 8n + 12. Which statement is TRUE?', ['f(n) = O(n³) and f(n) = Θ(n²)', 'f(n) = Θ(n³)', 'f(n) = O(n) because 8n dominates', 'Big-O always means worst-case running time'], 0, 'Confuses O with Θ', 'O is an upper bound, Θ is tight.', 'n² dominates, so f is Θ(n²). Since n² ≤ n³ eventually, it is also O(n³), just not tight.', { '1': 'Confuses upper bound with tight bound', '2': 'Drops the dominant term', '3': 'Equates Big-O with worst case' }),
  mcq('asym-2', 'asymptotic', 'Which function grows fastest as n → ∞?', ['n log n', 'n²', '2ⁿ', 'n³'], 2, 'Misranks growth rates', 'Exponentials eventually beat every polynomial.', '2ⁿ outgrows any polynomial, including n³.'),
  num('cx-1', 'complexity', 'for i in 1..n { for j in 1..i { work } }. For n = 10, how many times does work execute?', 55, 'Treats triangular loop as n × n', 'The inner loop runs i times: sum 1 + 2 + … + n.', 'n(n+1)/2 = 10·11/2 = 55.', { '100': 'Treats triangular loop as n × n' }),
  mcq('cx-2', 'complexity', 'Solve T(n) = 2T(n/2) + n.', ['Θ(n)', 'Θ(n log n)', 'Θ(n²)', 'Θ(log n)'], 1, 'Mis-solves a divide-and-conquer recurrence', 'Compare n^(log_b a) with the combine cost n.', 'a=2, b=2, so n^(log₂2) = n matches f(n) = n: Master Theorem case 2 gives Θ(n log n).'),
  mcq('par-1', 'paradigms', 'Whose correctness is typically proved with an exchange argument?', ['Greedy', 'Backtracking', 'Branch and bound', 'Brute-force enumeration'], 0, 'Confuses paradigm proof obligations', 'Think: swap an optimal choice for the greedy one.', 'Greedy proofs usually show an optimal solution can be transformed to include the greedy choice.'),
  num('sort-1', 'sorting', 'Standard bubble sort (no early exit) on 4 elements. How many comparisons?', 6, 'Miscounts comparisons', 'Passes compare 3, 2, then 1 pairs.', 'n(n−1)/2 = 4·3/2 = 6, regardless of the input order.', { '12': 'Counts n² / ignores shrinking passes', '16': 'Counts n² / ignores shrinking passes', '3': 'Counts only one pass' }),
  mcq('sort-2', 'sorting', 'Which is stable and uses O(n) auxiliary space in the standard array version?', ['Selection sort', 'Merge sort', 'Heap sort', 'Bubble sort'], 1, 'Confuses sort stability and space', 'Only one of these needs a temporary merge buffer.', 'Merge sort is stable and needs an O(n) buffer; selection and heap sort are not stable, bubble is stable but in-place.'),
  mcq('tree-1', 'trees', 'Keys 1, 2, 3, 4, 5 are inserted in that order into an unbalanced BST. Height in edges?', ['2', '4', '≈ 2.3 (log₂ 5)', '5'], 1, 'Assumes a BST is always balanced', 'Where does each new, larger key go?', 'Each key becomes the right child of the previous one: a chain of height n − 1 = 4.', { '0': 'Assumes a BST is always balanced', '2': 'Assumes a BST is always balanced', '3': 'Off-by-one: nodes vs edges' }),
  num('hash-1', 'hashing', 'Hash function h(k) = k mod 7. Which bucket holds key 50?', 1, 'Modulo arithmetic slip', '50 = 7·q + r.', '50 = 7·7 + 1, so h(50) = 1.'),
  num('match-1', 'matching', 'KMP: what is the last value of the LPS (prefix) table for pattern "ABABAB"?', 4, 'Misreads the prefix-function definition', 'Longest proper prefix that is also a suffix of the whole pattern.', '"ABAB" is both a prefix and a suffix of "ABABAB" and is the longest proper one, so LPS = 4.', { '6': 'Allows the whole string as its own proper prefix', '2': 'Stops at the first border instead of the longest' }),
  num('rep-1', 'representations', 'A graph has V = 10 vertices. How many cells does its adjacency matrix have?', 100, 'Confuses matrix and list space', 'One cell for every ordered vertex pair.', 'V × V = 100, independent of the number of edges.'),
  mcq('trav-1', 'traversal', 'Which data structure drives BFS?', ['Stack', 'Queue', 'Priority queue', 'Hash set only'], 1, 'Swaps BFS and DFS data structures', 'BFS visits in layers: first in, first out.', 'BFS uses a FIFO queue. DFS uses a stack (or recursion).'),
  mcq('topo-1', 'topological', 'A directed graph contains a cycle. Its topological ordering:', ['Exists and is unique', 'Exists but may not be unique', 'Does not exist', 'Exists only for weighted graphs'], 2, 'Ignores the DAG requirement', 'Can every vertex in a cycle come before the others?', 'Topological orders exist only for DAGs; a cycle makes the required "earlier than" relation contradictory.'),
  mcq('sp-1', 'shortest', "Dijkstra's algorithm can fail when the graph has:", ['Negative edge weights', 'Cycles', 'Several equal-length paths', 'Undirected edges'], 0, "Misses Dijkstra's nonnegative-weight requirement", 'What does Dijkstra assume once a vertex is finalized?', 'Dijkstra assumes finalized distances cannot improve, which negative edges can violate. Use Bellman–Ford.'),
  num('mst-1', 'mst', 'Edges: A–B 1, B–C 2, C–D 3, A–C 4, B–D 5. What is the MST weight?', 6, 'Includes a cycle-forming edge', 'Process edges in sorted order; skip any that close a cycle.', 'Kruskal accepts A–B, B–C, C–D (1+2+3 = 6); A–C and B–D would form cycles.', { '7': 'Includes a cycle-forming edge' }),
  mcq('gr-1', 'greedy', 'Greedy by value/weight ratio is guaranteed optimal for:', ['Fractional knapsack', '0/1 knapsack', 'Both', 'Neither'], 0, 'Applies greedy to 0/1 knapsack', 'Can you take half an item?', 'Fractional items can fill the capacity exactly; with 0/1 items the ratio rule can leave capacity wasted.'),
  num('dp-1', 'dp', '0/1 knapsack, capacity 8, items (weight, value): (2,12) (3,20) (4,24) (5,25). Optimal value?', 45, 'Used a greedy choice instead of DP', 'Try pairs of items whose weights sum to at most 8.', 'Items 2 and 4 (weights 3 + 5 = 8) give 20 + 25 = 45. Greedy by ratio gets only 32.', { '32': 'Used the greedy ratio rule instead of DP', '44': 'Missed the best combination' }),
  mcq('dp-2', 'dp', 'Naive recursive Fibonacci is exponential mainly because:', ['Overlapping subproblems are recomputed', 'Recursion is always exponential', 'Large numbers need big arithmetic', 'It uses a table'], 0, 'Misses overlapping subproblems', 'How many times is fib(3) computed for fib(6)?', 'The same subproblems are solved again and again; memoization or tabulation removes the repetition.'),
  mcq('np-1', 'pnp', 'A polynomial-time verifier for yes-certificates shows that a problem is in:', ['P', 'NP', 'NP-complete', 'NP-hard only'], 1, 'Confuses NP with P / NP-complete', 'Verifying is not the same as solving, or as being hardest.', 'A poly-time verifier is the definition of membership in NP. Completeness also needs NP-hardness.'),
  mcq('red-1', 'reductions', 'To prove problem B is NP-hard, you reduce:', ['B to a known NP-hard problem A', 'A known NP-hard problem A to B', 'B to itself', 'Any problem in P to B'], 1, 'Reverses the reduction direction', 'Which problem must be able to solve the other?', 'Reduce a known-hard A to B (A ≤p B): a fast solver for B would then solve A.'),
  mcq('sat-1', 'sat', 'Assignment A=T, B=T, C=F on (A ∨ ¬B) ∧ (¬A ∨ C) ∧ (B ∨ C):', ['Satisfying', 'Not satisfying: clause 2 is false', 'Not satisfying: clause 1 is false', 'Not satisfying: clause 3 is false'], 1, 'Mis-evaluates a clause', 'Evaluate each clause separately.', 'Clause 1 = T, clause 2 = (F ∨ F) = F, clause 3 = T. One false clause makes the formula false.'),
  num('tsp-1', 'tsp', 'TSP with 5 cities and a fixed start city. How many distinct directed tours exist?', 24, 'Uses n! instead of (n−1)!', 'Fix the start, then order the remaining cities.', '(n − 1)! = 4! = 24.', { '120': 'Forgets to fix the starting city' }),
]

export const problemsFor = (topic: string) => problems.filter(p => p.topic === topic)

export function grade(p: Problem, given: string): { correct: boolean; misconception?: string } {
  const value = Number(given)
  if (value === p.answer) return { correct: true }
  return { correct: false, misconception: p.tags?.[String(value)] ?? p.tag }
}
