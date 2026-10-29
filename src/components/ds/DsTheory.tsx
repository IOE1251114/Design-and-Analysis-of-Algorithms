import { Code, NotesPanel, type Note } from "../daa/unit1/Unit1Theory";

/* Theory notes for the Data Structures course, one entry per topic, each quoting its syllabus line. */

const notes: Record<string, Note & { unit: string }> = {
  /* ---------------- Unit I ---------------- */
  "ds-basics": {
    unit: "I",
    syllabus:
      "Basic Terminology: Elementary Data Organization, Data Structure Operations, Algorithms Complexity and Time-Space Trade off",
    intro:
      "A data structure is a logical or mathematical model of a particular organisation of data. Choosing one means choosing which operations will be cheap.",
    cards: [
      {
        icon: "def",
        title: "Elementary data organisation",
        body: (
          <ul>
            <li>
              <b>Data item</b>: a single unit of value. <b>Group items</b> split
              into sub-items (Name → First, Last); <b>elementary items</b> do
              not.
            </li>
            <li>
              <b>Field</b> → <b>record</b> → <b>file</b>: a record is the
              collection of field values of one entity; a file is a collection
              of records.
            </li>
            <li>
              A <b>primary key</b> uniquely identifies a record.
            </li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "The basic operations",
        body: (
          <ul>
            <li>
              <b>Traversing</b> (visit every record once), <b>searching</b>,{" "}
              <b>inserting</b>, <b>deleting</b>.
            </li>
            <li>
              <b>Sorting</b> (arrange in order) and <b>merging</b> (combine two
              sorted files).
            </li>
            <li>
              Complexity measures time and space as functions of the input size
              n, usually in the worst case.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Time–space trade-off",
        body: (
          <p>
            Using more memory can make an algorithm faster, and vice versa.
            Example: storing a sorted index of a file lets you binary-search it
            (fast) at the cost of the extra index (space).
          </p>
        ),
      },
    ],
  },
  "ds-array-memory": {
    unit: "I",
    syllabus:
      "Arrays: Array Definition and Analysis, Representation of Linear Arrays in Memory, Single, Two and Multidimensional Arrays",
    intro:
      "A linear array is a list of a finite number n of homogeneous elements stored in successive memory locations, so its elements can be addressed by computation.",
    cards: [
      {
        icon: "math",
        title: "Address formulas",
        body: (
          <>
            <Code>
              {
                "1-D:  LOC(A[K]) = Base + w(K − LB)\nlength = UB − LB + 1\n\n2-D (M × N), row-major:\nLOC(A[J,K]) = Base + w[N(J − 1) + (K − 1)]\n2-D, column-major:\nLOC(A[J,K]) = Base + w[M(K − 1) + (J − 1)]"
              }
            </Code>
          </>
        ),
        wide: true,
      },
      {
        icon: "key",
        title: "Multidimensional arrays",
        body: (
          <p>
            For n dimensions with lengths L₁…Lₙ and effective indices Eᵢ = Kᵢ −
            LBᵢ, row-major uses Horner's rule: offset = (…((E₁L₂ + E₂)L₃ +
            E₃)…)Lₙ + Eₙ. Column-major does the same from the last index.
          </p>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistake",
        body: (
          <p>
            Forgetting to subtract the lower bound. If indices start at 1, A[1]
            is at offset 0, not 1.
          </p>
        ),
      },
    ],
  },
  "ds-array-ops": {
    unit: "I",
    syllabus: "Traversing, Insertion and Deletion in Array",
    intro:
      "Arrays give constant-time access by index, but keeping elements contiguous makes insertion and deletion in the middle expensive.",
    cards: [
      {
        icon: "def",
        title: "Algorithms",
        body: (
          <Code>
            {
              "INSERT(A, N, K, ITEM):\n  for J = N down to K: A[J+1] = A[J]\n  A[K] = ITEM;  N = N + 1\n\nDELETE(A, N, K):\n  ITEM = A[K]\n  for J = K to N−1: A[J] = A[J+1]\n  N = N − 1"
            }
          </Code>
        ),
        wide: true,
      },
      {
        icon: "math",
        title: "Cost",
        body: (
          <p>
            Inserting at position K shifts N − K + 1 elements (1-based): Θ(n) in
            the worst and average case, Θ(1) at the end. Traversal is Θ(n).
          </p>
        ),
      },
      {
        icon: "mistake",
        title: "Shift in the right direction",
        body: (
          <p>
            For insertion shift from the <b>end</b> backwards; shifting forwards
            would overwrite elements before they move.
          </p>
        ),
      },
    ],
  },
  "ds-search": {
    unit: "I",
    syllabus: "Linear Search, Binary Search",
    intro:
      "Searching finds the location of an ITEM in DATA, or reports that it is absent.",
    cards: [
      {
        icon: "def",
        title: "Binary search",
        body: (
          <Code>
            {
              "BEG = LB; END = UB\nwhile BEG ≤ END:\n  MID = ⌊(BEG + END)/2⌋\n  if DATA[MID] = ITEM: return MID\n  if ITEM < DATA[MID]: END = MID − 1\n  else:                BEG = MID + 1\nreturn NOT FOUND"
            }
          </Code>
        ),
        wide: true,
      },
      {
        icon: "math",
        title: "Complexity",
        body: (
          <p>
            Linear search: n comparisons in the worst case, about n/2 on
            average. Binary search: at most ⌊log₂ n⌋ + 1 comparisons (20 for a
            million items).
          </p>
        ),
      },
      {
        icon: "exam",
        title: "Limitations of binary search",
        body: (
          <p>
            It needs the list <b>sorted</b> and <b>direct access</b> to the
            middle element, so it suits arrays, not linked lists, and keeping an
            array sorted makes insertion costly.
          </p>
        ),
      },
    ],
  },
  "ds-sparse": {
    unit: "I",
    syllabus:
      "Sparse Matrix — Transpose, Fast transpose and Matrix multiplication",
    intro:
      "A matrix with many zero entries is sparse. Storing only non-zero entries as (row, column, value) triplets saves space and time.",
    cards: [
      {
        icon: "def",
        title: "Triplet representation",
        body: (
          <p>
            Row 0 of the table holds (rows, columns, number of non-zero terms);
            rows 1…t hold the terms in row-major order.
          </p>
        ),
      },
      {
        icon: "math",
        title: "Transpose vs fast transpose",
        body: (
          <ul>
            <li>
              <b>Simple</b>: for each column c, scan all t terms → Θ(cols · t).
            </li>
            <li>
              <b>Fast</b>: count terms per column (rowTerms), prefix-sum into
              startingPos, then place each term directly → Θ(cols + t).
            </li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "Multiplication",
        body: (
          <p>
            C[i][j] = Σ A[i][k]·B[k][j]. With triplets, only pairs of non-zero
            terms with equal k contribute, so zeros are never multiplied.
            Transposing B first lets both lists be scanned row by row.
          </p>
        ),
      },
    ],
  },
  /* ---------------- Unit II ---------------- */
  "ds-recursion": {
    unit: "II",
    syllabus:
      "Recursion: Introduction to recursion, Problem Solving with Recursion",
    intro:
      "A recursive procedure contains a call to itself. It must have a base criterion where it stops, and each call must move closer to that base.",
    cards: [
      {
        icon: "def",
        title: "Anatomy",
        body: (
          <Code>
            {
              "FACT(N):\n  if N = 0 or N = 1: return 1      ← base case\n  return N × FACT(N − 1)          ← recursive case"
            }
          </Code>
        ),
        wide: true,
      },
      {
        icon: "key",
        title: "How it runs",
        body: (
          <p>
            Each call pushes an activation record (parameters, locals, return
            address) on the stack. Depth of recursion = maximum stack size, so
            recursion costs Θ(depth) memory.
          </p>
        ),
      },
      {
        icon: "mistake",
        title: "Repeated work",
        body: (
          <p>
            FIB(n) = FIB(n − 1) + FIB(n − 2) recomputes the same values: about
            φⁿ calls. Storing results (or iterating) makes it Θ(n).
          </p>
        ),
      },
    ],
  },
  "ds-backtracking": {
    unit: "II",
    syllabus: "Back Tracking",
    intro:
      "Backtracking explores a state-space tree depth-first, extending a partial solution one decision at a time and abandoning it as soon as it cannot lead to a valid solution.",
    cards: [
      {
        icon: "def",
        title: "Template",
        body: (
          <Code>
            {
              "SOLVE(partial):\n  if partial is complete: report it\n  for each choice c:\n    if c keeps partial valid:\n      add c; SOLVE(partial); remove c   ← backtrack"
            }
          </Code>
        ),
        wide: true,
      },
      {
        icon: "example",
        title: "Classic problems",
        body: (
          <p>
            N-Queens, rat in a maze, subset sum, graph colouring, Hamiltonian
            cycles, Sudoku.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Why it is faster than brute force",
        body: (
          <p>
            Pruning cuts whole subtrees: one conflict at row 2 eliminates every
            arrangement of the rows below it.
          </p>
        ),
      },
    ],
  },
  "ds-linked": {
    unit: "II",
    syllabus:
      "Linked Lists: Singly linked list, operations on linked list, Doubly linked list, generalized list, circular linked lists",
    intro:
      "A linked list is a linear collection of nodes where order is given by pointers. Each node has an INFO field and a LINK (next) field; START points to the first node.",
    cards: [
      {
        icon: "def",
        title: "Variants",
        body: (
          <ul>
            <li>
              <b>Singly</b>: one next pointer; last node points to NULL.
            </li>
            <li>
              <b>Doubly</b>: next and prev pointers; can be traversed both ways
              and a known node is deleted in Θ(1).
            </li>
            <li>
              <b>Circular</b>: last node points back to the first; often a
              header node marks the start.
            </li>
            <li>
              <b>Generalized list</b>: elements may be atoms or sublists (tag
              field says which).
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Costs",
        body: (
          <p>
            Insert/delete at the front: Θ(1). Search, insert at position k,
            delete by value: Θ(n) to reach the node. No wasted space for unused
            capacity, but one pointer per node.
          </p>
        ),
      },
      {
        icon: "mistake",
        title: "Pointer order matters",
        body: (
          <p>
            Insert after CUR with <b>NEW.next = CUR.next</b> <i>before</i>{" "}
            <b>CUR.next = NEW</b>; the other order loses the rest of the list.
          </p>
        ),
      },
    ],
  },
  "ds-polynomial": {
    unit: "II",
    syllabus: "Polynomial addition, multiplication",
    intro:
      "A polynomial is stored as a linked list of nodes (coefficient, exponent, link), kept in decreasing order of exponent.",
    cards: [
      {
        icon: "def",
        title: "Addition",
        body: (
          <p>
            Walk both lists with pointers p and q. Equal exponents: add
            coefficients (drop the term if 0) and advance both. Otherwise copy
            the term with the larger exponent and advance that pointer. Θ(m +
            n).
          </p>
        ),
      },
      {
        icon: "key",
        title: "Multiplication",
        body: (
          <p>
            Multiply every term of P by every term of Q (multiply coefficients,
            add exponents) and insert each product into the result, combining
            equal exponents.
          </p>
        ),
      },
      {
        icon: "example",
        title: "Example",
        body: (
          <p>
            (3x² + 2x + 1) + (x² − 2x + 4) = 4x² + 5: the x terms cancel and
            disappear from the list.
          </p>
        ),
      },
    ],
  },
  /* ---------------- Unit III ---------------- */
  "ds-stack": {
    unit: "III",
    syllabus:
      "Stacks: Operations Associated with Stacks Push & Pop, Array representation of stacks, linked list representation of stacks",
    intro:
      "A stack is a linear list in which insertions and deletions take place only at one end, the TOP. It is last-in, first-out (LIFO).",
    cards: [
      {
        icon: "def",
        title: "Array representation",
        body: (
          <Code>
            {
              "PUSH(STACK, TOP, MAX, ITEM):\n  if TOP = MAX: OVERFLOW\n  TOP = TOP + 1; STACK[TOP] = ITEM\n\nPOP(STACK, TOP):\n  if TOP = 0: UNDERFLOW\n  ITEM = STACK[TOP]; TOP = TOP − 1"
            }
          </Code>
        ),
        wide: true,
      },
      {
        icon: "key",
        title: "Linked representation",
        body: (
          <p>
            The head of a singly linked list is the top: push inserts at the
            front, pop deletes from the front. No fixed MAX; overflow only when
            memory (AVAIL) is exhausted.
          </p>
        ),
      },
      {
        icon: "example",
        title: "Uses",
        body: (
          <p>
            Function calls and recursion, expression conversion and evaluation,
            undo, backtracking (maze), parenthesis matching.
          </p>
        ),
      },
    ],
  },
  "ds-hanoi": {
    unit: "III",
    syllabus: "Tower of Hanoi problem",
    intro:
      "Move n disks from peg A to peg C using B, one disk at a time, never putting a larger disk on a smaller one.",
    cards: [
      {
        icon: "def",
        title: "Recursive solution",
        body: (
          <Code>
            {
              "TOWER(N, BEG, AUX, END):\n  if N = 1: move BEG → END; return\n  TOWER(N − 1, BEG, END, AUX)\n  move BEG → END\n  TOWER(N − 1, AUX, BEG, END)"
            }
          </Code>
        ),
        wide: true,
      },
      {
        icon: "math",
        title: "Number of moves",
        body: (
          <p>
            T(1) = 1, T(n) = 2T(n − 1) + 1, so T(n) = 2ⁿ − 1. Recursion depth is
            n, so the stack holds at most n frames.
          </p>
        ),
      },
    ],
  },
  "ds-queue": {
    unit: "III",
    syllabus:
      "Representation of Queues, Operations of queues: Create, Add, Delete, Front, Empty, Dequeue",
    intro:
      "A queue is a linear list where deletions happen at the FRONT and insertions at the REAR: first-in, first-out (FIFO).",
    cards: [
      {
        icon: "def",
        title: "Operations",
        body: (
          <p>
            <b>Create</b> an empty queue, <b>Add</b> (enqueue) at REAR,{" "}
            <b>Delete</b> (dequeue) from FRONT, <b>Front</b> returns the first
            item, <b>Empty</b> tests for no items.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Circular queue",
        body: (
          <Code>
            {
              "ADD:    REAR = (REAR + 1) mod N; Q[REAR] = ITEM\nDELETE: ITEM = Q[FRONT]; FRONT = (FRONT + 1) mod N\nfull when count = N, empty when count = 0"
            }
          </Code>
        ),
        wide: true,
      },
      {
        icon: "example",
        title: "Deque",
        body: (
          <p>
            A double-ended queue allows insertion and deletion at both ends.
            Input-restricted deques insert at one end only; output-restricted
            deques delete at one end only.
          </p>
        ),
      },
    ],
  },
  "ds-pq": {
    unit: "III",
    syllabus: "Priority Queues and Heaps",
    intro:
      "In a priority queue each element has a priority; the element of highest priority is processed first, and equal priorities are served in arrival order.",
    cards: [
      {
        icon: "def",
        title: "Representations",
        body: (
          <ul>
            <li>One-way list sorted by priority: delete Θ(1), insert Θ(n).</li>
            <li>Array of queues, one per priority level.</li>
            <li>Binary heap: insert and delete O(log n) — the usual choice.</li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "Heap property",
        body: (
          <p>
            In a max-heap every parent is ≥ its children, so the maximum sits at
            the root. Stored level by level in an array: children of i are 2i
            and 2i + 1 (1-based).
          </p>
        ),
      },
    ],
  },
  "ds-expressions": {
    unit: "III",
    syllabus: "Applications of Stack & Queues — Infix, Prefix and Postfix",
    intro:
      "Infix puts operators between operands (A + B), prefix (Polish) before them (+ A B), postfix (reverse Polish) after them (A B +). Pre- and postfix need no parentheses.",
    cards: [
      {
        icon: "def",
        title: "Infix → postfix",
        body: (
          <Code>
            {
              "scan left to right:\n  operand  → output\n  (        → push\n  )        → pop to output until (\n  operator → pop operators of higher (or equal,\n             if left-assoc) precedence, then push\nat the end pop everything"
            }
          </Code>
        ),
        wide: true,
      },
      {
        icon: "key",
        title: "Evaluating postfix",
        body: (
          <p>
            Scan left to right: push operands; on an operator pop B, then A,
            push A op B. The single value left is the result. Θ(n).
          </p>
        ),
      },
      {
        icon: "exam",
        title: "Worked example",
        body: (
          <p>
            A + B * (C − D) / E → postfix A B C D − * E / +, prefix + A / * B −
            C D E.
          </p>
        ),
      },
    ],
  },
  "ds-maze": {
    unit: "III",
    syllabus: "Applications of Stack & Queues — Maze Problem",
    intro:
      "Find a path from the entrance to the exit of a maze stored as a 2-D array where 1 (or #) marks a wall.",
    cards: [
      {
        icon: "def",
        title: "Stack (backtracking)",
        body: (
          <p>
            Push the start. Repeatedly pop a cell, mark it visited and push its
            open, unvisited neighbours. A dead end simply means the next pop
            returns to an earlier branch.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Queue (breadth-first)",
        body: (
          <p>
            Replacing the stack by a queue explores cells in order of distance
            from the start, so the first time the exit is reached the path is a
            shortest one.
          </p>
        ),
      },
      {
        icon: "math",
        title: "Cost",
        body: (
          <p>
            Each cell enters the stack or queue at most once: Θ(rows × columns)
            time and space.
          </p>
        ),
      },
    ],
  },
  /* ---------------- Unit IV ---------------- */
  "ds-tree-basics": {
    unit: "IV",
    syllabus:
      "Trees — Mathematical properties, Complete Binary trees, Extended binary trees, Traversing binary trees, Path length",
    intro:
      "A binary tree is either empty or a root with a left and a right subtree, each itself a binary tree.",
    cards: [
      {
        icon: "math",
        title: "Properties",
        body: (
          <ul>
            <li>n nodes → n − 1 edges.</li>
            <li>
              At most 2ˡ nodes on level l, at most 2ᵈ − 1 nodes in a tree of
              depth d.
            </li>
            <li>Depth of a complete tree with n nodes: ⌊log₂ n⌋ + 1.</li>
            <li>n₀ = n₂ + 1 (leaves = nodes with two children + 1).</li>
          </ul>
        ),
      },
      {
        icon: "def",
        title: "Complete and extended trees",
        body: (
          <p>
            A <b>complete</b> tree fills every level except possibly the last,
            which is filled from the left; it fits in an array. An{" "}
            <b>extended</b> (2-) tree replaces every empty subtree with an
            external node, so every internal node has two children.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Path length",
        body: (
          <p>
            Internal path length I sums the depths of internal nodes, external
            path length E those of external nodes. For n internal nodes,{" "}
            <b>E = I + 2n</b>.
          </p>
        ),
      },
      {
        icon: "exam",
        title: "Traversals",
        body: (
          <p>
            Preorder N L R, inorder L N R, postorder L R N (all recursive or
            with a stack), level order with a queue. Each visits every node
            once: Θ(n).
          </p>
        ),
      },
    ],
  },
  "ds-expression-tree": {
    unit: "IV",
    syllabus:
      "Binary Search Trees and their representation, expression evaluation",
    intro:
      "An arithmetic expression can be drawn as a binary tree: each operator is an internal node whose subtrees are its operands.",
    cards: [
      {
        icon: "def",
        title: "Building one",
        body: (
          <p>
            Convert to postfix, then scan it with a stack of subtrees: an
            operand becomes a one-node tree; an operator pops two trees and
            becomes their parent.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Evaluating it",
        body: (
          <p>
            Post-order: evaluate the left and right subtrees, then apply the
            operator at the node. The root's value is the value of the
            expression.
          </p>
        ),
      },
      {
        icon: "example",
        title: "Three notations",
        body: (
          <p>
            Preorder gives prefix, inorder (with parentheses) gives infix,
            postorder gives postfix — the same tree, three walks.
          </p>
        ),
      },
    ],
  },
  "ds-bst": {
    unit: "IV",
    syllabus:
      "Searching, Insertion and Deletion in binary search trees, Complexity of searching algorithm, AVL trees, B trees",
    intro:
      "In a binary search tree every key in the left subtree of N is less than N and every key in the right subtree is greater.",
    cards: [
      {
        icon: "def",
        title: "Operations",
        body: (
          <ul>
            <li>
              <b>Search / insert</b>: compare and go left or right until found
              or an empty spot.
            </li>
            <li>
              <b>Delete</b>: a leaf is removed; a node with one child is
              bypassed; a node with two children is replaced by its in-order
              successor.
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Complexity",
        body: (
          <p>
            O(h) for height h: about log₂ n for random insertions, but n for
            sorted input (a degenerate chain). AVL trees keep |balance factor| ≤
            1 with rotations; B-trees of order m keep all leaves at one level by
            splitting full nodes.
          </p>
        ),
      },
    ],
  },
  "ds-huffman": {
    unit: "IV",
    syllabus: "Huffman's algorithm",
    intro:
      "Given weights w₁…wₙ, Huffman's algorithm builds an extended binary tree with these weights on its external nodes that minimises the weighted path length P = Σ wᵢ·Lᵢ.",
    cards: [
      {
        icon: "def",
        title: "Algorithm",
        body: (
          <p>
            Repeat n − 1 times: remove the two subtrees of smallest weight and
            join them under a new node whose weight is their sum. With a
            min-heap this is O(n log n).
          </p>
        ),
      },
      {
        icon: "key",
        title: "Codes",
        body: (
          <p>
            Label left edges 0 and right edges 1. The path to each leaf is a
            prefix-free code; frequent symbols get short codes, giving the
            shortest possible average code length.
          </p>
        ),
      },
    ],
  },
  "ds-general-threaded": {
    unit: "IV",
    syllabus: "General trees, Threaded trees",
    intro:
      "A general tree's nodes can have any number of children. A threaded binary tree reuses the n + 1 empty pointers of a binary tree.",
    cards: [
      {
        icon: "def",
        title: "General → binary",
        body: (
          <p>
            Keep two pointers per node: <b>left = first child</b>,{" "}
            <b>right = next sibling</b>. The conversion is one-to-one, and the
            preorder of both trees is the same.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Threads",
        body: (
          <p>
            In an in-order threaded tree, an empty left pointer points to the
            in-order predecessor and an empty right pointer to the in-order
            successor; a flag bit distinguishes threads from real links.
          </p>
        ),
      },
      {
        icon: "example",
        title: "Benefit",
        body: (
          <p>
            In-order traversal needs no stack or recursion: from a node, follow
            its right thread, or go right once and then left as far as possible.
          </p>
        ),
      },
    ],
  },
  "ds-trie": {
    unit: "IV",
    syllabus: "Trie data structure",
    intro:
      "A trie (prefix tree) stores strings by their characters: the path from the root to a node spells a prefix, and a flag marks nodes where a stored word ends.",
    cards: [
      {
        icon: "def",
        title: "Operations",
        body: (
          <ul>
            <li>
              <b>Insert</b>: follow or create one child per character, then mark
              the last node.
            </li>
            <li>
              <b>Search</b>: follow the characters; the key is present only if
              the walk finishes on a marked node.
            </li>
            <li>
              <b>Prefix query</b>: every word in the subtree below the prefix
              node.
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Cost",
        body: (
          <p>
            Θ(m) for a key of length m, independent of how many keys are stored.
            Space grows with the total number of distinct prefixes.
          </p>
        ),
      },
      {
        icon: "example",
        title: "Uses",
        body: (
          <p>
            Autocomplete, spell checkers, dictionaries and IP routing tables.
          </p>
        ),
      },
    ],
  },
  /* ---------------- Unit V ---------------- */
  "ds-elementary-sorts": {
    unit: "V",
    syllabus: "Sorting: Bubble Sorting, Selection Sorting, Insertion Sort",
    intro:
      "Sorting arranges records by a key. The three elementary methods are simple, in place, and quadratic in the worst case.",
    cards: [
      {
        icon: "def",
        title: "How each works",
        body: (
          <ul>
            <li>
              <b>Bubble</b>: compare neighbours and swap; each pass moves the
              largest remaining value to the end.
            </li>
            <li>
              <b>Selection</b>: find the minimum of the unsorted part and swap
              it to the front.
            </li>
            <li>
              <b>Insertion</b>: insert each element into the sorted prefix by
              shifting larger ones right.
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Complexity",
        body: (
          <p>
            All Θ(n²) comparisons in the worst case. Bubble (with a swap flag)
            and insertion are Θ(n) on sorted input; selection always makes n(n −
            1)/2 comparisons but at most n − 1 swaps.
          </p>
        ),
      },
      {
        icon: "exam",
        title: "Stability",
        body: (
          <p>
            Bubble and insertion sort are stable; selection sort is not, because
            a long-distance swap can jump equal keys.
          </p>
        ),
      },
    ],
  },
  "ds-advanced-sorts": {
    unit: "V",
    syllabus: "Quick sort, two-way Merge sort, Heap sort",
    intro:
      "Divide-and-conquer and heap-based sorts reach Θ(n log n) on average.",
    cards: [
      {
        icon: "def",
        title: "Three methods",
        body: (
          <ul>
            <li>
              <b>Quick sort</b>: partition around a pivot, recurse on both
              sides. Average Θ(n log n), worst Θ(n²).
            </li>
            <li>
              <b>Two-way merge sort</b>: split in half, sort each, merge. Always
              Θ(n log n), needs Θ(n) extra space, stable.
            </li>
            <li>
              <b>Heap sort</b>: build a max-heap, swap the root to the end,
              re-heapify. Θ(n log n), in place, not stable.
            </li>
          </ul>
        ),
      },
    ],
  },
  "ds-keys-external": {
    unit: "V",
    syllabus: "Sorting on different keys, External sorting",
    intro:
      "Real files are sorted on several fields, and are often far larger than main memory.",
    cards: [
      {
        icon: "def",
        title: "Sorting on several keys",
        body: (
          <p>
            To sort by primary key K₁ with ties broken by K₂, either compare
            (K₁, K₂) lexicographically, or sort stably by K₂ first and then
            stably by K₁ (least significant key first, as in radix sort).
          </p>
        ),
      },
      {
        icon: "key",
        title: "External merge sort",
        body: (
          <ol>
            <li>
              Read memory-sized blocks, sort each internally, write them out as{" "}
              <b>runs</b>.
            </li>
            <li>
              Merge runs two at a time (or k at a time) until one run remains.
            </li>
          </ol>
        ),
      },
      {
        icon: "math",
        title: "Cost",
        body: (
          <p>
            With r initial runs, two-way merging needs ⌈log₂ r⌉ passes, each
            reading and writing the whole file. Larger memory → fewer runs →
            fewer passes; k-way merging needs ⌈log_k r⌉.
          </p>
        ),
      },
    ],
  },
  "ds-hashing": {
    unit: "V",
    syllabus: "Hashing",
    intro:
      "Hashing maps a key K directly to a table address H(K), so search does not depend on the number of records.",
    cards: [
      {
        icon: "def",
        title: "Hash functions",
        body: (
          <ul>
            <li>
              <b>Division</b>: H(K) = K mod m (m prime).
            </li>
            <li>
              <b>Mid-square</b>: square K and take middle digits.
            </li>
            <li>
              <b>Folding</b>: split K into parts and add them.
            </li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "Collision resolution",
        body: (
          <p>
            <b>Open addressing</b>: linear probing, quadratic probing, double
            hashing. <b>Chaining</b>: each slot holds a linked list. Expected
            cost grows with the load factor λ = n/m.
          </p>
        ),
      },
    ],
  },
  "ds-graph-rep": {
    unit: "V",
    syllabus: "Graphs: Sequential representation of graphs, Adjacency matrices",
    intro:
      "A graph G = (V, E) is a set of vertices and a set of edges joining pairs of vertices.",
    cards: [
      {
        icon: "def",
        title: "Adjacency matrix",
        body: (
          <p>
            The sequential representation: an n × n matrix with A[i][j] = 1 if
            there is an edge from vᵢ to vⱼ. Symmetric for undirected graphs.
            Θ(n²) space, Θ(1) edge test.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Path matrix",
        body: (
          <p>
            The (i, j) entry of Aᵏ counts walks of length k from vᵢ to vⱼ. The
            path matrix P (Warshall's algorithm) has P[i][j] = 1 if any path
            exists.
          </p>
        ),
      },
      {
        icon: "math",
        title: "Linked representation",
        body: (
          <p>
            Adjacency lists use Θ(V + E) space, which is better for sparse
            graphs.
          </p>
        ),
      },
    ],
  },
  "ds-graph-traversal": {
    unit: "V",
    syllabus: "Search and Traversal of graphs: Depth first, breadth first",
    intro:
      "Traversal visits every vertex reachable from a start vertex, using a status flag (ready, waiting, processed) so no vertex is processed twice.",
    cards: [
      {
        icon: "def",
        title: "Breadth-first",
        body: (
          <p>
            Use a <b>queue</b>: process the front vertex and enqueue its ready
            neighbours. Visits vertices in order of distance (number of edges)
            from the start.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Depth-first",
        body: (
          <p>
            Use a <b>stack</b> (or recursion): process the top vertex and push
            its ready neighbours. Goes deep along one path before backtracking.
          </p>
        ),
      },
      {
        icon: "math",
        title: "Cost",
        body: <p>Θ(V + E) with adjacency lists, Θ(V²) with a matrix.</p>,
      },
    ],
  },
  "ds-topo": {
    unit: "V",
    syllabus: "Topological sort",
    intro:
      "A topological sort of a directed acyclic graph lists its vertices so that for every edge u → v, u comes before v.",
    cards: [
      {
        icon: "def",
        title: "In-degree method",
        body: (
          <p>
            Queue every vertex of in-degree 0. Repeatedly dequeue a vertex,
            output it, and decrease the in-degree of its successors, enqueuing
            any that reach 0.
          </p>
        ),
      },
      {
        icon: "mistake",
        title: "Cycles",
        body: (
          <p>
            If vertices remain but none has in-degree 0, the graph has a cycle
            and no topological order exists.
          </p>
        ),
      },
    ],
  },
  "ds-multigraph": {
    unit: "V",
    syllabus: "Digraphs, Multigraphs",
    intro:
      "Graphs come in several kinds depending on whether edges have direction and whether repeated edges or loops are allowed.",
    cards: [
      {
        icon: "def",
        title: "Definitions",
        body: (
          <ul>
            <li>
              <b>Digraph</b>: each edge is an ordered pair (u, v); vertices have
              in-degree and out-degree.
            </li>
            <li>
              <b>Multigraph</b>: multiple (parallel) edges may join the same
              pair of vertices.
            </li>
            <li>
              <b>Loop</b>: an edge from a vertex to itself; graphs with loops
              are often called pseudographs.
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Handshake lemma",
        body: (
          <p>
            In any graph Σ deg(v) = 2|E| (a loop counts 2). In a digraph Σ indeg
            = Σ outdeg = |E|.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Matrix for multigraphs",
        body: (
          <p>
            Entry A[i][j] stores the <b>number</b> of edges from vᵢ to vⱼ
            instead of just 0 or 1.
          </p>
        ),
      },
    ],
  },
};

export function DsTheory({ topic }: { topic: string }) {
  const n = notes[topic];
  return n ? <NotesPanel note={n} unit={n.unit} /> : null;
}
