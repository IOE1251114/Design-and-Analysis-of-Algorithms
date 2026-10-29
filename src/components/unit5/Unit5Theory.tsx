import { Code, NotesPanel, type Note } from "../unit1/Unit1Theory";

/* Theory notes for Unit V, written against the syllabus:
 * "Intractability: P and NP classes, NP-completeness, polynomial-time reductions,
 *  NP-complete problems: SAT, Hamiltonian cycle, travelling salesperson problem." */

const notes: Record<string, Note> = {
  pnp: {
    syllabus: "Intractable problems · Classes P and NP",
    intro:
      "Complexity theory sorts problems by the resources any algorithm needs, not by one particular algorithm. It works with decision problems (YES/NO answers), because an optimisation problem is usually no harder than its decision version plus a search. The dividing line is polynomial time: problems solvable in O(nᵏ) for a fixed k are called tractable; the rest are intractable.",
    cards: [
      {
        icon: "def",
        title: "Definitions",
        body: (
          <ul>
            <li>
              <b>Decision problem:</b> a set of instances, each with answer YES
              or NO. Example: “does G have a path from s to t of length ≤ k?”.
            </li>
            <li>
              <b>P:</b> problems decided by a deterministic algorithm in O(nᵏ)
              time for some constant k, where n is the input size in bits.
            </li>
            <li>
              <b>NP:</b> problems where every YES instance has a{" "}
              <b>certificate</b> of polynomial length that a polynomial-time{" "}
              <b>verifier</b> accepts, and no certificate convinces it on a NO
              instance. (Equivalently: solvable in polynomial time by a
              non-deterministic machine.)
            </li>
            <li>
              <b>co-NP:</b> problems whose NO instances have such certificates.
            </li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "What is known",
        body: (
          <ul>
            <li>
              <b>P ⊆ NP:</b> a polynomial algorithm is itself a verifier that
              ignores the certificate.
            </li>
            <li>
              Whether <b>P = NP</b> is open (a Clay Millennium Prize problem).
            </li>
            <li>
              NP problems can all be solved in exponential time: try every
              certificate, O(2^p(n)).
            </li>
            <li>
              NP does <b>not</b> mean “non-polynomial”; it means
              “non-deterministic polynomial”.
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Why polynomial is the line",
        body: (
          <ul>
            <li>
              Closed under composition: a polynomial algorithm calling
              polynomial subroutines stays polynomial.
            </li>
            <li>
              Model-independent: RAM, Turing machine and real computers differ
              only by polynomial factors.
            </li>
            <li>
              At 10⁹ steps per second, n³ handles n = 1000 in a second; 2ⁿ only
              n ≈ 30, and n! only n ≈ 12.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Certificates in practice",
        wide: true,
        body: (
          <Code>{`Problem            Certificate                    Verifier time
SUBSET-SUM         the chosen numbers             O(n)    add and compare
SAT                a truth assignment             O(size of formula)
CLIQUE (G, k)      k vertices                     O(k²)   check every pair is an edge
HAM-CYCLE          an ordering of the vertices    O(n)    each once, consecutive ones adjacent
TSP (D, k)         a tour                         O(n)    add up the n distances, compare with k`}</Code>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Saying NP problems “cannot be solved in polynomial time”. That is
              unproved; it is the P vs NP question.
            </li>
            <li>
              Calling an optimisation problem “in NP”. NP contains decision
              problems only.
            </li>
            <li>
              Treating 0/1 knapsack’s Θ(nW) as polynomial. W is written in log W
              bits, so it is exponential in the input size.
            </li>
          </ul>
        ),
      },
    ],
  },
  npc: {
    syllabus:
      "NP-completeness · NP-hard and NP-complete problems · Cook–Levin theorem",
    intro:
      "NP-complete problems are the hardest problems in NP: if any one of them can be solved in polynomial time, then every NP problem can, and P = NP. Thousands of practical problems (scheduling, routing, packing, circuit design) are NP-complete, so recognising one tells you to stop looking for a fast exact algorithm and to use approximation, heuristics or exponential methods on small inputs instead.",
    cards: [
      {
        icon: "def",
        title: "Definitions",
        body: (
          <ul>
            <li>
              <b>NP-hard:</b> L is NP-hard if every problem in NP reduces to it:
              A ≤p L for all A ∈ NP.
            </li>
            <li>
              <b>NP-complete (NPC):</b> L ∈ NP <b>and</b> L is NP-hard.
            </li>
            <li>
              An NP-hard problem need not be in NP (it may not even be a
              decision problem, or may be undecidable, like the halting
              problem).
            </li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "Key theorems",
        body: (
          <ul>
            <li>
              <b>Cook–Levin (1971):</b> SAT is NP-complete. Proof idea: the
              computation of any polynomial-time verifier on input x can be
              encoded as a polynomial-size Boolean formula that is satisfiable
              iff a certificate exists.
            </li>
            <li>If L is NPC and L ∈ P, then P = NP.</li>
            <li>
              If A is NP-hard and A ≤p B, then B is NP-hard (≤p is transitive).
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Proof template for a new problem X",
        wide: true,
        body: (
          <Code>{`To show X is NP-complete:
  1. X ∈ NP        : describe a certificate and a polynomial-time verifier.
  2. Choose Y      : a problem already known to be NP-complete (SAT, 3-SAT, CLIQUE, …).
  3. Reduction f   : map each instance y of Y to an instance f(y) of X.
  4. Polynomial    : show f can be computed in polynomial time.
  5. Correctness   : y is YES for Y  ⇔  f(y) is YES for X   (prove both directions).
Then Y ≤p X, so X is NP-hard; with step 1, X is NP-complete.`}</Code>
        ),
      },
      {
        icon: "math",
        title: "The standard reduction tree",
        body: (
          <ul>
            <li>NP ≤p SAT ≤p 3-SAT.</li>
            <li>3-SAT ≤p CLIQUE ≤p VERTEX-COVER ≤p HAM-CYCLE ≤p TSP.</li>
            <li>3-SAT ≤p SUBSET-SUM.</li>
          </ul>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Reducing the new problem X <b>to</b> a known NPC problem. That
              shows X is no harder, which proves nothing about hardness.
            </li>
            <li>
              Forgetting step 1 (membership in NP) when claiming NP-complete
              rather than NP-hard.
            </li>
            <li>Proving only one direction of “y is YES ⇔ f(y) is YES”.</li>
          </ul>
        ),
      },
    ],
  },
  reductions: {
    syllabus: "Polynomial-time reductions",
    intro:
      "A reduction converts one problem into another. If A ≤p B, a polynomial-time algorithm for B would immediately give one for A (transform the input, then run B’s algorithm), so B is at least as hard as A. Reductions are how hardness is transferred from problem to problem.",
    cards: [
      {
        icon: "def",
        title: "Definition",
        body: (
          <ul>
            <li>
              A ≤p B if there is a function f, computable in polynomial time,
              such that for every instance x: <b>x ∈ A ⇔ f(x) ∈ B</b>.
            </li>
            <li>
              f must work for <b>every</b> instance and preserve both YES and NO
              answers.
            </li>
            <li>
              Since f runs in polynomial time, |f(x)| is polynomial in |x|.
            </li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "Using the direction correctly",
        body: (
          <ul>
            <li>
              <b>Upper bound:</b> B ∈ P and A ≤p B ⇒ A ∈ P.
            </li>
            <li>
              <b>Lower bound:</b> A NP-hard and A ≤p B ⇒ B NP-hard.
            </li>
            <li>
              Transitive: A ≤p B and B ≤p C ⇒ A ≤p C (compose the two maps).
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "CNF-SAT ≤p INDEPENDENT-SET",
        wide: true,
        body: (
          <Code>{`Input: CNF formula φ with clauses C1, …, Cm
  for each occurrence of a literal ℓ in clause Ci: create vertex (i, ℓ)
  join every two vertices of the same clause          // take ≤ 1 per clause
  join (i, x) and (j, ¬x) for every variable x         // never x and ¬x together
  k = m
Output: (G, k)
Claim: φ is satisfiable  ⇔  G has an independent set of size k
Size: L literals → L vertices, O(L²) edges → polynomial time`}</Code>
        ),
      },
      {
        icon: "math",
        title: "Simple equivalences",
        body: (
          <ul>
            <li>S is independent in G ⇔ V − S is a vertex cover of G.</li>
            <li>S is independent in G ⇔ S is a clique in the complement Ḡ.</li>
            <li>So IS(G, k) ⇔ VC(G, |V| − k) ⇔ CLIQUE(Ḡ, k).</li>
            <li>
              HAM-CYCLE ≤p TSP: costs 1 on edges, 2 on non-edges, bound k = n.
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
              Building f by solving A first (e.g. “find a satisfying assignment,
              then output…”). f must not depend on knowing the answer.
            </li>
            <li>A reduction that is correct only for YES instances.</li>
            <li>
              An exponential-size construction, e.g. one vertex per assignment.
            </li>
          </ul>
        ),
      },
    ],
  },
  sat: {
    syllabus: "NP-complete problems: satisfiability (SAT, 3-SAT)",
    intro:
      "A Boolean formula is satisfiable if some assignment of true/false to its variables makes it true. SAT is the canonical NP-complete problem, and modern SAT solvers (descendants of DPLL) are used in hardware verification, planning and scheduling despite the exponential worst case.",
    cards: [
      {
        icon: "def",
        title: "Terms",
        body: (
          <ul>
            <li>
              <b>Literal:</b> a variable x or its negation ¬x.
            </li>
            <li>
              <b>Clause:</b> an OR of literals, e.g. (x ∨ ¬y ∨ z).
            </li>
            <li>
              <b>CNF:</b> an AND of clauses. <b>k-CNF</b>: every clause has
              exactly k literals.
            </li>
            <li>
              <b>3-SAT:</b> satisfiability of 3-CNF formulas.
            </li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "Complexity facts",
        body: (
          <ul>
            <li>
              SAT ∈ NP: an assignment is checked in time linear in the formula.
            </li>
            <li>
              SAT and 3-SAT are NP-complete (Cook–Levin; long clauses are split
              with new variables: (a ∨ b ∨ c ∨ d) becomes (a ∨ b ∨ y) ∧ (¬y ∨ c
              ∨ d)).
            </li>
            <li>
              <b>2-SAT is in P</b> (implication graph + strongly connected
              components, linear time).
            </li>
            <li>Brute force tries all 2ⁿ assignments: O(2ⁿ · |φ|).</li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "DPLL (backtracking with propagation)",
        wide: true,
        body: (
          <Code>{`DPLL(φ, assignment):
  repeat:                                     // unit propagation
      if some clause is false: return UNSAT   // conflict → backtrack
      if every clause is true: return SAT
      if a clause has one unassigned literal ℓ and the rest false:
          set ℓ = true                        // forced
      else break
  pick an unassigned variable x
  return DPLL(φ, x = true)  or  DPLL(φ, x = false)`}</Code>
        ),
      },
      {
        icon: "math",
        title: "Worked check",
        body: (
          <ul>
            <li>φ = (a ∨ ¬b) ∧ (¬a ∨ c) ∧ (b ∨ c).</li>
            <li>a = T, b = T, c = F: clause 2 is (F ∨ F) = F, so rejected.</li>
            <li>
              a = T, b = F, c = T: all three clauses true, so φ is satisfiable.
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
              Confusing CNF (AND of ORs) with DNF (OR of ANDs). DNF
              satisfiability is easy.
            </li>
            <li>
              Thinking a clever solver makes SAT polynomial. DPLL and CDCL still
              have exponential worst cases.
            </li>
          </ul>
        ),
      },
    ],
  },
  hamiltonian: {
    syllabus: "NP-complete problems: Hamiltonian cycle",
    intro:
      "A Hamiltonian cycle passes through every vertex of a graph exactly once and returns to its start. Named after W. R. Hamilton’s 1857 “Icosian game” on the dodecahedron, the decision problem HAM-CYCLE is NP-complete, in sharp contrast with the Euler circuit problem (every edge once), which is solved by a degree check.",
    cards: [
      {
        icon: "def",
        title: "The problem",
        body: (
          <ul>
            <li>
              <b>HAM-CYCLE:</b> given G = (V, E), is there a cycle containing
              every vertex exactly once?
            </li>
            <li>
              <b>Hamiltonian path:</b> the same without returning to the start
              (also NP-complete).
            </li>
            <li>
              Certificate: the order of the vertices. Verification: O(n)
              adjacency checks.
            </li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "Facts",
        body: (
          <ul>
            <li>
              HAM-CYCLE is NP-complete (VERTEX-COVER ≤p HAM-CYCLE using
              12-vertex edge gadgets).
            </li>
            <li>A graph with a cut vertex has no Hamiltonian cycle.</li>
            <li>
              Dirac: if n ≥ 3 and every degree ≥ n/2, a Hamiltonian cycle exists
              (sufficient, not necessary).
            </li>
            <li>The Petersen graph is the classic small graph with none.</li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Backtracking search",
        wide: true,
        body: (
          <Code>{`HAM(path):                              // path starts as [v0]
  if |path| = n:
      return (last(path), v0) ∈ E          // can the path be closed?
  for each neighbour v of last(path), in order:
      if v not on path:
          append v;  if HAM(path): return true
          remove v                           // backtrack
  return false
Worst case: O(n!) paths.  Held–Karp-style DP: O(n² 2ⁿ).`}</Code>
        ),
      },
      {
        icon: "math",
        title: "Euler vs Hamilton",
        body: (
          <ul>
            <li>
              <b>Euler circuit</b> (every edge once): exists iff G is connected
              and all degrees are even. O(V + E). In P.
            </li>
            <li>
              <b>Hamiltonian cycle</b> (every vertex once): no such
              characterisation is known. NP-complete.
            </li>
            <li>
              The bow tie is Eulerian but not Hamiltonian; the cube is
              Hamiltonian but not Eulerian.
            </li>
          </ul>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>Mixing up Euler (edges) and Hamilton (vertices).</li>
            <li>Forgetting to check the closing edge back to the start.</li>
            <li>Treating Dirac’s condition as necessary.</li>
          </ul>
        ),
      },
    ],
  },
  tsp: {
    syllabus: "NP-complete problems: travelling salesperson problem",
    intro:
      "Given n cities and the cost of travelling between every pair, the travelling salesperson problem (TSP) asks for the cheapest tour that visits each city once and returns home. The decision version, “is there a tour of cost at most k?”, is NP-complete. In practice it is attacked with exact exponential methods for small n, branch and bound, and approximation algorithms.",
    cards: [
      {
        icon: "def",
        title: "Versions",
        body: (
          <ul>
            <li>
              <b>Optimisation:</b> find a minimum-cost Hamiltonian cycle in a
              complete weighted graph. NP-hard.
            </li>
            <li>
              <b>Decision:</b> TSP(D, k): is there a tour of cost ≤ k?
              NP-complete.
            </li>
            <li>
              <b>Metric TSP:</b> costs obey the triangle inequality c(u, w) ≤
              c(u, v) + c(v, w).
            </li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "Why NP-complete",
        body: (
          <ul>
            <li>
              <b>In NP:</b> certificate = a tour; add its n costs and compare
              with k.
            </li>
            <li>
              <b>NP-hard:</b> HAM-CYCLE ≤p TSP. Give edges of G cost 1 (or 0)
              and non-edges cost 2 (or 1); a tour of cost ≤ n (or 0) exists iff
              G is Hamiltonian.
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Algorithms and costs",
        body: (
          <ul>
            <li>Brute force: fix the start, try (n − 1)!/2 tours: O(n!).</li>
            <li>Held–Karp DP: O(n² 2ⁿ) time, O(n 2ⁿ) space.</li>
            <li>
              Branch and bound: exact, prunes with lower bounds; exponential
              worst case.
            </li>
            <li>Nearest neighbour: O(n²), no constant-factor guarantee.</li>
            <li>
              MST tour (metric): O(n²) with Prim, at most <b>2 × optimal</b>.
              Christofides: 1.5 ×.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "MST 2-approximation",
        wide: true,
        body: (
          <Code>{`APPROX-TSP-TOUR(G, c):           // c obeys the triangle inequality
  T = MST of G (Prim from root r)
  H = vertices of T in preorder   // depth-first walk, skipping repeats
  return the tour H, r
Why ≤ 2·OPT:
  deleting one edge of an optimal tour gives a spanning tree  ⇒  c(T) ≤ OPT
  the full walk of T uses every tree edge twice               ⇒  cost 2·c(T)
  shortcutting repeated vertices never increases the cost     ⇒  c(H) ≤ 2·c(T) ≤ 2·OPT`}</Code>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Counting n! tours instead of (n − 1)!/2 (fix the start; a tour and
              its reverse cost the same).
            </li>
            <li>
              Using the 2-approximation bound for non-metric costs. Without the
              triangle inequality no constant-factor approximation exists unless
              P = NP.
            </li>
          </ul>
        ),
      },
    ],
  },
};

/** Put the first three short cards in one row, then the full-width code cards, then the rest. */
const tidy = (n: Note): Note => {
  const narrow = n.cards.filter((c) => !c.wide),
    wide = n.cards.filter((c) => c.wide);
  return { ...n, cards: [...narrow.slice(0, 3), ...wide, ...narrow.slice(3)] };
};
export function hasUnit5Theory(topic: string) {
  return topic in notes;
}
export function Unit5Theory({ topic }: { topic: string }) {
  const n = notes[topic];
  return n ? <NotesPanel note={tidy(n)} unit="V" /> : null;
}
