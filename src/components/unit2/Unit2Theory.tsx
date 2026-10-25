import { Code, NotesPanel, type Note } from "../unit1/TheoryNotes";

/* Theory notes for Unit II, written against the syllabus:
 * "Searching and Sorting: Binary search trees, AVL trees and red-black trees, B-trees, hashing, Priority queues, heaps.
 *  Sorting: comparison-based sorting - quick sort, heap sort, merge sort: worst and average case analysis.
 *  Sorting in linear time - radix sort, bucket sort, counting sort. String Operations: Boyer–Moore, KMP." */

const notes: Record<string, Note> = {
  sorting: {
    syllabus:
      "Comparison-based sorting: quick sort, heap sort, merge sort — worst and average case analysis",
    intro:
      "A comparison sort learns about the order of keys only by comparing pairs of them. Quick sort, merge sort and heap sort are the three classic Θ(n log n) designs, but they reach that bound in different ways and behave differently on bad inputs. Analysing them means separating the worst case (the most expensive input of size n) from the average case (the expected cost when all n! input orders are equally likely).",
    cards: [
      {
        icon: "def",
        title: "Quick sort",
        body: (
          <>
            <Code>{`QuickSort(A, lo, hi)
  if lo < hi
    p ← Partition(A, lo, hi)
    QuickSort(A, lo, p − 1)
    QuickSort(A, p + 1, hi)

Partition(A, lo, hi)         // Lomuto
  x ← A[hi];  i ← lo − 1
  for j ← lo to hi − 1
    if A[j] ≤ x
      i ← i + 1; swap A[i], A[j]
  swap A[i + 1], A[hi]
  return i + 1`}</Code>
            <p style={{ marginTop: 8 }}>
              Partitioning n keys costs n − 1 comparisons. All the work is in
              dividing; combining costs nothing.
            </p>
          </>
        ),
      },
      {
        icon: "math",
        title: "Quick sort: worst, best and average case",
        body: (
          <ul>
            <li>
              <b>Worst case:</b> every split is 0 : n − 1, for example sorted
              input with the last key as pivot. T(n) = T(n − 1) + Θ(n) = Θ(n²),
              exactly n(n − 1)/2 comparisons.
            </li>
            <li>
              <b>Best case:</b> every split is even. T(n) = 2T(n/2) + Θ(n) = Θ(n
              log n).
            </li>
            <li>
              <b>Average case:</b> over random inputs the expected number of
              comparisons is about 2n ln n ≈ 1.39·n log₂ n = Θ(n log n). Even a
              fixed 9 : 1 split gives Θ(n log n), because the recursion depth is
              still log<sub>10/9</sub> n.
            </li>
            <li>
              A <b>random pivot</b> makes the expected time Θ(n log n) for{" "}
              <i>every</i> input.
            </li>
            <li>Space: O(log n) stack on average, Θ(n) in the worst case.</li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Merge sort and heap sort",
        body: (
          <ul>
            <li>
              <b>Merge sort:</b> T(n) = 2T(n/2) + Θ(n) = Θ(n log n) in the best,
              average and worst case. The split is always exactly in half, so no
              input is bad. It uses Θ(n) extra space and is stable.
            </li>
            <li>
              <b>Heap sort:</b> build a max-heap in Θ(n), then perform n − 1
              extract-max operations at O(log n) each, Θ(n log n) worst case. It
              runs in place with Θ(1) extra space, but it is not stable.
            </li>
            <li>
              Merge sort and heap sort meet the Ω(n log n) lower bound in the
              worst case, so they are asymptotically optimal comparison sorts.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Worked example: quick sort on sorted input",
        wide: true,
        body: (
          <div className="u1-two-col">
            <div>
              <p>
                Sort ⟨1, 2, …, 10⟩ with the last key as pivot. Each partition
                compares every other key with the pivot and puts them all on the
                left:
              </p>
              <p className="u1-formula">
                9 + 8 + 7 + … + 1 = 10·9/2 = 45 comparisons
              </p>
            </div>
            <div>
              <p>
                Random orders of 10 keys average about 25 comparisons, near n
                log₂ n ≈ 33 and far below 45.
              </p>
              <p>
                Choose “Already sorted” in the lab above with n = 10 and the
                counter shows 45. Switch the pivot to the middle key and the
                same input needs fewer than 30.
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
              “Quick sort is O(n log n).” Only on average; its worst case is
              Θ(n²).
            </li>
            <li>
              Calling heap sort stable, or merge sort in place. Both are false
              for the standard versions.
            </li>
            <li>
              Confusing best case and average case. The average case is an
              expectation over all inputs, not the typical input.
            </li>
          </ul>
        ),
      },
      {
        icon: "exam",
        title: "Exam checklist",
        body: (
          <ul>
            <li>Write the recurrence for each case and solve it.</li>
            <li>
              Name the input that triggers quick sort's worst case for your
              pivot rule.
            </li>
            <li>
              Compare the three sorts on time (best, average, worst), extra
              space, stability and whether they run in place.
            </li>
          </ul>
        ),
      },
    ],
  },
  linear: {
    syllabus: "Sorting in linear time: radix sort, bucket sort, counting sort",
    intro:
      "Every comparison sort needs Ω(n log n) comparisons in the worst case. Counting, radix and bucket sort run in linear time because they do not compare keys: they use the key values as array positions. That only works with extra knowledge about the keys, such as a small integer range, a fixed number of digits or a uniform distribution.",
    cards: [
      {
        icon: "math",
        title: "The Ω(n log n) lower bound",
        body: (
          <>
            <p>
              Model any comparison sort as a binary <b>decision tree</b>. It
              must have a leaf for each of the n! input orders, and a binary
              tree of height h has at most 2ʰ leaves, so:
            </p>
            <div className="u1-formula">
              2ʰ ≥ n! ⇒ h ≥ log₂(n!) = Θ(n log n)
            </div>
            <p>by Stirling's approximation, or because n! ≥ (n/2)^(n/2).</p>
          </>
        ),
      },
      {
        icon: "def",
        title: "Counting sort",
        body: (
          <>
            <Code>{`CountingSort(A, B, k)       // keys in 0..k
  C[0..k] ← 0
  for j ← 1 to n:  C[A[j]]++
  for i ← 1 to k:  C[i] += C[i − 1]
  for j ← n downto 1:
    B[C[A[j]]] ← A[j];  C[A[j]]−−`}</Code>
            <p style={{ marginTop: 8 }}>
              Time and space Θ(n + k). It is <b>stable</b> because the last loop
              runs from right to left. Use it when k = O(n).
            </p>
          </>
        ),
      },
      {
        icon: "def",
        title: "Radix sort",
        body: (
          <ul>
            <li>
              Sort on the <b>least significant digit first</b>, then the next
              one, using a <b>stable</b> sort (counting sort) for each pass.
            </li>
            <li>
              For d digits in base k: Θ(d(n + k)). With d constant and k = O(n),
              that is Θ(n).
            </li>
            <li>
              For b-bit keys, using r bits per digit: Θ((b/r)(n + 2ʳ)). Choosing
              r ≈ log₂ n gives Θ(bn / log n).
            </li>
            <li>
              It is correct only because each pass is stable: ties on the
              current digit keep the order from earlier passes.
            </li>
          </ul>
        ),
      },
      {
        icon: "def",
        title: "Bucket sort",
        body: (
          <ul>
            <li>Assumes keys are drawn uniformly from [0, 1).</li>
            <li>
              Make n buckets; put x into bucket ⌊n·x⌋; insertion-sort each
              bucket; concatenate the buckets in order.
            </li>
            <li>
              The expected time is Θ(n), because each bucket holds O(1) keys on
              average (E[nᵢ²] = 2 − 1/n).
            </li>
            <li>
              The worst case is Θ(n²), when every key lands in the same bucket.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Worked example: counting sort",
        wide: true,
        body: (
          <div className="u1-two-col">
            <div>
              <p>A = ⟨2, 5, 3, 0, 2, 3, 0, 3⟩, k = 5.</p>
              <p>
                Counts C = [2, 0, 2, 3, 0, 1]. Prefix sums C = [2, 2, 4, 7, 7,
                8]: for example, 7 keys are ≤ 3.
              </p>
            </div>
            <div>
              <p>
                Scanning from the right, the last 3 goes to position C[3] = 7
                (1-based), C[3] becomes 6, and so on.
              </p>
              <p>
                Result: ⟨0, 0, 2, 2, 3, 3, 3, 5⟩. Equal keys come out in their
                original order. The lab tags them a, b, c to show this.
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
              Using counting sort when k is huge, for example 32-bit keys: then
              k ≫ n and Θ(n + k) is terrible.
            </li>
            <li>
              Radix sort from the most significant digit with the same simple
              method: that gives a wrong order.
            </li>
            <li>
              Saying linear sorts “break” the lower bound. They avoid it,
              because the bound only applies to comparison sorts.
            </li>
          </ul>
        ),
      },
    ],
  },
  trees: {
    syllabus: "Binary search trees, AVL trees and red-black trees, B-trees",
    intro:
      "A search tree keeps keys in an order that lets every operation follow a single root-to-leaf path, so the cost of search, insert and delete is O(height). Plain BSTs can become as tall as n. Balanced trees (AVL, red-black, B-trees) add a rule plus a repair procedure that keep the height at O(log n) whatever the insertion order.",
    cards: [
      {
        icon: "def",
        title: "Binary search tree",
        body: (
          <ul>
            <li>
              <b>BST property:</b> keys in the left subtree &lt; node &lt; keys
              in the right subtree.
            </li>
            <li>
              In-order traversal visits the keys in sorted order, in Θ(n) time.
            </li>
            <li>
              <b>Delete</b> has three cases. A leaf is removed. A node with one
              child is spliced out. A node with two children is replaced by its
              in-order successor (the minimum of its right subtree), which is
              then deleted from its old place.
            </li>
            <li>
              Height: about 2 ln n on average for random insertion orders, but n
              − 1 for sorted input.
            </li>
          </ul>
        ),
      },
      {
        icon: "def",
        title: "AVL tree and rotations",
        body: (
          <>
            <p>
              Every node has a <b>balance factor</b> h(left) − h(right) of −1, 0
              or +1. After an insertion, the lowest unbalanced ancestor is fixed
              by one of:
            </p>
            <ul>
              <li>
                <b>LL</b> (left child's left subtree grew): single right
                rotation.
              </li>
              <li>
                <b>RR:</b> single left rotation.
              </li>
              <li>
                <b>LR:</b> left rotation at the child, then right rotation at
                the node.
              </li>
              <li>
                <b>RL:</b> right rotation at the child, then left rotation at
                the node.
              </li>
            </ul>
            <p>
              Height &lt; 1.44·log₂(n + 2). An insertion needs at most one
              single or double rotation; a deletion may need O(log n).
            </p>
          </>
        ),
      },
      {
        icon: "def",
        title: "Red-black tree",
        body: (
          <ol>
            <li>Every node is red or black.</li>
            <li>The root is black.</li>
            <li>Every leaf (NIL) is black.</li>
            <li>
              A red node has two black children, so there are never two reds in
              a row.
            </li>
            <li>
              Every path from a node to its descendant NIL leaves has the same
              number of black nodes (its black-height).
            </li>
            <li style={{ listStyle: "none", marginLeft: -18 }}>
              These rules give height ≤ 2·log₂(n + 1): a red-free path has bh
              black nodes, so a subtree holds at least 2^bh − 1 keys, and bh ≥
              h/2. Insertion makes O(log n) recolourings and at most 2
              rotations.
            </li>
          </ol>
        ),
      },
      {
        icon: "def",
        title: "B-trees",
        body: (
          <ul>
            <li>
              A <b>minimum degree t ≥ 2</b>: each node other than the root has t
              − 1 … 2t − 1 keys and t … 2t children; the root has at least 1
              key.
            </li>
            <li>
              All leaves have the same depth. Height h ≤ log<sub>t</sub>((n +
              1)/2).
            </li>
            <li>
              Insert goes top-down and <b>splits every full node it passes</b>:
              the median key moves up to the parent. The tree gets taller only
              when the root splits.
            </li>
            <li>
              A node is sized to fill one disk block, so a search reads only
              O(log<sub>t</sub> n) blocks. This is why databases and file
              systems use B-trees (and B+ trees).
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Worst-case cost comparison",
        wide: true,
        body: (
          <div className="u1-table-wrap">
            <table className="u1-table" style={{ minWidth: 560 }}>
              <thead>
                <tr>
                  <th>Structure</th>
                  <th>Search</th>
                  <th>Insert</th>
                  <th>Delete</th>
                  <th>Height</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>BST</td>
                  <td>O(n)</td>
                  <td>O(n)</td>
                  <td>O(n)</td>
                  <td>log₂ n … n − 1</td>
                </tr>
                <tr>
                  <td>AVL</td>
                  <td>O(log n)</td>
                  <td>O(log n)</td>
                  <td>O(log n)</td>
                  <td>&lt; 1.44 log₂ n</td>
                </tr>
                <tr>
                  <td>Red-black</td>
                  <td>O(log n)</td>
                  <td>O(log n)</td>
                  <td>O(log n)</td>
                  <td>≤ 2 log₂(n + 1)</td>
                </tr>
                <tr>
                  <td>B-tree (min degree t)</td>
                  <td>
                    O(log<sub>t</sub> n) disk reads
                  </td>
                  <td>
                    O(log<sub>t</sub> n) disk reads
                  </td>
                  <td>
                    O(log<sub>t</sub> n) disk reads
                  </td>
                  <td>
                    ≤ log<sub>t</sub>((n + 1)/2)
                  </td>
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
              Assuming a BST is always O(log n). Insert 1, 2, …, n and it
              becomes a chain.
            </li>
            <li>
              Mixing up LR and RL. Name the case by the path from the unbalanced
              node down to the new key.
            </li>
            <li>
              Splitting a B-tree node bottom-up after insertion instead of
              top-down on the way down. Both work, but CLRS uses the top-down
              version.
            </li>
          </ul>
        ),
      },
    ],
  },
  heaps: {
    syllabus: "Priority queues, heaps",
    intro:
      "A priority queue repeatedly hands back the most urgent item. A binary heap implements it with a complete binary tree stored in an array: there are no pointers, the height is ⌊log₂ n⌋, and the most urgent key always sits at the root.",
    cards: [
      {
        icon: "def",
        title: "Heap property and array layout",
        body: (
          <ul>
            <li>
              <b>Max-heap:</b> A[parent(i)] ≥ A[i] for every node, so the
              maximum is at the root. A min-heap reverses the inequality.
            </li>
            <li>
              The tree is <b>complete</b>: every level is full except possibly
              the last, which is filled from the left.
            </li>
            <li>
              0-based: parent(i) = ⌊(i − 1)/2⌋, left = 2i + 1, right = 2i + 2.
              1-based (CLRS): parent = ⌊i/2⌋, left = 2i, right = 2i + 1.
            </li>
            <li>
              A heap is <b>not</b> sorted, and searching for an arbitrary key
              takes O(n).
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Operations",
        body: (
          <ul>
            <li>
              <b>Max:</b> read A[0], Θ(1).
            </li>
            <li>
              <b>Insert:</b> append the key, then sift it up while it beats its
              parent: O(log n).
            </li>
            <li>
              <b>Extract-max:</b> move the last key to the root, then sift it
              down by swapping with the larger child: O(log n).
            </li>
            <li>
              <b>Increase-key:</b> change the key, then sift up: O(log n).
            </li>
            <li>
              <b>Build-heap:</b> sift down nodes ⌊n/2⌋ − 1 down to 0: Θ(n).
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Why build-heap is Θ(n)",
        body: (
          <>
            <p>
              At most ⌈n/2<sup>h+1</sup>⌉ nodes have height h, and sifting one
              of them down costs O(h). The total is:
            </p>
            <div className="u1-formula">
              Σ<sub>h=0..⌊log n⌋</sub> ⌈n/2<sup>h+1</sup>⌉·O(h) = O(n·Σ h/2ʰ) =
              O(2n) = O(n)
            </div>
            <p>Most nodes are near the bottom, where sifting is cheap.</p>
          </>
        ),
      },
      {
        icon: "example",
        title: "Worked example (textbook)",
        body: (
          <>
            <p>
              Build a max-heap from ⟨4, 1, 3, 2, 16, 9, 10, 14, 8, 7⟩. Heapify
              indices 4, 3, 2, 1, 0 (0-based) in that order.
            </p>
            <div className="u1-formula">
              result: ⟨16, 14, 10, 8, 7, 9, 3, 2, 4, 1⟩
            </div>
            <p>
              This is the lab's starting heap. Press Play on “build” to watch
              each sift-down.
            </p>
          </>
        ),
      },
      {
        icon: "key",
        title: "Where priority queues are used",
        body: (
          <ul>
            <li>Heap sort: Θ(n log n) and in place.</li>
            <li>
              Dijkstra's shortest paths and Prim's MST use extract-min and
              decrease-key (Unit IV).
            </li>
            <li>
              Huffman coding repeatedly merges the two smallest frequencies
              (Unit IV).
            </li>
            <li>
              Job scheduling by priority, event-driven simulation, and finding
              the k largest items.
            </li>
          </ul>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistakes",
        body: (
          <ul>
            <li>Using the 1-based parent formula on a 0-based array.</li>
            <li>
              Sifting down by swapping with the <i>first</i> larger child
              instead of the <i>largest</i> child, which breaks the heap.
            </li>
            <li>
              Saying build-heap is Θ(n log n). That bound holds for n inserts,
              not for bottom-up heapify.
            </li>
          </ul>
        ),
      },
    ],
  },
  hashing: {
    syllabus: "Hashing",
    intro:
      "Hashing aims for constant expected time per search, insert and delete by computing where a key lives instead of searching for it. A hash function maps the large universe of keys to m slots. Two keys landing in the same slot (a collision) is unavoidable, so every hash table needs a collision-resolution strategy.",
    cards: [
      {
        icon: "def",
        title: "Hash functions",
        body: (
          <ul>
            <li>
              <b>Division:</b> h(k) = k mod m. Choose m prime and not close to a
              power of 2.
            </li>
            <li>
              <b>Multiplication:</b> h(k) = ⌊m·(k·A mod 1)⌋ with 0 &lt; A &lt;
              1; A ≈ (√5 − 1)/2 works well, and m can be any size.
            </li>
            <li>
              <b>Universal hashing:</b> pick h at random from a family in which
              any two keys collide with probability ≤ 1/m. No fixed input is
              always bad.
            </li>
            <li>
              A good function spreads keys evenly (<b>simple uniform hashing</b>
              ) and is fast to compute.
            </li>
          </ul>
        ),
      },
      {
        icon: "def",
        title: "Collision resolution",
        body: (
          <ul>
            <li>
              <b>Chaining:</b> each slot holds a linked list. Insert at the head
              in O(1); search takes Θ(1 + α) expected time.
            </li>
            <li>
              <b>Open addressing:</b> every key lives in the table itself, and
              you probe h(k, 0), h(k, 1), … until an empty slot.
              <ul>
                <li>
                  <b>Linear:</b> (h(k) + i) mod m. Suffers{" "}
                  <b>primary clustering</b>: long runs of occupied slots.
                </li>
                <li>
                  <b>Quadratic:</b> (h(k) + c₁i + c₂i²) mod m. Suffers secondary
                  clustering, and may not reach every slot.
                </li>
                <li>
                  <b>Double:</b> (h₁(k) + i·h₂(k)) mod m. Closest to ideal
                  uniform probing; h₂(k) must be coprime to m.
                </li>
              </ul>
            </li>
            <li>
              Deleting in open addressing needs a “deleted” marker (tombstone)
              so that later searches keep probing past it.
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Load factor and expected cost",
        body: (
          <>
            <div className="u1-formula">α = n / m (keys per slot)</div>
            <ul>
              <li>
                Chaining, unsuccessful search: 1 + α. Successful search: 1 +
                α/2.
              </li>
              <li>
                Uniform probing, unsuccessful search: ≤ 1/(1 − α). Successful
                search: (1/α)·ln(1/(1 − α)).
              </li>
              <li>Linear probing, unsuccessful search: ≈ ½(1 + 1/(1 − α)²).</li>
              <li>
                Keep α bounded, for example ≤ 0.75, by <b>rehashing</b> into a
                table about twice as large. Each rehash costs Θ(n), but the cost
                per insert is amortised O(1).
              </li>
            </ul>
          </>
        ),
      },
      {
        icon: "example",
        title:
          "Worked example: insert 10, 22, 31, 4, 15, 28, 17, 88, 59 into m = 11",
        wide: true,
        body: (
          <div className="u1-two-col">
            <div>
              <p>
                <b>Linear probing</b> gives slots 0–10: 22, 88, –, –, 4, 15, 28,
                17, 59, 31, 10.
              </p>
              <p>
                <b>Quadratic</b> (c₁ = 1, c₂ = 3) gives 22, –, 88, 17, 4, –, 28,
                59, 15, 31, 10.
              </p>
              <p>
                <b>Double hashing</b> (h₂ = 1 + k mod 10) gives 22, –, 59, 17,
                4, 15, 28, 88, –, 31, 10.
              </p>
            </div>
            <div>
              <p>
                Trace 59 under linear probing: h(59) = 4, and slots 4, 5, 6 and
                7 are taken (4, 15, 28, 17), so 59 lands in slot 8 after 5
                probes. That run of filled slots is primary clustering.
              </p>
              <p>
                The lab's default input is exactly this exercise, so you can
                check every step.
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
              Choosing m = 2ᵖ with the division method. Then h(k) depends only
              on the low bits of k.
            </li>
            <li>Stopping a search at a deleted slot in open addressing.</li>
            <li>
              Claiming hashing is O(1) in the worst case. All keys can collide,
              giving Θ(n); O(1) is the <i>expected</i> time under assumptions.
            </li>
          </ul>
        ),
      },
    ],
  },
  matching: {
    syllabus:
      "String operations: Boyer–Moore, Knuth–Morris–Pratt (KMP) algorithm",
    intro:
      "Given a text T of length n and a pattern P of length m, find every shift s with T[s…s+m−1] = P. The naive method tries every shift and re-compares from scratch. KMP and Boyer–Moore preprocess the pattern so that, after a mismatch, they know how far it is safe to slide.",
    cards: [
      {
        icon: "def",
        title: "Naive matching",
        body: (
          <>
            <Code>{`for s ← 0 to n − m
  j ← 0
  while j < m and T[s + j] = P[j]:  j ← j + 1
  if j = m:  report s`}</Code>
            <p style={{ marginTop: 8 }}>
              Worst case O((n − m + 1)·m), for example T = aaaa…a and P = aa…ab.
              It throws away everything it learned at each shift.
            </p>
          </>
        ),
      },
      {
        icon: "def",
        title: "KMP: the prefix function",
        body: (
          <ul>
            <li>
              π[i] (also written lps[i]) = the length of the longest{" "}
              <b>proper</b> prefix of P[0…i] that is also a suffix of P[0…i].
            </li>
            <li>
              On a mismatch after j matched characters, set j ← π[j − 1] and
              compare the same text character again. The text pointer{" "}
              <b>never moves back</b>.
            </li>
            <li>
              Preprocessing Θ(m), matching Θ(n), Θ(n + m) in total. Amortised
              argument: j rises by at most 1 per text character and can never
              fall more than it rose.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Worked example: π for ABABCABAB",
        body: (
          <>
            <div className="u1-formula">
              i: 0 1 2 3 4 5 6 7 8{"\n"}P: A B A B C A B A B{"\n"}π: 0 0 1 2 0 1
              2 3 4
            </div>
            <p>
              π[8] = 4 because “ABAB” is both a prefix and a suffix of
              ABABCABAB. So after a full match, KMP continues as if 4 characters
              already matched.
            </p>
          </>
        ),
      },
      {
        icon: "def",
        title: "Boyer–Moore",
        body: (
          <ul>
            <li>
              Compare the pattern against the text from <b>right to left</b>.
            </li>
            <li>
              <b>Bad-character rule:</b> if text character c mismatches P[j],
              shift so that the rightmost c in P lines up with it, a shift of j
              − last(c). If c does not occur in P, the pattern jumps past it.
            </li>
            <li>
              <b>Good-suffix rule:</b> if a suffix of P already matched, shift
              to the next place where that suffix (or a prefix of P that matches
              part of it) occurs.
            </li>
            <li>
              Shift by the <b>larger</b> of the two. On large alphabets such as
              English text it often examines only about n/m characters, which is
              sublinear. The basic version's worst case is O(nm); the Galil rule
              makes it O(n + m).
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Comparison",
        wide: true,
        body: (
          <div className="u1-table-wrap">
            <table className="u1-table" style={{ minWidth: 560 }}>
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Preprocessing</th>
                  <th>Matching (worst)</th>
                  <th>Scan direction</th>
                  <th>Best suited to</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Naive</td>
                  <td>none</td>
                  <td>O((n − m + 1)·m)</td>
                  <td>left → right</td>
                  <td>Very short patterns</td>
                </tr>
                <tr>
                  <td>KMP</td>
                  <td>Θ(m) prefix function</td>
                  <td>Θ(n)</td>
                  <td>left → right, never backs up</td>
                  <td>Small alphabets, streams, repetitive text</td>
                </tr>
                <tr>
                  <td>Boyer–Moore</td>
                  <td>Θ(m + |Σ|) tables</td>
                  <td>O(nm) basic, O(n) with Galil rule</td>
                  <td>pattern right → left</td>
                  <td>Large alphabets, long patterns (text editors, grep)</td>
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
              Allowing the whole string as its own prefix in π. It must be a{" "}
              <b>proper</b> prefix, so π[i] ≤ i.
            </li>
            <li>
              Moving the text pointer back in KMP. Only j changes on a mismatch.
            </li>
            <li>
              Using only the bad-character shift when it is zero or negative.
              Always take the maximum with the good-suffix shift, or at least 1.
            </li>
          </ul>
        ),
      },
    ],
  },
};

export function hasUnit2Theory(topic: string) {
  return topic in notes;
}
export function Unit2Theory({ topic }: { topic: string }) {
  const n = notes[topic];
  return n ? <NotesPanel note={n} unit="II" /> : null;
}
