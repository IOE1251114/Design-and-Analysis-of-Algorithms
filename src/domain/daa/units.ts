/** Design & Analysis of Algorithms: units, topics and topic summaries. */
import type { Unit } from "../course";

export const daaUnits: Unit[] = [
  {
    id: "u1",
    number: "01",
    title: "Algorithm analysis",
    short: "Foundations",
    description:
      "Model computation, count operations, and justify asymptotic bounds.",
    topics: [
      {
        id: "ram",
        title: "RAM model",
        subtitle: "Primitive operations & memory",
        description:
          "Treat basic operations as unit-cost steps, then make the assumptions behind a count explicit.",
        complexity: "Cost model",
        tags: ["unit-cost assumptions", "operation count"],
      },
      {
        id: "asymptotic",
        title: "Asymptotic notation",
        subtitle: "Compare growth rates",
        description:
          "Compare upper, lower, and tight bounds without confusing them with best-, average-, and worst-case inputs.",
        complexity: "O · Ω · Θ",
        tags: ["growth", "bounds"],
      },
      {
        id: "complexity",
        title: "Complexity analysis",
        subtitle: "Trace → count → derive",
        description:
          "Translate loop and recursion structure into a count, then keep the dominant term.",
        complexity: "T(n), S(n)",
        tags: ["loops", "recurrences"],
      },
      {
        id: "paradigms",
        title: "Algorithmic paradigms",
        subtitle: "Choose a strategy",
        description:
          "Understand the proof obligations behind divide and conquer, greedy, backtracking, and branch and bound.",
        complexity: "Strategy",
        tags: ["design", "correctness"],
      },
    ],
  },
  {
    id: "u2",
    number: "02",
    title: "Searching & sorting",
    short: "Data structures",
    description:
      "Sorting with worst- and average-case analysis, linear-time sorts, balanced search trees, heaps, hashing and string matching.",
    topics: [
      {
        id: "sorting",
        title: "Comparison sorting",
        subtitle: "Quick · merge · heap sort",
        description:
          "Step through quick, merge and heap sort, then compare their worst- and average-case behaviour using real comparison counts.",
        complexity: "Θ(n log n) avg · quick sort Θ(n²) worst",
        tags: [
          "quick sort",
          "merge sort",
          "heap sort",
          "worst vs average case",
        ],
      },
      {
        id: "linear",
        title: "Linear-time sorting",
        subtitle: "Counting · radix · bucket sort",
        description:
          "Sort without comparing keys, and see why comparison sorts can never beat Ω(n log n).",
        complexity: "Θ(n + k)",
        tags: ["counting sort", "radix sort", "bucket sort", "lower bound"],
      },
      {
        id: "trees",
        title: "Search trees",
        subtitle: "BST · AVL · red-black · B-tree",
        description:
          "Insert, search and delete step by step, and watch rotations, recolourings and node splits keep the tree balanced.",
        complexity: "O(log n) when balanced",
        tags: ["BST property", "rotation", "black-height", "node split"],
      },
      {
        id: "heaps",
        title: "Heaps & priority queues",
        subtitle: "Insert · extract · build-heap",
        description:
          "Run priority-queue operations on a binary heap and see the tree and its array change together.",
        complexity: "O(log n) per operation · build Θ(n)",
        tags: ["heap property", "sift up / down", "priority queue"],
      },
      {
        id: "hashing",
        title: "Hashing",
        subtitle: "Chaining & open addressing",
        description:
          "Hash keys into a table, resolve collisions four different ways and watch the load factor drive the cost.",
        complexity: "Expected Θ(1 + α)",
        tags: ["hash function", "collisions", "load factor", "probing"],
      },
      {
        id: "matching",
        title: "String matching",
        subtitle: "KMP & Boyer–Moore",
        description:
          "Slide a pattern along a text and see how preprocessing decides how far each mismatch lets you jump.",
        complexity: "KMP Θ(n + m)",
        tags: ["prefix function", "bad character", "good suffix"],
      },
    ],
  },
  {
    id: "u3",
    number: "03",
    title: "Graph algorithms",
    short: "Graph traversal",
    description:
      "Graph representations, BFS and DFS, and their applications: components, topological sorting, biconnectivity and shortest paths.",
    topics: [
      {
        id: "representations",
        title: "Representations",
        subtitle: "Adjacency matrix · list · edge list",
        description:
          "Store one graph three ways, edit it, and compare space and operation costs.",
        complexity: "List Θ(V + E) · matrix Θ(V²)",
        tags: ["adjacency matrix", "adjacency list", "density"],
      },
      {
        id: "traversal",
        title: "BFS & DFS",
        subtitle: "Queue vs stack",
        description:
          "Step through breadth-first and depth-first search: layers, discovery/finish times and edge classes.",
        complexity: "Θ(V + E)",
        tags: ["queue", "stack", "edge classes", "parenthesis theorem"],
      },
      {
        id: "components",
        title: "Connected components",
        subtitle: "Components & strongly connected components",
        description:
          "Label every component with repeated searches, and find SCCs of a directed graph with Kosaraju’s two-pass DFS.",
        complexity: "Θ(V + E)",
        tags: ["reachability", "SCC", "Kosaraju", "condensation"],
      },
      {
        id: "topological",
        title: "Topological sorting",
        subtitle: "Ordering a DAG",
        description:
          "Order prerequisites with Kahn’s in-degree method or DFS finish times, and see how a cycle makes it impossible.",
        complexity: "Θ(V + E)",
        tags: ["DAG", "in-degree", "finish time", "cycle detection"],
      },
      {
        id: "biconnected",
        title: "Biconnected components",
        subtitle: "Articulation points & bridges",
        description:
          "Use DFS low-link values to find cut vertices, bridges and biconnected components in one pass.",
        complexity: "Θ(V + E)",
        tags: ["articulation point", "bridge", "low-link"],
      },
      {
        id: "shortest",
        title: "Single-source shortest paths",
        subtitle: "Dijkstra · Bellman–Ford · DAG",
        description:
          "Relax edges in three different orders and see which graphs each algorithm can handle.",
        complexity: "Dijkstra O((V + E) log V) · BF O(VE)",
        tags: ["relaxation", "negative edges", "negative cycle"],
      },
    ],
  },
  {
    id: "u4",
    number: "04",
    title: "Greedy & dynamic programming",
    short: "Optimization",
    description:
      "Compare local-choice strategies with state-based optimization and reconstruction.",
    topics: [
      {
        id: "mst",
        title: "Minimum spanning trees",
        subtitle: "Prim & Kruskal",
        description:
          "Grow a minimum-weight tree edge by edge: Kruskal sorts edges and uses union-find, Prim grows outward from one vertex.",
        complexity: "O(E log V)",
        tags: ["greedy choice", "cut property", "union-find"],
      },
      {
        id: "dijkstra",
        title: "Dijkstra: arrays vs heaps",
        subtitle: "Priority-queue choice",
        description:
          "Run the same greedy shortest-path algorithm with a plain array and with a binary heap, and see when each wins.",
        complexity: "Θ(V²) vs O((V+E) log V)",
        tags: ["extract-min", "decrease-key", "sparse vs dense"],
      },
      {
        id: "greedy",
        title: "Fractional knapsack",
        subtitle: "Greedy by value per weight",
        description:
          "Fill a knapsack with divisible items and compare three greedy rules: only value/weight is optimal.",
        complexity: "O(n log n)",
        tags: ["exchange argument", "ratio"],
      },
      {
        id: "huffman",
        title: "Huffman coding",
        subtitle: "Priority-queue merges",
        description:
          "Build an optimal prefix-free code by repeatedly merging the two least frequent trees.",
        complexity: "O(n log n)",
        tags: ["prefix code", "min-heap", "entropy"],
      },
      {
        id: "binomial",
        title: "Binomial coefficient",
        subtitle: "Pascal’s triangle",
        description:
          "See why plain recursion repeats work and how a table computes C(n, k) once per sub-problem.",
        complexity: "Θ(nk)",
        tags: ["overlapping subproblems", "tabulation"],
      },
      {
        id: "matrixchain",
        title: "Matrix chain multiplication",
        subtitle: "Optimal bracketing",
        description:
          "Fill the m and s tables by chain length and compare the optimum with every possible bracketing.",
        complexity: "Θ(n³)",
        tags: ["optimal substructure", "split table"],
      },
      {
        id: "lcs",
        title: "Longest common subsequence",
        subtitle: "Table with arrows",
        description:
          "Fill the LCS table for two strings of your choice and trace the arrows back to read off the answer.",
        complexity: "Θ(mn)",
        tags: ["trace-back", "diff"],
      },
      {
        id: "dp",
        title: "0/1 knapsack",
        subtitle: "Take or skip",
        description:
          "Fill the knapsack table item by item, trace back the chosen items, and compare with greedy and fractional answers.",
        complexity: "Θ(nW)",
        tags: ["pseudo-polynomial", "reconstruction"],
      },
    ],
  },
  {
    id: "u5",
    number: "05",
    title: "Complexity & intractability",
    short: "Limits of computation",
    description:
      "Classify decision problems, reason about reductions, and inspect combinatorial search.",
    topics: [
      {
        id: "pnp",
        title: "P and NP",
        subtitle: "Solving vs verifying",
        description:
          "Search all subsets or check one certificate, see why polynomial time is the line, and place famous problems on the map of classes.",
        complexity: "P ⊆ NP",
        tags: ["certificate", "verifier", "intractable"],
      },
      {
        id: "npc",
        title: "NP-completeness",
        subtitle: "The hardest problems in NP",
        description:
          "Watch NP-hardness spread down a chain of reductions, and a hypothetical fast algorithm spread up until P = NP.",
        complexity: "NPC = NP ∩ NP-hard",
        tags: ["Cook–Levin", "NP-hard", "proof recipe"],
      },
      {
        id: "reductions",
        title: "Polynomial reductions",
        subtitle: "Transform problems",
        description:
          "Turn a CNF formula into a graph whose independent sets mirror satisfying assignments, and link independent set, vertex cover and clique.",
        complexity: "A ≤p B",
        tags: ["mapping", "yes ⇔ yes", "hardness"],
      },
      {
        id: "sat",
        title: "SAT",
        subtitle: "Boolean satisfiability",
        description:
          "Check a certificate, run the full truth table, and watch DPLL prune the search with unit propagation.",
        complexity: "O(2ⁿ) brute force",
        tags: ["CNF", "DPLL", "Cook–Levin"],
      },
      {
        id: "hamiltonian",
        title: "Hamiltonian cycle",
        subtitle: "Every vertex once",
        description:
          "Backtrack through paths looking for a Hamiltonian cycle, contrast it with the easy Euler test, and reduce it to TSP.",
        complexity: "O(n!) search",
        tags: ["backtracking", "Euler vs Hamilton", "HAM ≤p TSP"],
      },
      {
        id: "tsp",
        title: "Travelling salesperson",
        subtitle: "Exact search & approximation",
        description:
          "Compare brute force with nearest neighbour and the MST 2-approximation on seeded city maps.",
        complexity: "(n−1)!/2 tours",
        tags: ["tour", "approximation", "Held–Karp"],
      },
    ],
  },
];

/** One-paragraph "the idea" summary shown above each topic's visualizer. */
export const daaIdeas: Record<string, string> = {
  ram: "An algorithm runs on an abstract machine. Count primitive operations under explicit unit-cost assumptions rather than equating source-code lines with real elapsed time.",
  asymptotic:
    "Asymptotic notation describes how functions compare for sufficiently large input sizes. O is an upper bound, Ω is a lower bound, and Θ is a tight bound.",
  complexity:
    "Identify the basic operation, count how often it executes, express the count as T(n), then simplify to the dominant asymptotic term.",
  paradigms:
    "Algorithmic paradigms are reusable design strategies. Their correctness comes from invariants, recurrences, exchange arguments, or sound pruning—not from the strategy name alone.",
  sorting:
    "Comparison sorts learn the order only by comparing keys. Quick sort does its work while partitioning, merge sort while merging, heap sort by repeatedly extracting the maximum. All average Θ(n log n); only quick sort has a Θ(n²) worst case.",
  trees:
    "A search tree supports search, insert and delete in O(height). Plain BSTs can degenerate to height n; AVL and red-black trees rebalance with rotations, and B-trees split full nodes, to keep the height logarithmic.",
  linear:
    "Counting, radix and bucket sort use key values as positions instead of comparing keys, so they sidestep the Ω(n log n) comparison lower bound under assumptions about the keys.",
  heaps:
    "A binary heap is a complete binary tree stored in an array, with every parent at least as large as its children (max-heap). It supports insert and extract-max in O(log n) and can be built in Θ(n).",
  hashing:
    "A hash function maps each key to a table slot so lookups take expected constant time. Collisions are resolved by chaining or by probing (linear, quadratic, double hashing), and the load factor α = n/m controls the cost.",
  matching:
    "KMP uses a prefix-function table to avoid rechecking matched text. Boyer–Moore uses mismatch shifts to skip alignments.",
  representations:
    "A graph can be stored as an adjacency matrix (Θ(V²) space, Θ(1) edge test), an adjacency list (Θ(V + E) space, fast neighbour scans) or an edge list. Sparse graphs favour lists.",
  traversal:
    "BFS explores layer by layer with a queue and finds fewest-edge distances. DFS goes deep with a stack (recursion) and records discovery and finish times. Both run in Θ(V + E) with adjacency lists.",
  topological:
    "A topological order lists the vertices of a DAG so every edge points forward. Kahn’s algorithm repeatedly removes in-degree-0 vertices; the DFS method orders vertices by decreasing finish time. A cycle makes it impossible.",
  components:
    "Connected components group vertices that can reach each other. In a directed graph, strongly connected components are maximal sets where every vertex reaches every other; Kosaraju finds them with two DFS passes.",
  biconnected:
    "An articulation point is a vertex whose removal disconnects the graph; a bridge is such an edge. DFS low-link values find all of them, and the biconnected components, in one Θ(V + E) pass.",
  shortest:
    "Shortest-path algorithms repeatedly relax edges: if d[u] + w(u, v) < d[v], update d[v]. Dijkstra relaxes in order of final distance (no negative edges), Bellman–Ford relaxes everything V − 1 times, and DAGs use topological order.",
  mst: "A minimum spanning tree connects every vertex with the least total weight. The cut property says the lightest edge crossing any cut is safe, which makes both Kruskal (lightest edge joining two trees) and Prim (lightest edge leaving the tree) correct.",
  dijkstra:
    "Dijkstra settles vertices in order of distance. With an array, extract-min is a Θ(V) scan, giving Θ(V²). With a binary heap, extract-min and decrease-key are O(log V), giving O((V + E) log V). Heaps win on sparse graphs, arrays on dense ones.",
  greedy:
    "A greedy algorithm makes the locally best choice and never revisits it. It is correct only with the greedy-choice property and optimal substructure. For the fractional knapsack, taking items in decreasing value/weight order is optimal.",
  huffman:
    "Huffman coding repeatedly removes the two least frequent trees from a min-priority queue and merges them. Frequent symbols end up near the root with short codes, giving an optimal prefix-free code in O(n log n).",
  binomial:
    "Dynamic programming stores the answer to every sub-problem once. C(n, k) = C(n−1, k−1) + C(n−1, k) repeats exponentially many calls when evaluated recursively, but a Pascal-triangle table needs only Θ(nk) additions.",
  matrixchain:
    "The cost of a matrix product depends on the bracketing. m[i][j] = min over k of m[i][k] + m[k+1][j] + p(i−1)p(k)p(j), filled by chain length, finds the optimum in Θ(n³) instead of trying exponentially many bracketings.",
  lcs: "c[i][j] holds the LCS length of the first i characters of X and the first j of Y. A match extends the diagonal; otherwise take the larger of the cell above and the cell to the left. Arrows let you read the LCS back.",
  dp: "For 0/1 knapsack, K[i][w] = max(K[i−1][w], vᵢ + K[i−1][w−wᵢ]). The table is filled in Θ(nW) and the chosen items are recovered by tracing back. Greedy by ratio can fail because items cannot be cut.",
  pnp: "P is the class of decision problems solvable in polynomial time. NP is the class whose YES answers have certificates checkable in polynomial time. P ⊆ NP; whether they are equal is open.",
  npc: "A problem is NP-complete if it is in NP and every NP problem reduces to it in polynomial time. SAT was the first (Cook–Levin); hardness then spreads along reductions. A polynomial algorithm for any one NP-complete problem would prove P = NP.",
  reductions:
    "A polynomial-time reduction A ≤p B maps every instance x of A to an instance f(x) of B with the same YES/NO answer. If A is NP-hard, so is B; if B is in P, so is A.",
  sat: "SAT asks whether a CNF formula has a satisfying assignment. Checking an assignment is linear in the formula, so SAT is in NP; brute force tries 2ⁿ assignments, and DPLL prunes with unit propagation but is still exponential in the worst case.",
  hamiltonian:
    "A Hamiltonian cycle visits every vertex exactly once. Verifying one is O(n), but finding one is NP-complete; backtracking may try O(n!) paths. Visiting every edge once (Euler) is, by contrast, a simple degree test.",
  tsp: "TSP seeks the cheapest tour through all cities. Its decision version is NP-complete (HAM-CYCLE reduces to it). Exact search costs (n−1)!/2 tours or n²·2ⁿ with Held–Karp; the MST tour is within 2× optimal for metric costs.",
};
