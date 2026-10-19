# DAA Lab — Algorithm Studio

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
```

## Coverage

- **Unit I — Algorithm analysis:** RAM model, asymptotic bounds, operation-count patterns, divide and conquer, greedy, backtracking, branch and bound.
- **Unit II — Searching, sorting and data structures:** bubble/selection/insertion/merge sort trace; BST and balanced-tree concepts; hash buckets and collisions; KMP prefix table and Boyer–Moore shift concept.
- **Unit III — Graph algorithms:** adjacency-list/matrix/edge-list comparison, BFS/DFS traversal, topological-order concept, shortest-path relaxation and complexity notes.
- **Unit IV — Greedy and dynamic programming:** MST edge-selection concept, fractional knapsack and greedy proof caveat, 0/1 knapsack DP table.
- **Unit V — Complexity and intractability:** P/NP/NP-complete concepts, polynomial reductions, SAT assignment checker, small TSP tour enumeration.

## Modes

- **Explore:** interactive visualizers, input controls, intermediate states and concept notes. While a student is signed in, time spent and steps taken per topic are recorded automatically.
- **Student (manual practice):** enter a name, see your mastery per topic, practice auto-graded problems (24 problems covering all 19 topics), use hints, and open the matching visualizer. Teacher assignments appear here.
- **Teacher (automated):** no grading or data entry. The dashboard derives class accuracy, weakest topics, most common misconceptions, students needing attention, a student × topic heatmap, per-student drill-down (time, steps, misconceptions), and one-click auto-assignment of the weakest topics. Export CSV/JSON.

## How tracking works

- `src/domain/problems.ts`: problem bank. Each wrong answer maps to a named misconception.
- `src/domain/tracking.ts`: data model, localStorage persistence (`useDB`), analytics, and `useActivityTracker`.
- Mastery = share of the last 6 attempts answered correctly (a correct answer after a hint counts half), shown only after 2+ attempts. Below 50% = struggling, below 75% = developing.
- `src/domain/demo.ts`: "Load demo class" in Teacher mode creates 8 synthetic students (flagged demo, removable).
- A student tab and a teacher tab in the same browser stay in sync through the `storage` event.

## Current limits

- Data is stored in the browser's `localStorage`: no sync across devices, accounts or real classes. `loadDB`/`saveDB`/`useDB` are the only storage touchpoints, so adding a backend means replacing them with API calls.
- Student identity is a typed name, not authentication.
- Auto-grading covers multiple-choice and numeric problems only. The old keyword-based writing checklist is no longer used.
- Visualizer step counts are tracked for the sorting and BFS/DFS steppers; other visualizers record time only.
- Some panels are still concept demonstrators (tree panel, Boyer–Moore, shortest-path rounds use fixed illustrative values).

## Next milestones

1. Backend + authentication + class rosters; shared assignment delivery.
2. More problems per topic (or parameterized generators) so mastery is not based on repeats of one question.
3. "Predict the next step" interactions inside the visualizers, logged as attempts.
4. Real implementations for the tree, Boyer–Moore and shortest-path panels; unit tests; accessibility checks.
