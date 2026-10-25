import { Code, NotesPanel, type Note } from "../unit1/TheoryNotes";

/* Theory notes for Unit IV, written against the syllabus:
 * "Greedy algorithms: elements of greedy strategy, MST — Prim and Kruskal, Dijkstra using arrays and heaps,
 *  fractional knapsack, Huffman coding using priority queue.
 *  Dynamic programming: binomial coefficient, matrix chain multiplication, LCS, 0-1 knapsack." */

const greedyElements = {
  icon: "def" as const,
  title: "Elements of the greedy strategy",
  body: (
    <ul>
      <li>
        <b>Greedy-choice property:</b> a globally optimal solution can be
        reached by making the locally best choice at each step, without
        reconsidering it later.
      </li>
      <li>
        <b>Optimal substructure:</b> after the greedy choice, what remains is a
        smaller instance of the same problem, and an optimal answer to it
        combines with the choice to give an optimal whole.
      </li>
      <li>
        Proof pattern (<b>exchange argument</b>): take any optimal solution,
        swap in the greedy choice, and show the result is no worse.
      </li>
    </ul>
  ),
};

const dpElements = {
  icon: "def" as const,
  title: "Elements of dynamic programming",
  body: (
    <ul>
      <li>
        <b>Optimal substructure:</b> an optimal solution contains optimal
        solutions to sub-problems.
      </li>
      <li>
        <b>Overlapping subproblems:</b> the plain recursion solves the same
        sub-problems many times.
      </li>
      <li>
        <b>Recipe:</b> (1) describe the structure of an optimal solution, (2)
        write the recurrence, (3) compute values bottom-up (tabulation) or
        top-down with a cache (memoisation), (4) rebuild the solution from
        stored choices.
      </li>
    </ul>
  ),
};

const notes: Record<string, Note> = {
  mst: {
    syllabus:
      "Elements of greedy strategy · Minimum spanning tree: Prim’s and Kruskal’s algorithms",
    intro:
      "A spanning tree of a connected, undirected, weighted graph is a set of V − 1 edges that connects every vertex with no cycle. A minimum spanning tree (MST) is one with the smallest total weight. Networks such as cables, roads and pipelines are designed with it. Both standard algorithms are greedy and both rely on the same fact, the cut property.",
    cards: [
      greedyElements,
      {
        icon: "key",
        title: "Cut property (why both are correct)",
        body: (
          <ul>
            <li>
              A <b>cut</b> (S, V − S) splits the vertices into two groups. An
              edge <b>crosses</b> the cut if its ends lie in different groups.
            </li>
            <li>
              If A is part of some MST and no edge of A crosses the cut, then
              the <b>lightest crossing edge</b> is safe: A plus that edge is
              still part of some MST.
            </li>
            <li>
              Cycle property: the heaviest edge on any cycle is not needed in an
              MST (ties aside).
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Kruskal",
        wide: true,
        body: (
          <Code>{`KRUSKAL(G):
  A = ∅
  for each vertex v: MAKE-SET(v)
  sort E by weight, ascending
  for each edge (u, v) in that order:
      if FIND-SET(u) ≠ FIND-SET(v):     // different trees → no cycle
          A = A ∪ {(u, v)}
          UNION(u, v)
  return A`}</Code>
        ),
      },
      {
        icon: "example",
        title: "Prim",
        wide: true,
        body: (
          <Code>{`PRIM(G, r):
  for each v: key[v] = ∞, π[v] = NIL
  key[r] = 0;  Q = all vertices (min-priority queue on key)
  while Q ≠ ∅:
      u = EXTRACT-MIN(Q)               // lightest edge leaving the tree
      for each v adjacent to u:
          if v ∈ Q and w(u, v) < key[v]:
              π[v] = u;  key[v] = w(u, v)   // DECREASE-KEY`}</Code>
        ),
      },
      {
        icon: "math",
        title: "Running times",
        body: (
          <ul>
            <li>
              Kruskal: sorting O(E log E) = O(E log V); union-find with union by
              rank and path compression is almost O(1) per operation. Total{" "}
              <b>O(E log V)</b>.
            </li>
            <li>
              Prim with a binary heap: V extract-min and up to E decrease-key
              operations, each O(log V): <b>O(E log V)</b>.
            </li>
            <li>
              Prim with an array (or adjacency matrix): <b>O(V²)</b>, which is
              better for dense graphs.
            </li>
          </ul>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Kruskal: adding an edge whose ends are already in the same set.
              That makes a cycle.
            </li>
            <li>
              Prim: confusing key[v] (the lightest edge to the tree) with a
              distance from the start, as in Dijkstra.
            </li>
            <li>
              Thinking the MST is unique. Only its weight is unique; with equal
              weights several trees can be optimal.
            </li>
            <li>
              An MST does <b>not</b> give shortest paths between vertices.
            </li>
          </ul>
        ),
      },
    ],
  },
  dijkstra: {
    syllabus: "Dijkstra’s algorithm using arrays and heaps",
    intro:
      "Dijkstra finds single-source shortest paths when every edge weight is non-negative. It is greedy: it repeatedly settles the unsettled vertex with the smallest tentative distance, and that distance never changes again. The algorithm is the same whatever priority queue is used, but the queue decides the running time.",
    cards: [
      {
        icon: "key",
        title: "The greedy choice",
        body: (
          <ul>
            <li>
              Keep d[v], an upper bound on the true distance δ(s, v). Start with
              d[s] = 0 and d[v] = ∞ for every other v.
            </li>
            <li>
              Extract the unsettled u with the minimum d[u] and <b>relax</b>{" "}
              each edge (u, v): if d[u] + w(u, v) &lt; d[v], lower d[v].
            </li>
            <li>
              Why it is safe: with no negative edges, any other route to u must
              leave the settled set through some vertex whose d is already ≥
              d[u], so it cannot be shorter.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Pseudocode",
        wide: true,
        body: (
          <Code>{`DIJKSTRA(G, w, s):
  for each v: d[v] = ∞, π[v] = NIL
  d[s] = 0;  S = ∅;  Q = V              // priority queue keyed by d
  while Q ≠ ∅:
      u = EXTRACT-MIN(Q);  S = S ∪ {u}
      for each v adjacent to u:
          if d[u] + w(u, v) < d[v]:
              d[v] = d[u] + w(u, v);  π[v] = u     // DECREASE-KEY(Q, v)`}</Code>
        ),
      },
      {
        icon: "math",
        title: "Array vs binary heap",
        body: (
          <ul>
            <li>
              <b>Array:</b> extract-min scans all V entries, Θ(V), done V times;
              decrease-key is Θ(1). Total <b>Θ(V² + E) = Θ(V²)</b>.
            </li>
            <li>
              <b>Binary heap:</b> extract-min O(log V), decrease-key O(log V) (a
              position map finds the vertex in the heap). Total{" "}
              <b>O((V + E) log V)</b>.
            </li>
            <li>Fibonacci heap (for reference): O(E + V log V).</li>
            <li>
              Rule of thumb: heap for sparse graphs (E ≪ V²/log V), array for
              dense ones.
            </li>
          </ul>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Using Dijkstra with negative edge weights. Use Bellman–Ford there.
            </li>
            <li>
              Saying the heap version is always faster. On a complete graph
              E·log V exceeds V².
            </li>
            <li>
              Forgetting the position map: without it a heap cannot find a
              vertex to decrease its key in O(log V).
            </li>
          </ul>
        ),
      },
    ],
  },
  greedy: {
    syllabus: "Fractional knapsack problem",
    intro:
      "A knapsack holds at most W kilograms. Item i weighs wᵢ and is worth vᵢ. In the fractional version you may take any fraction xᵢ ∈ [0, 1] of each item, so the goal is to maximise Σ xᵢvᵢ subject to Σ xᵢwᵢ ≤ W. Sorting by value per unit weight and filling greedily is optimal.",
    cards: [
      greedyElements,
      {
        icon: "example",
        title: "Algorithm",
        wide: true,
        body: (
          <Code>{`FRACTIONAL-KNAPSACK(v, w, W):
  sort items by vᵢ / wᵢ, descending
  room = W;  value = 0
  for each item i in that order:
      if room = 0: break
      x = min(1, room / wᵢ)        // whole item, or the part that fits
      value = value + x · vᵢ
      room  = room  − x · wᵢ
  return value`}</Code>
        ),
      },
      {
        icon: "math",
        title: "Proof idea and cost",
        body: (
          <ul>
            <li>
              <b>Exchange argument:</b> if an optimal load holds some
              lower-ratio material while higher-ratio material is left out, swap
              equal weights of the two. The value cannot drop, so the greedy
              load is optimal.
            </li>
            <li>
              At most one item is taken partially: the last one considered.
            </li>
            <li>
              Time: <b>O(n log n)</b> for the sort, then O(n). With a
              linear-time selection the sort can be avoided: O(n).
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Worked example",
        body: (
          <ul>
            <li>
              W = 50; items (10, 60), (20, 100), (30, 120). Ratios: 6, 5, 4.
            </li>
            <li>
              Take item 1 (60) and item 2 (100); room 20 left; take 20/30 of
              item 3 (80).
            </li>
            <li>
              Total <b>240</b>. In the 0/1 version the best is 220 (items 2 and
              3), and greedy-by-ratio gives only 160.
            </li>
          </ul>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Sorting by value or by weight alone. Neither is guaranteed
              optimal.
            </li>
            <li>
              Applying the same greedy rule to the 0/1 problem. It can fail; use
              DP instead.
            </li>
          </ul>
        ),
      },
    ],
  },
  huffman: {
    syllabus: "Huffman coding using priority queue",
    intro:
      "A binary code gives each character a string of bits. A fixed-length code uses ⌈log₂ n⌉ bits per character. A variable-length code can do better by giving frequent characters short codes, provided it is prefix-free (no code is the beginning of another), so decoding is never ambiguous. Huffman’s greedy algorithm builds an optimal prefix-free code.",
    cards: [
      {
        icon: "def",
        title: "Prefix codes as binary trees",
        body: (
          <ul>
            <li>
              Each character is a leaf; the path from the root spells its code
              (left = 0, right = 1).
            </li>
            <li>
              Cost of a tree T: <b>B(T) = Σ f(c) · d(c)</b>, where d(c) is the
              depth of leaf c (its code length).
            </li>
            <li>
              An optimal tree is always <b>full</b>: every internal node has two
              children.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Algorithm (min-priority queue)",
        wide: true,
        body: (
          <Code>{`HUFFMAN(C):                       // C = characters with frequencies
  Q = MIN-PRIORITY-QUEUE(C)        // keyed by frequency
  for i = 1 to |C| − 1:
      x = EXTRACT-MIN(Q)
      y = EXTRACT-MIN(Q)
      z = new node;  z.left = x;  z.right = y
      z.freq = x.freq + y.freq
      INSERT(Q, z)
  return EXTRACT-MIN(Q)            // root of the code tree`}</Code>
        ),
      },
      {
        icon: "math",
        title: "Why greedy is safe, and the cost",
        body: (
          <ul>
            <li>
              <b>Greedy choice:</b> the two least frequent characters can be
              made sibling leaves at the deepest level of some optimal tree
              (exchange argument).
            </li>
            <li>
              <b>Substructure:</b> merging them into one character of frequency
              x + y leaves a smaller problem whose optimal tree extends to an
              optimal tree for C.
            </li>
            <li>
              n − 1 iterations, each O(log n) with a binary heap:{" "}
              <b>O(n log n)</b>.
            </li>
            <li>
              Average code length is between the entropy H and H + 1 bits per
              symbol.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Worked example",
        body: (
          <ul>
            <li>a:45, b:13, c:12, d:16, e:9, f:5 (thousands of characters).</li>
            <li>
              Codes: a = 0, b = 101, c = 100, d = 111, e = 1101, f = 1100.
            </li>
            <li>
              Cost 224 thousand bits, against 300 thousand with a 3-bit fixed
              code: about 25% saved.
            </li>
          </ul>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Merging the two <b>largest</b> frequencies, or merging a new node
              with the next leaf without re-checking the queue.
            </li>
            <li>
              Thinking the code is unique. Ties and left/right choices give
              different codes with the same total cost.
            </li>
          </ul>
        ),
      },
    ],
  },
  binomial: {
    syllabus: "Dynamic programming: computing a binomial coefficient",
    intro:
      "C(n, k) is the number of k-element subsets of an n-element set. It is the simplest example of why dynamic programming pays off: the defining recurrence is short, but evaluating it recursively repeats exponentially much work, while a table of Θ(nk) entries does it all once.",
    cards: [
      dpElements,
      {
        icon: "key",
        title: "Recurrence",
        body: (
          <ul>
            <li>C(n, 0) = C(n, n) = 1.</li>
            <li>
              C(n, k) = C(n − 1, k − 1) + C(n − 1, k) for 0 &lt; k &lt; n.
            </li>
            <li>
              Reason: item n is either in the subset (choose k − 1 from the
              rest) or not (choose k from the rest).
            </li>
            <li>The table of values is Pascal’s triangle.</li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Bottom-up algorithm",
        wide: true,
        body: (
          <Code>{`BINOMIAL(n, k):
  for i = 0 to n:
      for j = 0 to min(i, k):
          if j = 0 or j = i: C[i][j] = 1
          else: C[i][j] = C[i−1][j−1] + C[i−1][j]
  return C[n][k]`}</Code>
        ),
      },
      {
        icon: "math",
        title: "Costs",
        body: (
          <ul>
            <li>
              Plain recursion: exactly 2·C(n, k) − 1 calls, which is exponential
              (C(2m, m) ≈ 4ᵐ/√(πm)).
            </li>
            <li>
              Tabulation: <b>Θ(nk)</b> additions and Θ(nk) space.
            </li>
            <li>
              Space can be cut to <b>O(k)</b> by keeping one row and updating it
              from right to left.
            </li>
          </ul>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Computing n!/(k!(n − k)!) directly: the factorials overflow long
              before the answer does.
            </li>
            <li>
              Updating the single-row version left to right, which overwrites
              values still needed.
            </li>
          </ul>
        ),
      },
    ],
  },
  matrixchain: {
    syllabus: "Matrix chain multiplication",
    intro:
      "Given matrices A₁, A₂, …, Aₙ where Aᵢ is p(i−1) × p(i), choose the bracketing of the product A₁A₂⋯Aₙ that needs the fewest scalar multiplications. Matrix multiplication is associative, so every bracketing gives the same matrix, but the costs can differ by orders of magnitude.",
    cards: [
      dpElements,
      {
        icon: "key",
        title: "Recurrence",
        body: (
          <ul>
            <li>
              Multiplying a p × q matrix by a q × r matrix costs <b>p·q·r</b>.
            </li>
            <li>m[i][i] = 0.</li>
            <li>
              m[i][j] = min over i ≤ k &lt; j of ( m[i][k] + m[k+1][j] +
              p(i−1)·p(k)·p(j) ).
            </li>
            <li>
              s[i][j] records the best k, so the bracketing can be printed
              afterwards.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Algorithm",
        wide: true,
        body: (
          <Code>{`MATRIX-CHAIN-ORDER(p):            // n = p.length − 1
  for i = 1 to n: m[i][i] = 0
  for len = 2 to n:                 // chain length
      for i = 1 to n − len + 1:
          j = i + len − 1;  m[i][j] = ∞
          for k = i to j − 1:
              q = m[i][k] + m[k+1][j] + p[i−1]·p[k]·p[j]
              if q < m[i][j]: m[i][j] = q;  s[i][j] = k

PRINT(s, i, j):
  if i = j: print "A"i
  else: print "(";  PRINT(s, i, s[i][j]);  PRINT(s, s[i][j]+1, j);  print ")"`}</Code>
        ),
      },
      {
        icon: "math",
        title: "Costs",
        body: (
          <ul>
            <li>
              Number of bracketings: the Catalan number C(n − 1) = Ω(4ⁿ /
              n^1.5). Trying them all is hopeless.
            </li>
            <li>
              DP: Θ(n²) cells, each trying O(n) splits: <b>Θ(n³)</b> time,{" "}
              <b>Θ(n²)</b> space.
            </li>
            <li>
              Textbook example p = (30, 35, 15, 5, 10, 20, 25): optimum{" "}
              <b>15,125</b> with ((A₁(A₂A₃))((A₄A₅)A₆)).
            </li>
          </ul>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Filling the table row by row: m[i][j] needs shorter chains first,
              so fill by chain length (diagonal by diagonal).
            </li>
            <li>Using p(i)·p(k)·p(j) instead of p(i−1)·p(k)·p(j).</li>
            <li>
              Thinking DP multiplies the matrices. It only chooses the order.
            </li>
          </ul>
        ),
      },
    ],
  },
  lcs: {
    syllabus: "Longest common subsequence",
    intro:
      "A subsequence of X is what remains after deleting zero or more characters, keeping the order. Given X = x₁…xₘ and Y = y₁…yₙ, the LCS problem asks for a longest sequence that is a subsequence of both. There are 2ᵐ subsequences of X, so brute force is exponential; DP solves it in Θ(mn).",
    cards: [
      dpElements,
      {
        icon: "key",
        title: "Recurrence",
        body: (
          <ul>
            <li>c[i][j] = LCS length of the prefixes Xᵢ and Yⱼ.</li>
            <li>c[i][j] = 0 if i = 0 or j = 0.</li>
            <li>c[i][j] = c[i−1][j−1] + 1 if xᵢ = yⱼ.</li>
            <li>c[i][j] = max(c[i−1][j], c[i][j−1]) otherwise.</li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Algorithm",
        wide: true,
        body: (
          <Code>{`LCS-LENGTH(X, Y):
  for i = 0 to m: c[i][0] = 0
  for j = 0 to n: c[0][j] = 0
  for i = 1 to m:
      for j = 1 to n:
          if X[i] = Y[j]:              c[i][j] = c[i−1][j−1] + 1;  b[i][j] = "↖"
          elif c[i−1][j] ≥ c[i][j−1]:  c[i][j] = c[i−1][j];       b[i][j] = "↑"
          else:                         c[i][j] = c[i][j−1];       b[i][j] = "←"

PRINT-LCS(b, X, i, j):
  if i = 0 or j = 0: return
  if b[i][j] = "↖": PRINT-LCS(b, X, i−1, j−1);  print X[i]
  elif b[i][j] = "↑": PRINT-LCS(b, X, i−1, j)
  else: PRINT-LCS(b, X, i, j−1)`}</Code>
        ),
      },
      {
        icon: "math",
        title: "Costs and an example",
        body: (
          <ul>
            <li>
              Filling: <b>Θ(mn)</b> time and space. Trace-back: O(m + n).
            </li>
            <li>For the length alone, two rows suffice: O(min(m, n)) space.</li>
            <li>
              X = ABCBDAB, Y = BDCABA: LCS length 4, for example <b>BCBA</b>.
            </li>
          </ul>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Confusing subsequence with substring: a substring must be
              contiguous.
            </li>
            <li>
              Following ↑ or ← and still printing the character. Only ↖ adds
              one.
            </li>
          </ul>
        ),
      },
    ],
  },
  dp: {
    syllabus: "0-1 knapsack problem",
    intro:
      "The same knapsack as before, but each item must be taken whole or left (xᵢ ∈ {0, 1}). Greedy no longer works, because a high-ratio item can leave capacity unused that a better combination would fill. Dynamic programming tries both choices for every item at every capacity.",
    cards: [
      dpElements,
      {
        icon: "key",
        title: "Recurrence",
        body: (
          <ul>
            <li>K[i][w] = best value using items 1…i with capacity w.</li>
            <li>K[0][w] = 0.</li>
            <li>K[i][w] = K[i−1][w] if wᵢ &gt; w (item i does not fit).</li>
            <li>K[i][w] = max(K[i−1][w], vᵢ + K[i−1][w − wᵢ]) otherwise.</li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Algorithm",
        wide: true,
        body: (
          <Code>{`KNAPSACK-01(v, w, n, W):
  for c = 0 to W: K[0][c] = 0
  for i = 1 to n:
      for c = 0 to W:
          K[i][c] = K[i−1][c]                          // skip item i
          if w[i] ≤ c:
              K[i][c] = max(K[i][c], v[i] + K[i−1][c − w[i]])   // take it
  // trace back
  c = W
  for i = n downto 1:
      if K[i][c] ≠ K[i−1][c]: take item i;  c = c − w[i]`}</Code>
        ),
      },
      {
        icon: "math",
        title: "Costs",
        body: (
          <ul>
            <li>
              <b>Θ(nW)</b> time and space; O(W) space with one row updated from
              right to left.
            </li>
            <li>
              This is <b>pseudo-polynomial</b>: W needs only log W bits to
              write, so Θ(nW) is exponential in the input length. 0/1 knapsack
              is NP-hard (Unit V).
            </li>
            <li>Brute force checks all 2ⁿ subsets.</li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Worked example",
        body: (
          <ul>
            <li>W = 8; items (w, v): (2, 12), (3, 20), (4, 24), (5, 25).</li>
            <li>
              DP optimum <b>45</b>: items 2 and 4 (weight 8).
            </li>
            <li>
              Greedy by ratio takes items 2 and 1 (value 32) and then nothing
              else fits.
            </li>
          </ul>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Updating a single row from left to right: that lets an item be
              taken twice (that is the unbounded knapsack).
            </li>
            <li>Calling Θ(nW) polynomial.</li>
          </ul>
        ),
      },
    ],
  },
};

export function hasUnit4Theory(topic: string) {
  return topic in notes;
}
/** The notes grid has three columns: put the first three short cards in one row, then the full-width code cards, then the rest. */
const tidy = (n: Note): Note => {
  const narrow = n.cards.filter((c) => !c.wide),
    wide = n.cards.filter((c) => c.wide);
  return { ...n, cards: [...narrow.slice(0, 3), ...wide, ...narrow.slice(3)] };
};
export function Unit4Theory({ topic }: { topic: string }) {
  const n = notes[topic];
  return n ? <NotesPanel note={tidy(n)} unit="IV" /> : null;
}
