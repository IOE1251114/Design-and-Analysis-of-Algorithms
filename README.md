# VATRIX - Visual Algorithm Space

An interactive React + TypeScript + Vite learning prototype for a five-unit Design and Analysis of Algorithms course. It includes a responsive dark UI, a topic navigator, an Explore workspace, a Student assignment view, and a Teacher authoring/review view.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). To make a production build:

```bash
npm run build
npm run preview
npm test        # checks every Unit 1 trace against its closed-form formula
```

## Coverage

- **Unit I — Algorithm analysis (fully visual):**
  - _RAM model:_ line-by-line tracer for three programs (Θ(1), Θ(n), Θ(n²)) with per-line cost, run counts, memory/registers, a running cost meter, a T(n) chart and a "when n doubles" ratio panel.
  - _Asymptotic notation:_ growth-rate race (1, log n, n, n log n, n², 2ⁿ) on linear or log scale; a bound prover that computes the exact smallest n₀ for O, Ω and Θ from your own f(n), g(n), c₁ and c₂.
  - _Complexity analysis:_ loop grids where each square is one execution (constant, log, linear, n log n, triangular, quadratic), T(n) and T(n)/g(n) charts; recursion trees with per-level work bars and the Master Theorem case.
  - _Paradigms:_ merge sort split/merge tree, greedy coin change vs optimal (with a failing coin system), N-Queens backtracking, and 0/1-knapsack branch and bound with pruning.
- **Unit II — Searching, sorting and data structures (fully visual):**
  - _Comparison sorting:_ quick (last or middle pivot), merge, heap and insertion sort, step by step, plus a worst- vs average-case chart built from real comparison counts.
  - _Linear-time sorting:_ counting sort (stability shown), LSD radix sort, bucket sort, and the decision-tree proof of the Ω(n log n) lower bound.
  - _Search trees:_ BST insert/search/delete, AVL rotations (LL/RR/LR/RL), red-black insertion fix-up, B-tree insertion with node splits (t = 2 or 3), and a tree-height comparison.
  - _Heaps:_ max/min binary heap with insert, extract and build-heap shown as both a tree and an array, and why build-heap is Θ(n).
  - _Hashing:_ chaining, linear, quadratic and double hashing with probe sequences, load factor and expected-cost curves.
  - _String matching:_ naive, KMP (with prefix-function construction) and Boyer–Moore (bad-character and good-suffix tables).
- **Unit III — Graph algorithms (fully visual):**
  - _Representations:_ an editable graph shown as adjacency matrix, adjacency list and edge list, with space and operation costs.
  - _BFS & DFS:_ queue/stack state, BFS layers, DFS discovery/finish intervals and edge classes (tree, back, forward, cross).
  - _Connected components:_ component labelling, and Kosaraju's strongly connected components with the condensation DAG.
  - _Topological sorting:_ Kahn's in-degree method and DFS finishing order, with cycle detection.
  - _Biconnected components:_ low-link DFS finding articulation points, bridges and biconnected components, plus a remove-a-vertex experiment.
  - _Single-source shortest paths:_ Dijkstra (and where it fails), Bellman–Ford with negative-cycle detection, and DAG shortest paths.
- **Unit IV — Greedy and dynamic programming:** Prim and Kruskal on the textbook 9-vertex graph (union-find sets, keys and the cut property); Dijkstra with an array vs a binary heap (live operation counts and a worst-case bound chart); fractional knapsack with three greedy rules; Huffman coding with the priority-queue forest, code table and bits vs entropy; binomial coefficient (Pascal table, recursion tree with repeats, calls vs cells chart); matrix-chain m and s tables with every bracketing charted; LCS table with arrows and trace-back; 0/1 knapsack table with trace-back compared with greedy and fractional answers. Each topic has syllabus-referenced theory notes.
- **Unit V — Complexity and intractability:** subset-sum search vs certificate check, growth chart and a clickable map of P / NP / NP-complete / NP-hard; NP-completeness as hardness spreading through the reduction tree (and a fast algorithm spreading up to P = NP), with the proof recipe; CNF-SAT ≤p INDEPENDENT-SET built step by step, plus the independent set / vertex cover / clique triangle; SAT with certificate checking, a full truth table and a DPLL search tree on your own formulas; Hamiltonian-cycle backtracking with the Euler contrast and HAM-CYCLE ≤p TSP; TSP brute force vs nearest neighbour vs the MST 2-approximation. Each topic has syllabus-referenced theory notes.

## Modes

- **Explore:** interactive visualizers, input controls, intermediate states and concept notes. While a student is signed in, time spent and steps taken per topic are recorded automatically.
- **Student (manual practice):** enter a name, see your mastery per topic, practice auto-graded problems (60 problems covering all 30 topics), use hints, and open the matching visualizer. Teacher assignments appear here.
- **Teacher (automated):** no grading or data entry. The dashboard derives class accuracy, weakest topics, most common misconceptions, students needing attention, a student × topic heatmap, per-student drill-down (time, steps, misconceptions), and one-click auto-assignment of the weakest topics. Export CSV/JSON.

## How tracking works

- `src/domain/problems.ts`: problem bank. Each wrong answer maps to a named misconception.
- `src/domain/tracking.ts`: data model, localStorage persistence (`useDB`), analytics, and `useActivityTracker`.
- Mastery = share of the last 6 attempts answered correctly (a correct answer after a hint counts half), shown only after 2+ attempts. Below 50% = struggling, below 75% = developing.
- `src/domain/unit1.ts`, `src/domain/unit2/*.ts` and `src/domain/unit3/*.ts`: pure, deterministic logic behind every Unit 1–3 visual (seeded, no randomness); the `*.test.ts` files verify it against textbook results.
- `src/domain/demo.ts`: "Load demo class" in Teacher mode creates 8 synthetic students (flagged demo, removable).
- A student tab and a teacher tab in the same browser stay in sync through the `storage` event.

## Current limits

- Data is stored in the browser's `localStorage`: no sync across devices, accounts or real classes. `loadDB`/`saveDB`/`useDB` are the only storage touchpoints, so adding a backend means replacing them with API calls.
- Student identity is a typed name, not authentication.
- Auto-grading covers multiple-choice and numeric problems only. The old keyword-based writing checklist is no longer used.
- Visualizer step counts are tracked for the sorting and BFS/DFS steppers and all Unit 1 steppers; other visualizers record time only.
- Some panels are still concept demonstrators (tree panel, Boyer–Moore, shortest-path rounds use fixed illustrative values).

## Next milestones

1. Backend + authentication + class rosters; shared assignment delivery.
2. More problems per topic (or parameterized generators) so mastery is not based on repeats of one question.
3. "Predict the next step" interactions inside the visualizers, logged as attempts.
4. Real implementations for the tree, Boyer–Moore and shortest-path panels; unit tests; accessibility checks.
