import { Code, NotesPanel, type Note } from "../unit1/Unit1Theory";

/* Theory notes for Unit III, written against the syllabus:
 * "Application of Graph Traversal Techniques: Recall representation of graphs, BFS, DFS, connected components,
 *  topological sorting of DAGs, biconnected components, single source shortest path." */

const notes: Record<string, Note> = {
  representations: {
    syllabus: "Recall representation of graphs",
    intro:
      "A graph G = (V, E) is a set of vertices joined by edges. Edges can be directed or undirected, weighted or unweighted. How you store the graph decides how fast the basic operations are, and so how fast every algorithm built on top of them runs.",
    cards: [
      {
        icon: "def",
        title: "Terms you need",
        body: (
          <ul>
            <li>
              <b>Degree</b> of a vertex: the number of edges at it. In a
              directed graph, in-degree and out-degree are counted separately.
            </li>
            <li>
              <b>Handshake lemma:</b> Σ deg(v) = 2|E| for an undirected graph.
            </li>
            <li>
              A <b>path</b> is a sequence of vertices joined by edges; a{" "}
              <b>cycle</b> is a path that returns to its start.
            </li>
            <li>
              <b>Sparse:</b> E = O(V). <b>Dense:</b> E = Θ(V²). An undirected
              graph has at most V(V − 1)/2 edges.
            </li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "The three representations",
        body: (
          <ul>
            <li>
              <b>Adjacency matrix:</b> a V × V array with A[u][v] = 1 (or the
              weight) when (u, v) ∈ E. It is symmetric for undirected graphs.
            </li>
            <li>
              <b>Adjacency list:</b> an array of V lists; list u holds the
              neighbours of u. An undirected edge appears in two lists.
            </li>
            <li>
              <b>Edge list:</b> just the E pairs (u, v, w). Handy when the
              algorithm sorts edges, as Kruskal does.
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Costs",
        body: (
          <ul>
            <li>Space: matrix Θ(V²); list Θ(V + E); edge list Θ(E).</li>
            <li>Edge test (u, v)?: matrix Θ(1); list O(deg u).</li>
            <li>All neighbours of u: matrix Θ(V); list Θ(deg u).</li>
            <li>
              So BFS and DFS cost Θ(V + E) with lists but Θ(V²) with a matrix.
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
              Forgetting that an undirected edge is stored twice in an adjacency
              list, giving V + 2E entries.
            </li>
            <li>
              Stating BFS as O(V + E) while using a matrix: it is then Θ(V²).
            </li>
            <li>Assuming the matrix is symmetric for a directed graph.</li>
          </ul>
        ),
      },
    ],
  },
  traversal: {
    syllabus: "BFS, DFS",
    intro:
      "Graph traversal visits every vertex reachable from a start vertex exactly once. Breadth-first and depth-first search are the two basic orders, and most graph algorithms in this unit are one of them with extra bookkeeping.",
    cards: [
      {
        icon: "def",
        title: "Breadth-first search",
        body: (
          <>
            <Code>{`BFS(G, s)
  for each v: d[v] ← ∞; π[v] ← NIL
  d[s] ← 0; Q ← {s}
  while Q ≠ ∅
    u ← DEQUEUE(Q)
    for each v in Adj[u]
      if d[v] = ∞
        d[v] ← d[u] + 1; π[v] ← u
        ENQUEUE(Q, v)`}</Code>
            <p style={{ marginTop: 8 }}>
              Θ(V + E). d[v] is the fewest-edges distance from s, and the π
              pointers form a BFS tree of shortest paths.
            </p>
          </>
        ),
      },
      {
        icon: "def",
        title: "Depth-first search",
        body: (
          <>
            <Code>{`DFS-VISIT(u)
  time ← time + 1; d[u] ← time; u.colour ← GREY
  for each v in Adj[u]
    if v.colour = WHITE
      π[v] ← u; DFS-VISIT(v)
  u.colour ← BLACK
  time ← time + 1; f[u] ← time`}</Code>
            <p style={{ marginTop: 8 }}>
              DFS calls DFS-VISIT from every still-white vertex, producing a DFS
              forest. Θ(V + E).
            </p>
          </>
        ),
      },
      {
        icon: "key",
        title: "What DFS gives you",
        body: (
          <ul>
            <li>
              <b>Parenthesis theorem:</b> for any u and v, the intervals [d[u],
              f[u]] and [d[v], f[v]] are either disjoint or nested.
            </li>
            <li>
              <b>Edge classes</b> (directed graphs): <b>tree</b> (to a white
              vertex), <b>back</b> (to a grey ancestor), <b>forward</b> (to a
              black descendant), <b>cross</b> (anything else). An undirected
              graph has only tree and back edges.
            </li>
            <li>A graph has a cycle ⇔ DFS finds a back edge.</li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "BFS vs DFS",
        wide: true,
        body: (
          <div className="u1-table-wrap">
            <table className="u1-table" style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th />
                  <th>BFS</th>
                  <th>DFS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Data structure</td>
                  <td>Queue (FIFO)</td>
                  <td>Stack (LIFO) or recursion</td>
                </tr>
                <tr>
                  <td>Order</td>
                  <td>Layer by layer</td>
                  <td>As deep as possible, then backtrack</td>
                </tr>
                <tr>
                  <td>Time with lists</td>
                  <td>Θ(V + E)</td>
                  <td>Θ(V + E)</td>
                </tr>
                <tr>
                  <td>Gives</td>
                  <td>Shortest paths by edge count, bipartiteness test</td>
                  <td>
                    Discovery/finish times, cycle detection, topological order,
                    SCCs, articulation points
                  </td>
                </tr>
                <tr>
                  <td>Extra memory</td>
                  <td>O(V) for the queue, wide graphs need more</td>
                  <td>O(V) for the stack, deep graphs need more</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Marking a vertex visited when it is dequeued instead of when it is
              enqueued. It can then be enqueued twice.
            </li>
            <li>
              Calling DFS distances “shortest”. Only BFS gives shortest edge
              counts.
            </li>
            <li>
              Forgetting the outer loop over all vertices, which leaves
              disconnected parts unvisited.
            </li>
          </ul>
        ),
      },
    ],
  },
  components: {
    syllabus: "Connected components",
    intro:
      "Connectivity asks which vertices can reach which. In an undirected graph, reachability splits the vertices into connected components. In a directed graph the right notion is strongly connected components, where every vertex reaches every other inside the component.",
    cards: [
      {
        icon: "def",
        title: "Connected components (undirected)",
        body: (
          <>
            <Code>{`c ← 0
for each vertex v
  if v has no label
    c ← c + 1
    BFS or DFS from v, labelling every reached vertex c
return c`}</Code>
            <p style={{ marginTop: 8 }}>
              Θ(V + E). Reachability is an equivalence relation, so the labels
              partition V. A single search from any vertex decides whether the
              graph is connected.
            </p>
          </>
        ),
      },
      {
        icon: "def",
        title: "Strongly connected components (directed)",
        body: (
          <ul>
            <li>
              <b>Kosaraju:</b> (1) DFS on G and record finish times. (2) Build
              Gᵀ by reversing every edge. (3) DFS on Gᵀ, starting new trees in
              decreasing finish-time order. Each tree is one SCC.
            </li>
            <li>Time Θ(V + E), with two DFS passes and one transpose.</li>
            <li>
              Tarjan's algorithm finds SCCs in a single DFS using low-link
              values, the same idea as biconnected components.
            </li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "The component graph",
        body: (
          <ul>
            <li>
              Shrink every SCC to a single node. The result, the condensation,
              is always a DAG: if it had a cycle, those SCCs would be one SCC.
            </li>
            <li>
              So every directed graph is a DAG of strongly connected pieces. The
              lab draws it at the end of the SCC run.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Worked example (textbook graph)",
        body: (
          <>
            <p>
              Vertices a…h with edges ab, bc, be, bf, cd, cg, dc, dh, ea, ef,
              fg, gf, gh.
            </p>
            <div className="u1-formula">
              SCCs: {"{a, b, e}"} {"{c, d}"} {"{f, g}"} {"{h}"}
            </div>
            <p>
              For example a → b → e → a is a cycle, so those three reach each
              other. No edge returns from {"{c, d}"} to {"{a, b, e}"}, so they
              are separate SCCs.
            </p>
          </>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Running the undirected algorithm on a directed graph. Reaching v
              from u does not mean v reaches u.
            </li>
            <li>
              Processing pass 2 of Kosaraju in increasing rather than decreasing
              finish order.
            </li>
            <li>
              Forgetting isolated vertices: each one is a component by itself.
            </li>
          </ul>
        ),
      },
    ],
  },
  topological: {
    syllabus: "Topological sorting of DAGs",
    intro:
      "A topological sort of a directed acyclic graph (DAG) is a linear order of its vertices in which every edge u → v has u before v. It answers “in what order can these dependent tasks be done?”, and it exists if and only if the graph has no directed cycle.",
    cards: [
      {
        icon: "def",
        title: "Kahn's algorithm (in-degree)",
        body: (
          <>
            <Code>{`compute in-degree of every vertex
Q ← all vertices with in-degree 0
while Q ≠ ∅
  u ← DEQUEUE(Q); output u
  for each edge u → v
    in[v] ← in[v] − 1
    if in[v] = 0: ENQUEUE(Q, v)
if fewer than V vertices were output: a cycle exists`}</Code>
          </>
        ),
      },
      {
        icon: "def",
        title: "DFS method",
        body: (
          <ul>
            <li>
              Run DFS; when a vertex <b>finishes</b>, put it at the <b>front</b>{" "}
              of a list.
            </li>
            <li>
              The list in decreasing order of finish time is a topological
              order.
            </li>
            <li>
              Why: for every edge u → v in a DAG, f[v] &lt; f[u], because v
              finishes before u can.
            </li>
            <li>
              A back edge during the DFS means a cycle, so no order exists.
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Facts",
        body: (
          <ul>
            <li>Both methods run in Θ(V + E).</li>
            <li>
              Every DAG has at least one source (in-degree 0) and one sink
              (out-degree 0).
            </li>
            <li>
              The order is unique ⇔ the DAG has a Hamiltonian path, that is,
              every consecutive pair in the order is joined by an edge.
            </li>
            <li>
              Topological order also drives DAG shortest paths and longest
              (critical) paths in project scheduling.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Worked example: course prerequisites",
        body: (
          <>
            <p>
              Edges: Prog→DS, Prog→OS, DS→Algo, Disc→Algo, DS→DB, OS→Comp,
              Algo→Comp, Algo→ML, Disc→ML.
            </p>
            <div className="u1-formula">
              Kahn: Prog, Disc, DS, OS, Algo, DB, Comp, ML
            </div>
            <p>
              Adding Algo → DS creates the cycle DS → Algo → DS. Kahn's
              algorithm then gets stuck with DS, Algo and everything after them
              unprocessed.
            </p>
          </>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Using increasing finish time in the DFS method. You need{" "}
              <i>decreasing</i> finish time.
            </li>
            <li>
              Topologically sorting an undirected graph or a graph with a cycle.
              It is undefined for both.
            </li>
            <li>Believing the topological order is unique.</li>
          </ul>
        ),
      },
    ],
  },
  biconnected: {
    syllabus: "Biconnected components",
    intro:
      "A connected undirected graph is biconnected if removing any single vertex leaves it connected. The vertices whose removal does disconnect it are articulation points (cut vertices). Biconnected components are the maximal biconnected pieces; they share articulation points, and each edge belongs to exactly one of them.",
    cards: [
      {
        icon: "def",
        title: "Low-link values",
        body: (
          <>
            <div className="u1-formula">
              low[u] = min( disc[u], disc[w] for back edges (u, w), low[c] for
              DFS children c )
            </div>
            <p>
              low[u] is the earliest-discovered vertex that u’s DFS subtree can
              reach using at most one back edge.
            </p>
          </>
        ),
      },
      {
        icon: "key",
        title: "The three tests",
        body: (
          <ul>
            <li>
              <b>Non-root u is an articulation point</b> ⇔ it has a DFS child v
              with low[v] ≥ disc[u].
            </li>
            <li>
              <b>The root is an articulation point</b> ⇔ it has at least two DFS
              children.
            </li>
            <li>
              <b>Edge (u, v) is a bridge</b> ⇔ low[v] &gt; disc[u].
            </li>
            <li>
              <b>Biconnected components:</b> push edges on a stack as DFS sees
              them. When low[v] ≥ disc[u] after returning from v, pop edges down
              to (u, v); those edges form one component.
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Cost and use",
        body: (
          <ul>
            <li>
              One DFS: Θ(V + E). The naive alternative removes each vertex and
              re-checks connectivity, costing O(V·(V + E)).
            </li>
            <li>
              Uses: network reliability (single points of failure), road and
              power networks, and planarity testing.
            </li>
            <li>
              A graph is 2-vertex-connected ⇔ it is connected, has at least 3
              vertices and has no articulation point.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Worked example (the lab’s graph)",
        body: (
          <>
            <p>
              Triangles A-B-C, D-E-F and G-H-I, joined by edges B–D and E–G,
              with a pendant edge I–J.
            </p>
            <div className="u1-formula">
              articulation points: B, D, E, G, I{"\n"}bridges: B–D, E–G, I–J
              {"\n"}BCCs: {"{A,B,C} {B,D} {D,E,F} {E,G} {G,H,I} {I,J}"}
            </div>
            <p>A bridge is itself a two-vertex biconnected component.</p>
          </>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Applying the low[v] ≥ disc[u] test to the root. The root needs the
              two-children rule instead.
            </li>
            <li>Using low[w] rather than disc[w] for a back edge (u, w).</li>
            <li>
              Thinking every articulation point has a bridge next to it. Vertex
              B of a “bow tie” (two triangles sharing B) is a cut vertex with no
              bridge.
            </li>
          </ul>
        ),
      },
    ],
  },
  shortest: {
    syllabus: "Single source shortest path",
    intro:
      "Given a weighted directed graph and a source s, find the minimum-weight path from s to every vertex. Shortest paths have optimal substructure: a prefix of a shortest path is itself a shortest path. All the classic algorithms are built from one operation, relaxation, and differ only in the order in which they relax edges.",
    cards: [
      {
        icon: "def",
        title: "Relaxation",
        body: (
          <>
            <Code>{`RELAX(u, v, w)
  if d[v] > d[u] + w(u, v)
    d[v] ← d[u] + w(u, v)
    π[v] ← u`}</Code>
            <p style={{ marginTop: 8 }}>
              d[v] is always an upper bound on the true distance δ(s, v) and
              only ever decreases. The π pointers form the shortest-path tree.
            </p>
          </>
        ),
      },
      {
        icon: "key",
        title: "Dijkstra (non-negative weights)",
        body: (
          <ul>
            <li>
              Repeatedly extract the unsettled vertex u with the smallest d[u],
              mark it settled, and relax all its outgoing edges.
            </li>
            <li>
              This greedy choice is safe only when every w ≥ 0: no later path
              can then become cheaper.
            </li>
            <li>
              Time: O(V²) with an array; O((V + E) log V) with a binary heap;
              O(E + V log V) with a Fibonacci heap.
            </li>
            <li>
              With negative edges it can give wrong answers. The lab shows this
              on the textbook graph.
            </li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "Bellman–Ford (any weights)",
        body: (
          <ul>
            <li>
              Relax every edge |V| − 1 times. After pass i, every shortest path
              using at most i edges is correct.
            </li>
            <li>
              One extra pass: if any edge can still be relaxed, a negative cycle
              is reachable from s, and no shortest paths exist.
            </li>
            <li>Time Θ(V·E). It can stop early when a pass changes nothing.</li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "DAG shortest paths",
        body: (
          <ul>
            <li>
              Topologically sort, then relax the edges leaving each vertex in
              that order.
            </li>
            <li>
              Each edge is relaxed once: Θ(V + E). Negative weights are fine
              because there are no cycles.
            </li>
            <li>
              Negating the weights gives longest paths, which is the critical
              path in project scheduling.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Worked examples (textbook graphs)",
        wide: true,
        body: (
          <div className="u1-two-col">
            <div>
              <p>
                <b>Dijkstra</b> from s on edges s→t 10, s→y 5, t→x 1, t→y 2, x→z
                4, y→t 3, y→x 9, y→z 2, z→s 7, z→x 6:
              </p>
              <div className="u1-formula">d = s 0, t 8, x 9, y 5, z 7</div>
              <p>Settling order: s, y, z, t, x.</p>
            </div>
            <div>
              <p>
                <b>Bellman–Ford</b> on the graph with negative edges (t→z −4,
                x→t −2, y→x −3):
              </p>
              <div className="u1-formula">d = s 0, t 2, x 4, y 7, z −2</div>
              <p>
                Change z→x to −7 and the cycle x → t → z → x has weight −13,
                which Bellman–Ford reports as a negative cycle.
              </p>
            </div>
          </div>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>
              Using Dijkstra with negative edges, or “fixing” it by adding a
              constant to every weight. That changes which path is shortest.
            </li>
            <li>
              Skipping the final check pass of Bellman–Ford, which is the only
              thing that detects a negative cycle.
            </li>
            <li>
              Forgetting that BFS already solves the unweighted case in Θ(V +
              E).
            </li>
          </ul>
        ),
      },
    ],
  },
};

export function hasUnit3Theory(topic: string) {
  return topic in notes;
}
export function Unit3Theory({ topic }: { topic: string }) {
  const n = notes[topic];
  return n ? <NotesPanel note={n} unit="III" /> : null;
}
