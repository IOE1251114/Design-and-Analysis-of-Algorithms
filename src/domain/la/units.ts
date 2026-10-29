/** Linear Algebra: units, topics and topic summaries, following the course syllabus.
 *  Topic ids carry an "la-" prefix so progress never collides with the other labs. */
import type { Unit } from "../course";

export const laUnits: Unit[] = [
  {
    id: "la1",
    number: "01",
    title: "Algebra & vector spaces",
    short: "Foundations",
    description:
      "Groups, rings and fields; vector spaces and subspaces; span, independence, bases, dimension and direct sums.",
    topics: [
      {
        id: "la-structures",
        title: "Groups, rings & fields",
        subtitle: "Modern algebra on ℤₙ",
        description:
          "Build the operation table of ℤₙ and check the group axioms, zero divisors, and when ℤₙ is a field.",
        complexity: "ℤₙ is a field ⇔ n prime",
        tags: ["group", "ring", "field", "Cayley table"],
      },
      {
        id: "la-vector-spaces",
        title: "Vector spaces & subspaces",
        subtitle: "Closure tests",
        description:
          "Drag vectors inside a set and test whether it contains 0 and is closed under addition and scaling.",
        complexity: "0 ∈ W, W + W ⊆ W, cW ⊆ W",
        tags: ["axioms", "subspace", "closure"],
      },
      {
        id: "la-r3",
        title: "ℝ³: vectors in 3-D",
        subtitle: "Planes, lines and volume",
        description:
          "Turn a 3-D view to see spans as lines and planes, follow linear combinations, the cross product, and the volume test for independence.",
        complexity: "dim ℝ³ = 3",
        tags: ["3-D", "plane through origin", "cross product", "determinant"],
      },
      {
        id: "la-matrix-space",
        title: "Matrix spaces",
        subtitle: "M₂ₓ₂ as a vector space",
        description:
          "Add and scale 2 × 2 matrices as vectors, read their four coordinates, and test symmetric, diagonal and trace-zero subspaces.",
        complexity: "dim M₂ₓ₂ = 4",
        tags: ["matrix space", "Eᵢⱼ basis", "symmetric", "trace zero"],
      },
      {
        id: "la-poly-space",
        title: "Polynomial spaces",
        subtitle: "Pₙ as a vector space",
        description:
          "Combine polynomials as vectors of coefficients, change to a shifted (Taylor) basis, and see differentiation as a linear map.",
        complexity: "dim Pₙ = n + 1",
        tags: ["polynomial", "coefficients", "Taylor basis", "derivative"],
      },
      {
        id: "la-complex-space",
        title: "Complex vector spaces",
        subtitle: "ℂ and ℂ²",
        description:
          "Multiply by complex scalars to rotate and scale, draw vectors of ℂ² on two complex planes, and use the complex inner product.",
        complexity: "dim_ℝ ℂⁿ = 2n",
        tags: ["complex scalar", "conjugate", "ℂ²", "Hermitian inner product"],
      },
      {
        id: "la-span",
        title: "Span & linear independence",
        subtitle: "All combinations a·v₁ + b·v₂",
        description:
          "See which points two vectors can reach, and test three vectors in ℝ³ for dependence.",
        complexity: "independent ⇔ only trivial relation",
        tags: ["linear combination", "span", "dependence", "rank"],
      },
      {
        id: "la-basis",
        title: "Bases & dimension",
        subtitle: "Coordinates in any basis",
        description:
          "Tilt the coordinate grid with your own basis and read a point's unique coordinates.",
        complexity: "dim ℝⁿ = n",
        tags: ["basis", "coordinates", "dimension"],
      },
      {
        id: "la-direct-sum",
        title: "Direct sums",
        subtitle: "V = U ⊕ W",
        description:
          "Split every vector uniquely into a U-part and a W-part, and see when the split fails.",
        complexity: "U ∩ W = {0}",
        tags: ["sum of subspaces", "direct sum", "complement"],
      },
    ],
  },
  {
    id: "la2",
    number: "02",
    title: "Linear transformations",
    short: "Linear maps",
    description:
      "Linear maps and their matrices; range, null space and rank–nullity; projections, inverses, change of basis and dual bases.",
    topics: [
      {
        id: "la-transform",
        title: "Linear transformations",
        subtitle: "Watch the grid move",
        description:
          "Morph the plane from I to any 2 × 2 matrix and check linearity on your own vectors.",
        complexity: "T(au + bv) = aT(u) + bT(v)",
        tags: ["linear map", "matrix columns", "grid"],
      },
      {
        id: "la-rank-nullity",
        title: "Range, null space & rank–nullity",
        subtitle: "Row reduction",
        description:
          "Row-reduce step by step, read off bases of the range and null space, and confirm rank + nullity = n.",
        complexity: "rank + nullity = n",
        tags: ["RREF", "pivot", "free variable", "kernel"],
      },
      {
        id: "la-projection",
        title: "Projections",
        subtitle: "P² = P",
        description:
          "Project onto a line orthogonally or along another line, and see that projecting twice changes nothing.",
        complexity: "P² = P",
        tags: ["idempotent", "orthogonal", "oblique"],
      },
      {
        id: "la-inverse",
        title: "Inverse linear transformation",
        subtitle: "Gauss–Jordan",
        description:
          "Reduce [A | I] to [I | A⁻¹], and map a vector there and back.",
        complexity: "det A ≠ 0",
        tags: ["invertible", "Gauss–Jordan", "isomorphism"],
      },
      {
        id: "la-change-basis",
        title: "Matrices of maps & change of basis",
        subtitle: "[T]_B = P⁻¹AP",
        description:
          "See one transformation get different matrices in different bases — diagonal in an eigenbasis.",
        complexity: "similar matrices",
        tags: ["matrix representation", "similarity", "change of basis"],
      },
      {
        id: "la-dual",
        title: "Dual space & dual bases",
        subtitle: "Coordinate functionals",
        description:
          "Draw the dual basis functionals as families of level lines and check fᵢ(bⱼ) = δᵢⱼ.",
        complexity: "dim V* = dim V",
        tags: ["linear functional", "dual basis", "Kronecker delta"],
      },
    ],
  },
  {
    id: "la3",
    number: "03",
    title: "Eigen-theory & canonical forms",
    short: "Eigenvalues",
    description:
      "Trace, determinant and transpose; eigenvalues and eigenvectors; minimal polynomials, Cayley–Hamilton, diagonalization, Jordan form and matrix norms.",
    topics: [
      {
        id: "la-det-trace",
        title: "Trace & determinant",
        subtitle: "Area scale and orientation",
        description:
          "See det A as the area factor of the unit square and connect trace and determinant to the eigenvalues.",
        complexity: "det = Πλ, trace = Σλ",
        tags: ["determinant", "trace", "transpose", "cofactor"],
      },
      {
        id: "la-eigen",
        title: "Eigenvalues & eigenvectors",
        subtitle: "Directions that only stretch",
        description:
          "Sweep a vector round the circle and catch the moments Ax lines up with x.",
        complexity: "det(λI − A) = 0",
        tags: ["characteristic polynomial", "eigenspace"],
      },
      {
        id: "la-cayley",
        title: "Minimal polynomial & Cayley–Hamilton",
        subtitle: "p(A) = 0",
        description:
          "Add up p(A) term by term to watch it vanish, and find the minimal polynomial.",
        complexity: "m(λ) | p(λ)",
        tags: ["Cayley–Hamilton", "minimal polynomial", "inverse"],
      },
      {
        id: "la-diagonalize",
        title: "Diagonalization",
        subtitle: "A = PDP⁻¹",
        description:
          "Use the eigenbasis grid to see A act as pure stretching, and follow Aᵏx.",
        complexity: "Aᵏ = PDᵏP⁻¹",
        tags: ["eigenbasis", "powers", "defective"],
      },
      {
        id: "la-jordan",
        title: "Jordan canonical form",
        subtitle: "Blocks for missing eigenvectors",
        description:
          "Compare algebraic and geometric multiplicities and build the Jordan matrix from ranks.",
        complexity: "blocks from rank(A − λI)ᵏ",
        tags: ["Jordan block", "multiplicity", "similarity"],
      },
      {
        id: "la-norms",
        title: "Matrix norms",
        subtitle: "Maximum stretch",
        description:
          "Map the unit ball of the 1-, 2- and ∞-norms and measure the largest stretch.",
        complexity: "‖A‖ = max ‖Ax‖/‖x‖",
        tags: ["operator norm", "Frobenius", "singular value"],
      },
    ],
  },
  {
    id: "la4",
    number: "04",
    title: "Inner product spaces",
    short: "Geometry",
    description:
      "Inner products, norms and orthogonality; Gram–Schmidt; orthogonal projections; linear functionals, adjoints and Hermitian, unitary and normal operators.",
    topics: [
      {
        id: "la-inner",
        title: "Inner products & orthogonality",
        subtitle: "Length and angle",
        description:
          "Measure lengths and angles with the dot product or a weighted inner product and check Cauchy–Schwarz.",
        complexity: "|⟨u,v⟩| ≤ ‖u‖‖v‖",
        tags: ["norm", "angle", "orthogonal", "Cauchy–Schwarz"],
      },
      {
        id: "la-gram-schmidt",
        title: "Gram–Schmidt",
        subtitle: "Orthonormal bases",
        description:
          "Turn a basis into an orthonormal one, one projection at a time.",
        complexity: "span preserved at each step",
        tags: ["orthonormal set", "projection", "QR"],
      },
      {
        id: "la-orth-proj",
        title: "Orthogonal projections",
        subtitle: "Least squares",
        description:
          "Fit a line to points you drag; the fit is the orthogonal projection onto the column space.",
        complexity: "AᵀAx̂ = Aᵀb",
        tags: ["normal equations", "residual", "best approximation"],
      },
      {
        id: "la-operators",
        title: "Adjoints & special operators",
        subtitle: "Hermitian · unitary · normal",
        description:
          "Enter a complex matrix and test whether it is self-adjoint, unitary or normal.",
        complexity: "⟨Au, v⟩ = ⟨u, A*v⟩",
        tags: ["adjoint", "Hermitian", "unitary", "normal", "spectral theorem"],
      },
    ],
  },
  {
    id: "la5",
    number: "05",
    title: "Bilinear & quadratic forms",
    short: "Forms",
    description:
      "Bilinear forms, symmetric and skew-symmetric forms, real quadratic forms and positive definiteness.",
    topics: [
      {
        id: "la-bilinear",
        title: "Bilinear forms",
        subtitle: "Symmetric & skew-symmetric",
        description:
          "Evaluate B(u, v) = uᵀMv on vectors you drag and split M into symmetric and skew parts.",
        complexity: "B(u, v) = uᵀMv",
        tags: ["bilinear", "symmetric", "skew-symmetric", "congruence"],
      },
      {
        id: "la-quadratic",
        title: "Quadratic forms & definiteness",
        subtitle: "Bowl, saddle or trough",
        description:
          "Shape q(x) = xᵀSx with sliders and classify it by eigenvalues and leading minors.",
        complexity: "all λ > 0 ⇔ positive definite",
        tags: [
          "quadratic form",
          "positive definite",
          "Sylvester",
          "principal axes",
        ],
      },
    ],
  },
];

export const laIdeas: Record<string, string> = {
  "la-structures":
    "A group is a set with an associative operation that has an identity and inverses. A ring has + and × linked by distributivity; a field is a commutative ring in which every non-zero element has a multiplicative inverse — the scalars of a vector space come from a field.",
  "la-vector-spaces":
    "A vector space over a field F is a set closed under addition and scalar multiplication satisfying eight axioms. A non-empty subset W is a subspace exactly when it is closed under both operations (so it contains 0).",
  "la-r3":
    "ℝ³ is the space of ordered triples. Its subspaces are the origin, lines and planes through the origin, and ℝ³ itself. Three vectors form a basis exactly when the box they span has non-zero volume, det[u v w] ≠ 0.",
  "la-matrix-space":
    "The m × n matrices form a vector space of dimension mn under entrywise addition and scaling, with basis the matrices Eᵢⱼ. Symmetric, skew-symmetric, diagonal, triangular and trace-zero matrices are subspaces; invertible matrices are not.",
  "la-poly-space":
    "Pₙ, the polynomials of degree at most n, is a vector space of dimension n + 1 with basis {1, x, …, xⁿ}. Any n + 1 polynomials of distinct degrees, such as powers of (x − c), also form a basis, and differentiation is a linear map on it.",
  "la-complex-space":
    "In ℂⁿ the vectors have complex entries and the scalars are complex. Multiplying by c = r·e^{iθ} scales by r and rotates by θ. ℂⁿ has dimension n over ℂ but 2n over ℝ, and its inner product ⟨u, v⟩ = Σ uᵢ·v̄ᵢ uses conjugates so that ‖u‖ is real.",
  "la-span":
    "The span of S is the set of all linear combinations of S — the smallest subspace containing S. S is linearly independent when the only combination giving 0 is the trivial one.",
  "la-basis":
    "A basis is a linearly independent spanning set. Every basis of V has the same number of vectors, the dimension of V, and each vector has unique coordinates with respect to a basis.",
  "la-direct-sum":
    "V = U ⊕ W when every v ∈ V is uniquely u + w with u ∈ U, w ∈ W; equivalently V = U + W and U ∩ W = {0}. Then dim V = dim U + dim W.",
  "la-transform":
    "T : V → W is linear when T(au + bv) = aT(u) + bT(v). In coordinates T(x) = Ax, and the j-th column of A is T(eⱼ), so a matrix is completely described by where it sends the basis.",
  "la-rank-nullity":
    "The range R(T) and null space N(T) are subspaces. Their dimensions are the rank and the nullity, and rank + nullity = dim V. T is one-to-one iff N(T) = {0}.",
  "la-projection":
    "A projection is a linear map with P² = P. It splits V = R(P) ⊕ N(P); it is an orthogonal projection when the two parts are perpendicular, i.e. when P is also symmetric (self-adjoint).",
  "la-inverse":
    "T is invertible when it is both one-to-one and onto; for a square matrix this means det A ≠ 0 or rank A = n. The inverse map is also linear, and Gauss–Jordan elimination on [A | I] produces it.",
  "la-change-basis":
    "The matrix of T depends on the basis. If P holds the new basis vectors as columns, the new matrix is P⁻¹AP. Matrices related this way are similar: they share determinant, trace, eigenvalues and rank.",
  "la-dual":
    "The dual space V* is the space of linear functionals on V. For a basis {b₁, …, bₙ} the dual basis {f₁, …, fₙ} satisfies fᵢ(bⱼ) = δᵢⱼ, so fᵢ(v) is the i-th coordinate of v; in ℝⁿ the fᵢ are the rows of B⁻¹.",
  "la-det-trace":
    "The determinant of T measures how it scales volume (and whether it flips orientation); the trace is the sum of the diagonal. Both are basis-independent, both are unchanged by transposing, and they equal the product and the sum of the eigenvalues.",
  "la-eigen":
    "λ is an eigenvalue of A if Av = λv for some v ≠ 0. Eigenvalues are the roots of det(λI − A) = 0, and for each λ the eigenvectors (with 0) form the eigenspace N(A − λI).",
  "la-cayley":
    "Cayley–Hamilton: every square matrix satisfies its characteristic polynomial, p(A) = 0. The minimal polynomial is the monic polynomial of least degree that kills A; it divides p and has the same roots.",
  "la-diagonalize":
    "A is diagonalizable when it has a basis of eigenvectors, i.e. when every eigenvalue's geometric multiplicity equals its algebraic multiplicity. Then A = PDP⁻¹ and Aᵏ = PDᵏP⁻¹.",
  "la-jordan":
    "Over ℂ every matrix is similar to a Jordan matrix: block-diagonal, each block with one eigenvalue on the diagonal and 1s on the superdiagonal. It is diagonal exactly when A is diagonalizable.",
  "la-norms":
    "A matrix norm measures size; the operator norm ‖A‖ = max ‖Ax‖ over ‖x‖ = 1 is the largest stretch. ‖A‖₁ is the largest column sum, ‖A‖∞ the largest row sum, and ‖A‖₂ the largest singular value.",
  "la-inner":
    "An inner product is a positive-definite, symmetric (conjugate-symmetric over ℂ), linear pairing ⟨u, v⟩. It gives lengths ‖v‖ = √⟨v, v⟩, angles, and orthogonality, and satisfies Cauchy–Schwarz and the triangle inequality.",
  "la-gram-schmidt":
    "Gram–Schmidt turns a linearly independent list into an orthonormal list with the same span at every stage: subtract from each vector its projections on the earlier ones, then normalize.",
  "la-orth-proj":
    "The orthogonal projection of b onto a subspace W is the closest point of W to b; the error b − proj is perpendicular to W. For W = column space of A this gives the least-squares solution of AᵀAx̂ = Aᵀb.",
  "la-operators":
    "Every linear functional is f(v) = ⟨v, w⟩ for a unique w, and every operator has an adjoint with ⟨Au, v⟩ = ⟨u, A*v⟩. Self-adjoint (A* = A), unitary (A*A = I) and normal (A*A = AA*) operators are the ones with orthonormal eigenbases.",
  "la-bilinear":
    "A bilinear form B(u, v) is linear in each argument; in a basis B(u, v) = uᵀMv. It is symmetric if M = Mᵀ and skew-symmetric if M = −Mᵀ, and every form is the sum of one of each. Changing basis gives the congruent matrix PᵀMP.",
  "la-quadratic":
    "A quadratic form q(x) = xᵀSx comes from a symmetric matrix S. It is positive definite when q(x) > 0 for all x ≠ 0 — iff all eigenvalues of S are positive, iff all leading principal minors are positive (Sylvester's criterion).",
};
