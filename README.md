# VATRIX - Visual Algorithm Space

An interactive React + TypeScript + Vite learning space with three live subjects, each a five-unit course: **Design and Analysis of Algorithms** (`/algorithms`), **Data Structures** (`/data-structures`) and **Linear Algebra** (`/linear-algebra`). Every topic has a visualizer, syllabus-referenced theory notes and auto-graded practice, in Explore, Student and Teacher modes.

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
npm test        # runs the domain tests for all three subjects
```

## Project structure

```
.
├── index.html                 # Vite entry HTML
├── public/                    # Static files served as-is (favicon)
├── src/
│   ├── main.tsx               # Routes: "/", "/algorithms", "/data-structures", "/linear-algebra" ("/lab" redirects)
│   ├── pages/
│   │   ├── LandingPage.tsx    # Subject overview, course switcher, company footer
│   │   ├── LabPage.tsx        # The shared lab shell (Explore / Student / Teacher)
│   │   ├── DaaLab.tsx         # /algorithms entry (its own lazily loaded chunk)
│   │   ├── DsLab.tsx          # /data-structures entry
│   │   └── LaLab.tsx          # /linear-algebra entry
│   ├── courses/               # One file per subject: topic → visualizer and theory notes
│   │   ├── types.ts
│   │   ├── daa.tsx
│   │   ├── ds.tsx
│   │   └── la.tsx
│   ├── components/
│   │   ├── landing/           # Animated hero field
│   │   ├── modes/             # Student practice panel and Teacher dashboard
│   │   ├── daa/unit1 … unit5/ # Algorithms visualizers and theory notes
│   │   ├── ds/                # Data Structures visualizers (unit1 … unit5), kit.tsx, DsTheory.tsx
│   │   └── la/                # Linear Algebra visualizers (unit1 … unit5), kit.tsx (draggable plane), Space3D.tsx (rotatable ℝ³), LaTheory.tsx
│   ├── domain/                # Pure logic, course data and tests (no React)
│   │   ├── course.ts          # Unit / Topic types shared by every subject
│   │   ├── subjects.ts        # Subjects on the landing page (add new ones here)
│   │   ├── problems.ts        # All practice problems (problemKit.ts has the helpers)
│   │   ├── tracking.ts        # Students, attempts, mastery, localStorage
│   │   ├── daa/               # units.ts, problems.ts, unit1 … unit5 logic + tests
│   │   ├── ds/                # units.ts, problems.ts, arrays/lists/stacks/trees/sorting logic + ds.test.ts
│   │   └── la/                # units.ts, problems.ts, linalg.ts (matrices, RREF, eigen, Jordan…), algebra.ts, spaces.ts (ℝ³, matrix, polynomial, ℂⁿ) + la.test.ts
│   ├── styles/                # index.css imports base, lab, per-unit, ds, la and landing styles
│   └── assets/                # Images bundled by Vite (logo)
├── vercel.json                # SPA rewrite so deep links work on refresh
└── vite.config.ts
```

### Adding a subject

1. Add its units and topic summaries in `src/domain/<subject>/units.ts` and problems in `src/domain/<subject>/problems.ts` (include them in `src/domain/problems.ts`).
2. Build its visualizers in `src/components/<subject>/` and map topic ids to them in `src/courses/<subject>.tsx`.
3. Add a page in `src/pages/`, a route in `src/main.tsx`, and set `path` on the subject in `src/domain/subjects.ts`.

## Coverage — Design & Analysis of Algorithms

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

## Coverage — Data Structures

Follows the syllabus unit by unit (29 topics, 58 practice problems). Topics shared with the Algorithms course reuse its visualizers.

- **Unit I — Introduction & arrays:** data organisation (field, record, file, keys), operation costs per structure on a log scale, a time–space trade-off calculator; address calculation for 1-, 2- and 3-D arrays in row- and column-major order with the memory layout drawn; traversal, insertion and deletion with every shift animated; linear vs binary search side by side; sparse matrices as triplets with simple transpose, fast transpose (rowTerms / startingPos) and sparse multiplication.
- **Unit II — Recursion & linked lists:** the call stack for n! and the Fibonacci recursion tree with repeated calls highlighted; N-Queens backtracking with pruning and undo; singly, doubly and circular lists (insert at head, tail or position, delete, search, reverse) with CUR/PREV pointers and the new node drawn; generalized lists with tags, depth and length; polynomial addition and multiplication on term lists.
- **Unit III — Stacks & queues:** array and linked stacks side by side with overflow/underflow; Tower of Hanoi (up to 7 disks, 2ⁿ − 1 moves); linear, circular and double-ended queues on a fixed array, with the circular queue also drawn as a ring; priority queues with a binary heap; infix → postfix with the operator stack traced, infix → prefix, and postfix evaluation; the maze problem solved with a stack and with a queue (editable walls).
- **Unit IV — Trees:** level-order input, four traversals, mathematical properties, completeness, extended trees with E = I + 2n; expression trees built and evaluated bottom-up; BST/AVL/B-trees; Huffman's algorithm; general trees in left-child right-sibling form and in-order threaded trees with threads drawn; tries with insert, search and prefix queries.
- **Unit V — Sorting, hashing & graphs:** bubble, selection and insertion sort with comparison/swap counts on random, sorted and reversed input; quick, two-way merge and heap sort; sorting on several keys with stable passes; external two-way merge sort with runs and passes; hashing; adjacency-matrix representation; DFS and BFS; topological sort; digraphs and multigraphs with counted matrices, degrees and the handshake lemma.

## Coverage — Linear Algebra

Follows the syllabus unit by unit (27 topics, 54 practice problems). Most visuals are a coordinate plane with vectors you drag, or a rotatable 3-D view of ℝ³; matrices can be typed in or loaded from presets.

- **Unit I — Modern algebra & vector spaces:** ℤₙ operation tables with the group axioms checked live, zero divisors and when ℤₙ is a field; a subspace tester (drag u, v and c to find counterexamples); a gallery of vector spaces — ℝ³ in a rotatable 3-D view (spans as lines and planes, linear combinations, cross product, volume test), the matrix space M₂ₓ₂ (matrices as coloured tiles with coordinates in ℝ⁴ and its symmetric/diagonal/trace-zero subspaces), polynomial spaces Pₙ (curves and coefficient vectors, a Taylor basis, d/dx as a matrix) and complex spaces ℂ and ℂ² (complex scalars rotating vectors, the Hermitian inner product); span drawn as a lattice of combinations, with an ℝ³ dependence test; a basis grid that reads off coordinates; direct sums that split a vector along two lines.
- **Unit II — Linear transformations:** the plane morphing from I to any 2 × 2 matrix with linearity checked on your vectors; step-by-step row reduction with range and null-space bases and rank + nullity = n; orthogonal and oblique projections (P² = P); Gauss–Jordan inversion of [A | I]; change of basis P⁻¹AP (diagonal in an eigenbasis); dual bases drawn as families of level lines.
- **Unit III — Eigen-theory:** determinant as area scale and orientation, trace, transpose and cofactor expansion; a vector sweeping the circle to find eigenvectors; Cayley–Hamilton summed term by term with the minimal polynomial; diagonalization with the eigenbasis grid and Aᵏx; Jordan blocks from rank(A − λI)ᵏ; unit balls of the 1-, 2- and ∞-norms and their images.
- **Unit IV — Inner product spaces:** dot and weighted inner products with Cauchy–Schwarz and the triangle inequality; Gram–Schmidt in the plane (stepped) and in ℝ³ (table); least squares as an orthogonal projection with draggable data points; adjoints and Hermitian / unitary / normal tests for complex matrices.
- **Unit V — Bilinear & quadratic forms:** B(u, v) = uᵀMv with its symmetric and skew parts and congruence PᵀMP; quadratic forms as heat maps with principal axes, eigenvalues, leading minors and signature.

## Modes

- **Explore:** interactive visualizers, input controls, intermediate states and concept notes. While a student is signed in, time spent and steps taken per topic are recorded automatically.
- **Student (manual practice):** enter a name, see your mastery per topic, practice auto-graded problems (60 for Algorithms, 58 for Data Structures, 54 for Linear Algebra, at least two per topic), use hints, and open the matching visualizer. Teacher assignments appear here.
- **Teacher (automated):** no grading or data entry. The dashboard derives class accuracy, weakest topics, most common misconceptions, students needing attention, a student × topic heatmap, per-student drill-down (time, steps, misconceptions), and one-click auto-assignment of the weakest topics. Export CSV/JSON.

## How tracking works

- `src/domain/problems.ts`: problem bank. Each wrong answer maps to a named misconception.
- `src/domain/tracking.ts`: data model, localStorage persistence (`useDB`), analytics, and `useActivityTracker`.
- Mastery = share of the last 6 attempts answered correctly (a correct answer after a hint counts half), shown only after 2+ attempts. Below 50% = struggling, below 75% = developing.
- `src/domain/daa/**`, `src/domain/ds/*.ts` and `src/domain/la/*.ts`: pure, deterministic logic behind every visual (seeded, no randomness); the `*.test.ts` files verify it against textbook results.
- Data Structures topic ids start with `ds-` and Linear Algebra ones with `la-`, so progress in different subjects never collides; one student profile covers all three.
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
