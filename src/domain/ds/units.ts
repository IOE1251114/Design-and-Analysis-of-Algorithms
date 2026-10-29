/** Data Structures: units, topics and topic summaries, following the course syllabus.
 *  Topic ids carry a "ds-" prefix so progress never collides with the Algorithms lab. */
import type { Unit } from "../course";

export const dsUnits: Unit[] = [
  {
    id: "ds1",
    number: "01",
    title: "Introduction & arrays",
    short: "Foundations",
    description:
      "Data organisation, operations and their costs, arrays in memory, searching and sparse matrices.",
    topics: [
      {
        id: "ds-basics",
        title: "Basic terminology",
        subtitle: "Organisation, operations & trade-offs",
        description:
          "See how data is organised into fields, records and files, what each structure costs per operation, and when memory buys speed.",
        complexity: "Time ↔ space",
        tags: ["field", "record", "file", "operations", "time–space trade-off"],
      },
      {
        id: "ds-array-memory",
        title: "Arrays in memory",
        subtitle: "Address calculation",
        description:
          "Click any element of a 1-D, 2-D or 3-D array to compute its address in row-major or column-major order.",
        complexity: "LOC = Base + w·offset",
        tags: ["row-major", "column-major", "base address", "multidimensional"],
      },
      {
        id: "ds-array-ops",
        title: "Traverse, insert & delete",
        subtitle: "Shifting elements",
        description:
          "Watch every element shift to open or close a gap, and count the moves that make insertion and deletion Θ(n).",
        complexity: "Θ(n) insert / delete",
        tags: ["traversal", "insertion", "deletion", "overflow"],
      },
      {
        id: "ds-search",
        title: "Linear & binary search",
        subtitle: "Scan vs halve",
        description:
          "Race a linear scan against binary search on the same sorted array and compare the comparisons each one needs.",
        complexity: "Θ(n) vs Θ(log n)",
        tags: ["linear search", "binary search", "sorted array"],
      },
      {
        id: "ds-sparse",
        title: "Sparse matrices",
        subtitle: "Triplets, transpose & multiply",
        description:
          "Store only non-zero terms, then transpose them the simple way, the fast way, and multiply two sparse matrices.",
        complexity: "Fast transpose Θ(cols + terms)",
        tags: ["triplet", "transpose", "fast transpose", "multiplication"],
      },
    ],
  },
  {
    id: "ds2",
    number: "02",
    title: "Recursion & linked lists",
    short: "Recursion · lists",
    description:
      "Recursion and backtracking, then singly, doubly, circular and generalized linked lists with polynomial arithmetic.",
    topics: [
      {
        id: "ds-recursion",
        title: "Recursion",
        subtitle: "Call stack & recursion tree",
        description:
          "Watch frames pile up on the call stack for n!, and see why naive Fibonacci repeats work in its recursion tree.",
        complexity: "Stack depth Θ(n)",
        tags: ["base case", "call stack", "recursion tree"],
      },
      {
        id: "ds-backtracking",
        title: "Backtracking",
        subtitle: "N-Queens",
        description:
          "Place queens row by row, prune attacked squares, and undo choices that lead to dead ends.",
        complexity: "Pruned search",
        tags: ["state space", "pruning", "undo"],
      },
      {
        id: "ds-linked",
        title: "Linked lists",
        subtitle: "Singly · doubly · circular · generalized",
        description:
          "Insert, delete, search and reverse with pointers you can watch move, then see lists that contain lists.",
        complexity: "Θ(1) link, Θ(n) find",
        tags: [
          "node",
          "next pointer",
          "prev pointer",
          "circular",
          "generalized list",
        ],
      },
      {
        id: "ds-polynomial",
        title: "Polynomial arithmetic",
        subtitle: "Addition & multiplication",
        description:
          "Store polynomials as linked lists of (coefficient, exponent) terms and add or multiply them term by term.",
        complexity: "Add Θ(m + n)",
        tags: ["coefficient", "exponent", "merge"],
      },
    ],
  },
  {
    id: "ds3",
    number: "03",
    title: "Stacks & queues",
    short: "Linear structures",
    description:
      "Push and pop on arrays and lists, Tower of Hanoi, queues, deques, priority queues and their applications.",
    topics: [
      {
        id: "ds-stack",
        title: "Stacks",
        subtitle: "Array & linked representation",
        description:
          "Push and pop on an array stack and a linked stack side by side, including overflow and underflow.",
        complexity: "Θ(1) push / pop",
        tags: ["LIFO", "TOP", "overflow", "underflow"],
      },
      {
        id: "ds-hanoi",
        title: "Tower of Hanoi",
        subtitle: "Recursion with a stack",
        description:
          "Move the tower one disk at a time and see why n disks always need 2ⁿ − 1 moves.",
        complexity: "2ⁿ − 1 moves",
        tags: ["recursion", "moves", "exponential"],
      },
      {
        id: "ds-queue",
        title: "Queues & deques",
        subtitle: "Linear · circular · double-ended",
        description:
          "Create, add, delete and peek on a fixed array, and see how a circular queue reuses the space a linear one wastes.",
        complexity: "Θ(1) per operation",
        tags: ["FIFO", "FRONT", "REAR", "circular queue", "deque"],
      },
      {
        id: "ds-pq",
        title: "Priority queues & heaps",
        subtitle: "Insert · extract · build",
        description:
          "Serve the highest priority first with a binary heap stored in an array.",
        complexity: "O(log n) per operation",
        tags: ["priority queue", "heap", "sift up / down"],
      },
      {
        id: "ds-expressions",
        title: "Infix, prefix & postfix",
        subtitle: "Stack applications",
        description:
          "Convert infix expressions to postfix and prefix with an operator stack, then evaluate postfix with a value stack.",
        complexity: "Θ(n) per conversion",
        tags: ["precedence", "associativity", "Polish notation"],
      },
      {
        id: "ds-maze",
        title: "Maze problem",
        subtitle: "Stack vs queue search",
        description:
          "Solve the same maze with a stack (deep, backtracking) and a queue (ring by ring) and compare the paths.",
        complexity: "Θ(cells)",
        tags: ["backtracking", "stack", "queue", "shortest path"],
      },
    ],
  },
  {
    id: "ds4",
    number: "04",
    title: "Trees",
    short: "Hierarchies",
    description:
      "Binary-tree properties and traversals, expression trees, search trees, Huffman coding, general, threaded and B-trees, and tries.",
    topics: [
      {
        id: "ds-tree-basics",
        title: "Binary trees",
        subtitle: "Properties, traversals & path length",
        description:
          "Build a tree from level order, walk it four ways, and measure its height, completeness and extended path lengths.",
        complexity: "Θ(n) traversal",
        tags: ["complete", "extended", "path length", "traversal"],
      },
      {
        id: "ds-expression-tree",
        title: "Expression trees",
        subtitle: "Build & evaluate",
        description:
          "Build a tree from an expression and evaluate it bottom-up; its traversals give prefix, infix and postfix.",
        complexity: "Θ(n) evaluation",
        tags: ["operator", "operand", "post-order"],
      },
      {
        id: "ds-bst",
        title: "BST, AVL & B-trees",
        subtitle: "Search · insert · delete",
        description:
          "Insert, search and delete in binary search trees, and see rotations and node splits keep the height low.",
        complexity: "O(log n) when balanced",
        tags: ["BST", "AVL", "rotation", "B-tree"],
      },
      {
        id: "ds-huffman",
        title: "Huffman's algorithm",
        subtitle: "Weighted path length",
        description:
          "Merge the two lightest trees again and again to build the tree with minimum weighted path length.",
        complexity: "O(n log n)",
        tags: ["weighted path length", "prefix code"],
      },
      {
        id: "ds-general-threaded",
        title: "General & threaded trees",
        subtitle: "Child-sibling form & threads",
        description:
          "Turn any general tree into a binary tree, and reuse empty pointers as threads for stack-free traversal.",
        complexity: "Θ(n) conversion",
        tags: ["general tree", "left-child right-sibling", "threads"],
      },
      {
        id: "ds-trie",
        title: "Trie",
        subtitle: "Prefix tree",
        description:
          "Store words letter by letter so that lookup and prefix search depend on the word's length, not the dictionary's size.",
        complexity: "Θ(length of key)",
        tags: ["prefix", "autocomplete", "dictionary"],
      },
    ],
  },
  {
    id: "ds5",
    number: "05",
    title: "Sorting, hashing & graphs",
    short: "Sorting · graphs",
    description:
      "Elementary and advanced sorts, sorting on keys and on disk, hashing, and graph representation and traversal.",
    topics: [
      {
        id: "ds-elementary-sorts",
        title: "Bubble, selection & insertion",
        subtitle: "Elementary sorts",
        description:
          "Step through the three simple sorts and compare how many comparisons and swaps each one makes.",
        complexity: "Θ(n²) worst case",
        tags: ["bubble", "selection", "insertion", "stability"],
      },
      {
        id: "ds-advanced-sorts",
        title: "Quick, merge & heap sort",
        subtitle: "n log n sorts",
        description:
          "Partition, two-way merge and heap-based sorting, step by step, with real comparison counts.",
        complexity: "Θ(n log n) average",
        tags: ["quick sort", "two-way merge", "heap sort"],
      },
      {
        id: "ds-keys-external",
        title: "Sorting on keys & external sort",
        subtitle: "Multiple keys · files on disk",
        description:
          "Sort records on several keys with stable passes, and sort a file too large for memory with runs and merges.",
        complexity: "⌈log₂ runs⌉ passes",
        tags: [
          "primary key",
          "secondary key",
          "stable",
          "runs",
          "merge passes",
        ],
      },
      {
        id: "ds-hashing",
        title: "Hashing",
        subtitle: "Hash functions & collisions",
        description:
          "Map keys to table slots and resolve collisions by chaining or open addressing.",
        complexity: "Expected Θ(1 + α)",
        tags: ["hash function", "collision", "load factor"],
      },
      {
        id: "ds-graph-rep",
        title: "Graph representation",
        subtitle: "Sequential & adjacency matrix",
        description:
          "Store the same graph as an adjacency matrix, adjacency list and edge list, and compare their costs.",
        complexity: "Matrix Θ(V²)",
        tags: [
          "adjacency matrix",
          "sequential representation",
          "adjacency list",
        ],
      },
      {
        id: "ds-graph-traversal",
        title: "Depth-first & breadth-first",
        subtitle: "Search and traversal",
        description:
          "Traverse a graph with a stack and with a queue, and watch the visit order and edge types.",
        complexity: "Θ(V + E)",
        tags: ["DFS", "BFS", "stack", "queue"],
      },
      {
        id: "ds-topo",
        title: "Topological sort",
        subtitle: "Ordering a DAG",
        description:
          "Order tasks so every edge points forward, using in-degrees or DFS finishing times.",
        complexity: "Θ(V + E)",
        tags: ["DAG", "in-degree", "prerequisites"],
      },
      {
        id: "ds-multigraph",
        title: "Digraphs & multigraphs",
        subtitle: "Direction, loops & parallel edges",
        description:
          "Add directed edges, loops and parallel edges, and see the matrix, degrees and graph type update.",
        complexity: "Σ deg = 2|E|",
        tags: ["digraph", "multigraph", "loop", "in/out-degree"],
      },
    ],
  },
];

export const dsIdeas: Record<string, string> = {
  "ds-basics":
    "A data structure is a way of organising data so that the operations we need are cheap. The same data stored differently makes different operations fast, and extra memory (a table, an index, a pointer) can often buy speed.",
  "ds-array-memory":
    "An array occupies one contiguous block of memory, so the address of any element can be computed from the base address, the element size and the index — that is what makes A[i] a constant-time operation.",
  "ds-array-ops":
    "Because array elements must stay contiguous, inserting or deleting in the middle shifts every later element by one place. Reading or overwriting A[i] is Θ(1); inserting or deleting is Θ(n).",
  "ds-search":
    "Linear search checks elements one by one and works on any array. Binary search needs a sorted array but halves the remaining range with every comparison, so it needs at most ⌈log₂(n + 1)⌉ comparisons.",
  "ds-sparse":
    "When most entries are zero, store only (row, column, value) triplets. Fast transpose counts terms per column first so each term can be placed directly, in Θ(columns + terms) instead of Θ(columns × terms).",
  "ds-recursion":
    "A recursive procedure calls itself on a smaller input until it reaches a base case. Each pending call keeps a frame on the stack, so recursion depth is memory; repeated sub-calls are why naive recursion can be exponential.",
  "ds-backtracking":
    "Backtracking builds a solution one choice at a time and abandons a partial solution as soon as it breaks a constraint, undoing the last choice and trying the next one.",
  "ds-linked":
    "A linked list stores each element in a node with a pointer to the next one (and, when doubly linked, the previous one). Linking or unlinking a node is Θ(1) once you are there, but reaching position i takes Θ(i).",
  "ds-polynomial":
    "Each term of a polynomial becomes a node holding a coefficient and an exponent, kept in decreasing exponent order. Addition is a merge of two sorted lists; multiplication combines every pair of terms.",
  "ds-stack":
    "A stack is a last-in, first-out list where insertion (push) and deletion (pop) happen only at the TOP. Both are Θ(1) whether the stack is an array with a TOP index or a linked list whose head is the top.",
  "ds-hanoi":
    "To move n disks from A to C, move n − 1 disks to B, move the largest to C, then move the n − 1 disks onto it. T(n) = 2T(n − 1) + 1 gives exactly 2ⁿ − 1 moves.",
  "ds-queue":
    "A queue is first-in, first-out: insert at REAR, delete at FRONT. A circular queue wraps the indices around with mod, so space freed at the front is reused; a deque allows both operations at both ends.",
  "ds-pq":
    "A priority queue always serves the element with the highest priority. A binary heap keeps that element at the root of a complete tree stored in an array, giving O(log n) insert and delete.",
  "ds-expressions":
    "Postfix (reverse Polish) and prefix (Polish) notation need no parentheses. An operator stack converts infix to postfix using precedence and associativity; a value stack evaluates postfix in one left-to-right pass.",
  "ds-maze":
    "Searching a maze with a stack follows one corridor as deep as it can and backtracks at dead ends. Searching with a queue explores in rings of equal distance, so the first path it finds is a shortest one.",
  "ds-tree-basics":
    "A binary tree with n nodes has n − 1 edges, at most 2ˡ nodes on level l and at most 2ᵈ − 1 nodes in d levels. Adding external nodes for every empty subtree gives an extended tree whose path lengths satisfy E = I + 2n.",
  "ds-expression-tree":
    "In an expression tree, leaves are operands and internal nodes are operators. Post-order evaluation computes both subtrees before the operator; pre-, in- and post-order traversals print prefix, infix and postfix.",
  "ds-bst":
    "A binary search tree keeps smaller keys left and larger keys right, so search, insert and delete follow one root-to-leaf path: O(height). AVL rotations and B-tree node splits keep that height logarithmic.",
  "ds-huffman":
    "Huffman's algorithm repeatedly merges the two lightest trees. The resulting tree has the minimum weighted external path length Σ wᵢ·lᵢ, which is why it gives optimal prefix codes.",
  "ds-general-threaded":
    "Any general tree becomes a binary tree by using the left pointer for the first child and the right pointer for the next sibling. In a threaded tree, empty pointers point to in-order neighbours, so traversal needs no stack.",
  "ds-trie":
    "A trie stores keys one character per level, sharing common prefixes. Looking up a key of length m takes Θ(m) steps no matter how many keys are stored, and all keys with a given prefix sit in one subtree.",
  "ds-elementary-sorts":
    "Bubble sort swaps adjacent out-of-order pairs, selection sort picks the minimum of the unsorted part, insertion sort inserts each element into the sorted prefix. All three are Θ(n²) in the worst case.",
  "ds-advanced-sorts":
    "Quick sort partitions around a pivot, two-way merge sort merges sorted halves, and heap sort repeatedly extracts the maximum. All three average Θ(n log n); only quick sort has a Θ(n²) worst case.",
  "ds-keys-external":
    "To sort on several keys, sort by the least significant key first and finish with the most significant, using a stable sort. When data does not fit in memory, sort it in runs and merge the runs in passes.",
  "ds-hashing":
    "A hash function turns a key into a table index so search, insert and delete take expected constant time. Collisions are resolved by chaining or by probing, and the load factor α controls the cost.",
  "ds-graph-rep":
    "A graph can be stored sequentially as an adjacency matrix (Θ(V²) space, Θ(1) edge test) or as linked adjacency lists (Θ(V + E) space). Sparse graphs favour lists, dense graphs favour the matrix.",
  "ds-graph-traversal":
    "Depth-first search uses a stack (or recursion) to go deep before backtracking; breadth-first search uses a queue to visit vertices in order of distance. Both visit every vertex and edge once: Θ(V + E).",
  "ds-topo":
    "A topological order lists the vertices of a directed acyclic graph so that every edge goes forward. Repeatedly removing vertices of in-degree 0 produces one; a cycle makes it impossible.",
  "ds-multigraph":
    "In a digraph each edge has a direction, so vertices have in- and out-degrees. A multigraph allows several edges between the same pair of vertices, and a loop joins a vertex to itself. In every graph Σ degrees = 2|E|.",
};
