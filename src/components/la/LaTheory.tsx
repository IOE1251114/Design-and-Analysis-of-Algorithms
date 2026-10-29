import { Code, NotesPanel, type Note } from "../daa/unit1/Unit1Theory";

/* Theory notes for the Linear Algebra course, one entry per topic, each quoting its syllabus line. */

const notes: Record<string, Note & { unit: string }> = {
  /* ---------------- Unit I ---------------- */
  "la-structures": {
    unit: "I",
    syllabus: "Introduction to Modern Algebra: groups, ring and field",
    intro:
      "Vector spaces are built on a field of scalars, and fields are special rings, which are built from groups.",
    cards: [
      {
        icon: "def",
        title: "Definitions",
        body: (
          <ul>
            <li>
              <b>Group</b> (G, ∗): closure, associativity, identity e, inverses.{" "}
              <b>Abelian</b> if a ∗ b = b ∗ a.
            </li>
            <li>
              <b>Ring</b> (R, +, ·): (R, +) abelian group, · associative,
              distributive laws.
            </li>
            <li>
              <b>Field</b>: commutative ring with 1 ≠ 0 where every non-zero
              element has a multiplicative inverse (ℚ, ℝ, ℂ, ℤₚ).
            </li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "ℤₙ",
        body: (
          <p>
            (ℤₙ, +) is always an abelian group. ℤₙ is a commutative ring with 1,
            and a field exactly when n is prime; otherwise n = ab gives zero
            divisors a·b ≡ 0.
          </p>
        ),
      },
      {
        icon: "mistake",
        title: "Common mistake",
        body: (
          <p>
            (ℤₙ, ×) including 0 is never a group: 0 has no inverse. Remove 0 and
            it is a group only for prime n.
          </p>
        ),
      },
    ],
  },
  "la-vector-spaces": {
    unit: "I",
    syllabus: "Vector spaces, properties of vector spaces, subspaces",
    intro:
      "A vector space over a field F is a set V with addition and scalar multiplication satisfying eight axioms (an abelian group under +, plus compatibility with scalars).",
    cards: [
      {
        icon: "def",
        title: "Subspace test",
        body: (
          <p>
            A non-empty W ⊆ V is a subspace iff for all u, w ∈ W and c ∈ F:{" "}
            <b>u + w ∈ W</b> and <b>cu ∈ W</b>. Equivalently au + bw ∈ W for all
            scalars a, b.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Basic properties",
        body: (
          <ul>
            <li>0·v = 0 and c·0 = 0.</li>
            <li>(−1)v = −v.</li>
            <li>cv = 0 ⇒ c = 0 or v = 0.</li>
            <li>
              The intersection of subspaces is a subspace; the union usually is
              not.
            </li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Examples",
        body: (
          <p>
            Lines and planes through the origin in ℝ³; polynomials of degree ≤
            n; solutions of Ax = 0; continuous functions on [a, b].
          </p>
        ),
      },
    ],
  },
  "la-r3": {
    unit: "I",
    syllabus:
      "Vector spaces, subspaces, linear dependence and independence (in ℝ³)",
    intro:
      "ℝ³ is the first space where the geometry of subspaces gets interesting: lines and planes through the origin.",
    cards: [
      {
        icon: "def",
        title: "Subspaces of ℝ³",
        body: (
          <p>
            Exactly four kinds: {"{0}"}, lines through 0 (dimension 1), planes
            through 0 (dimension 2) and ℝ³ itself. A plane ax + by + cz = d is a
            subspace only when d = 0.
          </p>
        ),
      },
      {
        icon: "math",
        title: "Cross product and volume",
        body: (
          <Code>
            {
              "u × v = (u₂v₃ − u₃v₂, u₃v₁ − u₁v₃, u₁v₂ − u₂v₁)\n‖u × v‖ = area of the parallelogram on u, v\n|det[u v w]| = volume of the box on u, v, w"
            }
          </Code>
        ),
        wide: true,
      },
      {
        icon: "key",
        title: "Independence test",
        body: (
          <p>
            u, v, w are independent ⇔ det[u v w] ≠ 0 ⇔ they do not lie in one
            plane through the origin ⇔ they form a basis of ℝ³.
          </p>
        ),
      },
    ],
  },
  "la-matrix-space": {
    unit: "I",
    syllabus: "Vector spaces, subspaces, bases and dimension (matrix spaces)",
    intro:
      "Vector spaces need not consist of arrows: anything that can be added and scaled under the axioms is a vector.",
    cards: [
      {
        icon: "def",
        title: "The space Mₘₓₙ",
        body: (
          <p>
            Matrices add entrywise and scale entrywise. The matrices Eᵢⱼ (a
            single 1, zeros elsewhere) form the standard basis, so dim Mₘₓₙ =
            mn. Listing the entries gives an isomorphism with ℝᵐⁿ.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Important subspaces of M₂ₓ₂",
        body: (
          <ul>
            <li>Symmetric: dimension 3.</li>
            <li>Skew-symmetric: dimension 1.</li>
            <li>Diagonal: dimension 2; upper triangular: dimension 3.</li>
            <li>Trace zero: dimension 3 (the kernel of the trace map).</li>
          </ul>
        ),
      },
      {
        icon: "mistake",
        title: "Not subspaces",
        body: (
          <p>
            Invertible matrices (they miss 0), matrices with det = 0 (not closed
            under +), and matrices with a fixed non-zero entry.
          </p>
        ),
      },
    ],
  },
  "la-poly-space": {
    unit: "I",
    syllabus: "Vector spaces, bases and dimension (polynomial spaces)",
    intro: "Polynomials are vectors whose coordinates are their coefficients.",
    cards: [
      {
        icon: "def",
        title: "The space Pₙ",
        body: (
          <p>
            Pₙ = {"{"}a₀ + a₁x + … + aₙxⁿ{"}"}, with dim Pₙ = n + 1 and standard
            basis {"{"}1, x, …, xⁿ{"}"}. The polynomials of degree exactly n are
            not a subspace (no zero polynomial).
          </p>
        ),
      },
      {
        icon: "math",
        title: "Other bases",
        body: (
          <Code>
            {
              "{1, (x − c), (x − c)², …}:  coordinates p(c), p′(c), p″(c)/2!, …\nLagrange basis: values at n + 1 distinct points"
            }
          </Code>
        ),
        wide: true,
      },
      {
        icon: "key",
        title: "Linear maps on Pₙ",
        body: (
          <p>
            Differentiation D, integration, multiplication by x (into Pₙ₊₁) and
            evaluation p ↦ p(a) are linear. D on P₃ has matrix with 1, 2, 3 on
            the superdiagonal, nullity 1 and D⁴ = 0.
          </p>
        ),
      },
    ],
  },
  "la-complex-space": {
    unit: "I",
    syllabus: "Vector spaces over a field (complex vector spaces)",
    intro:
      "Every definition so far works over any field. Over ℂ, scalars can rotate as well as stretch.",
    cards: [
      {
        icon: "def",
        title: "ℂⁿ",
        body: (
          <p>
            Vectors (z₁, …, zₙ) with complex entries; addition and scaling
            componentwise. A complex scalar c = re^{"{"}iθ{"}"} multiplies every
            component's length by r and turns it by θ.
          </p>
        ),
      },
      {
        icon: "math",
        title: "Dimension depends on the field",
        body: (
          <p>
            dim over ℂ of ℂⁿ is n (basis e₁, …, eₙ), but over ℝ it is 2n (basis
            e₁, ie₁, …, eₙ, ieₙ).
          </p>
        ),
      },
      {
        icon: "key",
        title: "Hermitian inner product",
        body: (
          <Code>
            {
              "⟨u, v⟩ = u₁v̄₁ + … + uₙv̄ₙ\n⟨v, u⟩ = conj⟨u, v⟩,   ‖u‖² = Σ |uᵢ|² ≥ 0"
            }
          </Code>
        ),
        wide: true,
      },
    ],
  },
  "la-span": {
    unit: "I",
    syllabus: "Linear dependence and independence, Linear span",
    intro:
      "Linear combinations are the only thing a vector space lets you build; span and independence describe what can be built and whether it is built without redundancy.",
    cards: [
      {
        icon: "def",
        title: "Definitions",
        body: (
          <ul>
            <li>
              <b>span S</b> = all finite combinations c₁v₁ + … + cₖvₖ: the
              smallest subspace containing S.
            </li>
            <li>
              S is <b>independent</b> if c₁v₁ + … + cₖvₖ = 0 forces all cᵢ = 0.
            </li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Testing in ℝⁿ",
        body: (
          <p>
            Put the vectors as columns of A. They are independent iff rank A =
            number of vectors; n vectors in ℝⁿ are independent iff det A ≠ 0. A
            null-space vector gives an explicit dependence relation.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Facts",
        body: (
          <p>
            Any set containing 0 is dependent. A set is dependent iff some
            vector is a combination of the others. More than n vectors in ℝⁿ are
            always dependent.
          </p>
        ),
      },
    ],
  },
  "la-basis": {
    unit: "I",
    syllabus: "Bases and dimension",
    intro:
      "A basis is a spanning set with no redundancy: just enough vectors to reach everything.",
    cards: [
      {
        icon: "def",
        title: "Basis and coordinates",
        body: (
          <p>
            B = {"{"}b₁, …, bₙ{"}"} is a basis if it is independent and spans V.
            Then every v has unique coordinates: v = c₁b₁ + … + cₙbₙ, written
            [v]_B = (c₁, …, cₙ). In ℝⁿ, [v]_B = B⁻¹v.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Dimension",
        body: (
          <ul>
            <li>All bases have the same size, dim V.</li>
            <li>
              In an n-dimensional space, any n independent vectors form a basis,
              and so do any n spanning vectors.
            </li>
            <li>Every independent set extends to a basis.</li>
          </ul>
        ),
      },
      {
        icon: "example",
        title: "Examples",
        body: (
          <p>
            dim ℝⁿ = n, dim Pₙ (polynomials of degree ≤ n) = n + 1, dim M₂ₓ₃ =
            6.
          </p>
        ),
      },
    ],
  },
  "la-direct-sum": {
    unit: "I",
    syllabus: "Direct sums",
    intro:
      "Sometimes a space splits into independent pieces, and every vector splits with it.",
    cards: [
      {
        icon: "def",
        title: "Definition",
        body: (
          <p>
            V = U ⊕ W if V = U + W and U ∩ W = {"{"}0{"}"}. Equivalently, each v
            ∈ V can be written as u + w (u ∈ U, w ∈ W) in exactly one way.
          </p>
        ),
      },
      {
        icon: "math",
        title: "Dimension formula",
        body: (
          <Code>
            {
              "dim(U + W) = dim U + dim W − dim(U ∩ W)\nso for a direct sum: dim V = dim U + dim W"
            }
          </Code>
        ),
      },
      {
        icon: "example",
        title: "Examples",
        body: (
          <p>
            ℝ² = x-axis ⊕ any other line through 0. Matrices = symmetric ⊕
            skew-symmetric. Every subspace of a finite-dimensional space has a
            complement.
          </p>
        ),
      },
    ],
  },
  /* ---------------- Unit II ---------------- */
  "la-transform": {
    unit: "II",
    syllabus:
      "Linear transformations, representation of linear transformations by matrices",
    intro:
      "Linear transformations are the maps that respect the vector-space operations; in finite dimensions they are exactly matrix multiplication.",
    cards: [
      {
        icon: "def",
        title: "Definition",
        body: (
          <p>
            T : V → W is linear if T(u + v) = T(u) + T(v) and T(cv) = cT(v).
            Then T(0) = 0, and T is determined by its values on a basis.
          </p>
        ),
      },
      {
        icon: "key",
        title: "The matrix of T",
        body: (
          <p>
            With bases B of V and C of W, the j-th column of [T] is the
            C-coordinates of T(bⱼ). In ℝⁿ with the standard basis, column j is
            T(eⱼ).
          </p>
        ),
      },
      {
        icon: "example",
        title: "In the plane",
        body: (
          <p>
            Rotation by θ: [[cos θ, −sin θ], [sin θ, cos θ]]; shear: [[1, k],
            [0, 1]]; reflection in y = x: [[0, 1], [1, 0]].
          </p>
        ),
      },
    ],
  },
  "la-rank-nullity": {
    unit: "II",
    syllabus: "Range and null spaces, rank–nullity theorem and its application",
    intro:
      "Every linear map loses some information (the null space) and reaches some part of its codomain (the range); the two balance exactly.",
    cards: [
      {
        icon: "def",
        title: "Range and null space",
        body: (
          <p>
            N(T) = {"{"}v : T(v) = 0{"}"}, R(T) = {"{"}T(v){"}"}. For a matrix:
            N(A) from free variables of the RREF, R(A) spanned by the pivot
            columns of A.
          </p>
        ),
      },
      {
        icon: "math",
        title: "Rank–nullity",
        body: (
          <Code>
            {"dim N(T) + dim R(T) = dim V\nnullity + rank = number of columns"}
          </Code>
        ),
      },
      {
        icon: "exam",
        title: "Applications",
        body: (
          <ul>
            <li>
              T is one-to-one ⇔ N(T) = {"{"}0{"}"}.
            </li>
            <li>If dim V = dim W, then one-to-one ⇔ onto ⇔ invertible.</li>
            <li>
              Ax = 0 with more unknowns than equations always has non-zero
              solutions.
            </li>
          </ul>
        ),
      },
    ],
  },
  "la-projection": {
    unit: "II",
    syllabus: "Projections",
    intro: "A projection keeps one part of every vector and discards another.",
    cards: [
      {
        icon: "def",
        title: "Definition",
        body: (
          <p>
            P is a projection if P² = P. Then V = R(P) ⊕ N(P): P is the
            projection onto R(P) along N(P), and I − P is the complementary
            projection.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Orthogonal projections",
        body: (
          <p>
            If N(P) ⊥ R(P), P is an orthogonal projection; its matrix is
            symmetric. Onto the line through a: P = aaᵀ/(aᵀa). Onto the columns
            of A: P = A(AᵀA)⁻¹Aᵀ.
          </p>
        ),
      },
      {
        icon: "math",
        title: "Eigenvalues",
        body: (
          <p>
            Only 0 and 1: vectors in R(P) are fixed, vectors in N(P) are killed.
            So trace P = rank P.
          </p>
        ),
      },
    ],
  },
  "la-inverse": {
    unit: "II",
    syllabus: "Inverse linear transformation",
    intro: "An invertible transformation loses nothing, so it can be undone.",
    cards: [
      {
        icon: "def",
        title: "Invertibility",
        body: (
          <p>
            T is invertible iff it is a bijection; then T⁻¹ is also linear. For
            square A, the following are equivalent: A invertible, det A ≠ 0,
            rank A = n, N(A) = {"{"}0{"}"}, columns form a basis.
          </p>
        ),
      },
      {
        icon: "math",
        title: "Computing A⁻¹",
        body: (
          <Code>
            {
              "Gauss–Jordan: [A | I]  →  [I | A⁻¹]\n2 × 2: [[a, b], [c, d]]⁻¹ = (1/(ad − bc)) [[d, −b], [−c, a]]"
            }
          </Code>
        ),
      },
      {
        icon: "key",
        title: "Rules",
        body: <p>(AB)⁻¹ = B⁻¹A⁻¹, (Aᵀ)⁻¹ = (A⁻¹)ᵀ, det(A⁻¹) = 1/det A.</p>,
      },
    ],
  },
  "la-change-basis": {
    unit: "II",
    syllabus: "Change of basis",
    intro:
      "The same vector or map has different coordinates in different bases; a change-of-basis matrix translates between them.",
    cards: [
      {
        icon: "math",
        title: "Formulas",
        body: (
          <Code>
            {
              "P = [b₁ b₂ … bₙ]   (new basis as columns)\n[v]_B = P⁻¹ v\n[T]_B = P⁻¹ A P"
            }
          </Code>
        ),
      },
      {
        icon: "key",
        title: "Similarity",
        body: (
          <p>
            A and B are similar if B = P⁻¹AP. Similar matrices represent the
            same map and share rank, determinant, trace, characteristic
            polynomial and eigenvalues.
          </p>
        ),
      },
      {
        icon: "example",
        title: "Why change basis",
        body: (
          <p>
            Choosing an eigenbasis makes the matrix diagonal, which makes
            powers, exponentials and differential equations easy.
          </p>
        ),
      },
    ],
  },
  "la-dual": {
    unit: "II",
    syllabus: "Dual space, Dual bases",
    intro:
      "Linear functionals — linear maps from V to the scalars — form a vector space of their own.",
    cards: [
      {
        icon: "def",
        title: "Dual space",
        body: (
          <p>
            V* = {"{"}f : V → F linear{"}"}. For finite-dimensional V, dim V* =
            dim V. In ℝⁿ a functional is f(x) = aᵀx, a row vector.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Dual basis",
        body: (
          <p>
            For a basis {"{"}b₁, …, bₙ{"}"}, the dual basis {"{"}f₁, …, fₙ{"}"}{" "}
            is defined by fᵢ(bⱼ) = δᵢⱼ. Then v = Σ fᵢ(v) bᵢ. In ℝⁿ the fᵢ are
            the rows of B⁻¹.
          </p>
        ),
      },
      {
        icon: "example",
        title: "Example",
        body: (
          <p>
            For b₁ = (1, 1), b₂ = (1, −1): f₁(x, y) = (x + y)/2, f₂(x, y) = (x −
            y)/2.
          </p>
        ),
      },
    ],
  },
  /* ---------------- Unit III ---------------- */
  "la-det-trace": {
    unit: "III",
    syllabus:
      "Trace and determinant of linear transformation, Transpose of a linear transformation",
    intro: "Two numbers summarise a linear map regardless of basis.",
    cards: [
      {
        icon: "def",
        title: "Determinant",
        body: (
          <ul>
            <li>
              Cofactor expansion: det A = Σⱼ (−1)^(i+j) aᵢⱼ Mᵢⱼ along any row i.
            </li>
            <li>
              |det A| is the volume scale factor; det A &lt; 0 means orientation
              is reversed.
            </li>
            <li>det(AB) = det A · det B, det Aᵀ = det A.</li>
          </ul>
        ),
      },
      {
        icon: "key",
        title: "Trace",
        body: (
          <p>
            trace A = Σ aᵢᵢ; trace(AB) = trace(BA), so trace(P⁻¹AP) = trace A.
            Also trace A = Σλᵢ and det A = Πλᵢ.
          </p>
        ),
      },
      {
        icon: "math",
        title: "Transpose",
        body: (
          <p>
            The transpose T* : W* → V* acts by (T*f)(v) = f(Tv); its matrix is
            Aᵀ. rank Aᵀ = rank A.
          </p>
        ),
      },
    ],
  },
  "la-eigen": {
    unit: "III",
    syllabus: "Eigen values and eigen vectors",
    intro:
      "Eigenvectors are the directions a transformation leaves on their own line.",
    cards: [
      {
        icon: "def",
        title: "Definition",
        body: (
          <p>
            λ is an eigenvalue of A if Av = λv for some v ≠ 0 (an eigenvector).
            The eigenspace of λ is N(A − λI).
          </p>
        ),
      },
      {
        icon: "math",
        title: "Finding them",
        body: (
          <Code>
            {
              "1. Solve det(λI − A) = 0  (characteristic equation)\n2. For each λ, solve (A − λI)v = 0\n2 × 2: λ² − (trace A)λ + det A = 0"
            }
          </Code>
        ),
      },
      {
        icon: "key",
        title: "Facts",
        body: (
          <p>
            Eigenvectors for distinct eigenvalues are independent. Triangular
            matrices have their diagonal as eigenvalues. A is invertible iff 0
            is not an eigenvalue.
          </p>
        ),
      },
    ],
  },
  "la-cayley": {
    unit: "III",
    syllabus: "Minimal polynomials, Cayley–Hamilton theorem",
    intro:
      "Polynomials can be evaluated at matrices, and some of them give the zero matrix.",
    cards: [
      {
        icon: "key",
        title: "Cayley–Hamilton",
        body: (
          <p>
            If p(λ) = det(λI − A), then p(A) = 0. For 2 × 2: A² − (trace A)A +
            (det A)I = 0.
          </p>
        ),
      },
      {
        icon: "def",
        title: "Minimal polynomial",
        body: (
          <p>
            m(λ) is the monic polynomial of least degree with m(A) = 0. It
            divides every polynomial that kills A (including p), and has the
            same roots as p. A is diagonalizable iff m has no repeated roots.
          </p>
        ),
      },
      {
        icon: "exam",
        title: "Applications",
        body: (
          <p>
            If p(λ) = λⁿ + c₁λⁿ⁻¹ + … + cₙ with cₙ ≠ 0, then A⁻¹ = −(1/cₙ)(Aⁿ⁻¹
            + c₁Aⁿ⁻² + … + cₙ₋₁I). High powers of A reduce to combinations of I,
            A, …, Aⁿ⁻¹.
          </p>
        ),
      },
    ],
  },
  "la-diagonalize": {
    unit: "III",
    syllabus: "Diagonalization",
    intro:
      "A matrix is diagonalizable when some basis consists entirely of eigenvectors.",
    cards: [
      {
        icon: "math",
        title: "A = PDP⁻¹",
        body: (
          <Code>
            {
              "P = [v₁ … vₙ]  (independent eigenvectors)\nD = diag(λ₁, …, λₙ)\nAᵏ = P Dᵏ P⁻¹"
            }
          </Code>
        ),
      },
      {
        icon: "key",
        title: "When is it possible?",
        body: (
          <ul>
            <li>n distinct eigenvalues ⇒ diagonalizable.</li>
            <li>
              In general: geometric multiplicity = algebraic multiplicity for
              every λ.
            </li>
            <li>
              Real symmetric matrices are always (orthogonally) diagonalizable.
            </li>
          </ul>
        ),
      },
      {
        icon: "mistake",
        title: "Counter-example",
        body: (
          <p>
            The shear [[1, 1], [0, 1]] has λ = 1 twice but only one eigenvector
            direction: not diagonalizable.
          </p>
        ),
      },
    ],
  },
  "la-jordan": {
    unit: "III",
    syllabus: "Jordan canonical form",
    intro:
      "When a matrix is not diagonalizable, the Jordan form is the simplest matrix it is similar to.",
    cards: [
      {
        icon: "def",
        title: "Jordan blocks",
        body: (
          <Code>
            {
              "J₃(λ) = [[λ, 1, 0],\n         [0, λ, 1],\n         [0, 0, λ]]\nA = P J P⁻¹,  J = J_{k₁}(λ₁) ⊕ J_{k₂}(λ₂) ⊕ …"
            }
          </Code>
        ),
      },
      {
        icon: "key",
        title: "Reading the structure",
        body: (
          <ul>
            <li>Number of blocks for λ = geometric multiplicity.</li>
            <li>Total size of blocks for λ = algebraic multiplicity.</li>
            <li>
              Largest block for λ = multiplicity of λ in the minimal polynomial.
            </li>
            <li>Blocks of size ≥ k: rank(A − λI)ᵏ⁻¹ − rank(A − λI)ᵏ.</li>
          </ul>
        ),
      },
    ],
  },
  "la-norms": {
    unit: "III",
    syllabus: "Matrix norms",
    intro:
      "A norm measures the size of a matrix; an operator norm measures how much it can stretch vectors.",
    cards: [
      {
        icon: "def",
        title: "Common norms",
        body: (
          <Code>
            {
              "‖A‖₁ = max_j Σ_i |aᵢⱼ|      (column sums)\n‖A‖∞ = max_i Σ_j |aᵢⱼ|      (row sums)\n‖A‖₂ = σ_max = √λ_max(AᵀA)\n‖A‖_F = √(Σ aᵢⱼ²)"
            }
          </Code>
        ),
      },
      {
        icon: "key",
        title: "Properties",
        body: (
          <p>
            ‖Ax‖ ≤ ‖A‖‖x‖ and ‖AB‖ ≤ ‖A‖‖B‖ (submultiplicative). Every
            eigenvalue satisfies |λ| ≤ ‖A‖. For symmetric A, ‖A‖₂ = max |λ|.
          </p>
        ),
      },
    ],
  },
  /* ---------------- Unit IV ---------------- */
  "la-inner": {
    unit: "IV",
    syllabus: "Inner product spaces, norm of a vector, orthogonality",
    intro:
      "An inner product adds geometry — length and angle — to a vector space.",
    cards: [
      {
        icon: "def",
        title: "Axioms",
        body: (
          <ul>
            <li>⟨u + v, w⟩ = ⟨u, w⟩ + ⟨v, w⟩, ⟨cu, v⟩ = c⟨u, v⟩.</li>
            <li>⟨u, v⟩ = conj⟨v, u⟩ (symmetric over ℝ).</li>
            <li>⟨v, v⟩ &gt; 0 for v ≠ 0.</li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Inequalities",
        body: (
          <Code>
            {
              "‖v‖ = √⟨v, v⟩\n|⟨u, v⟩| ≤ ‖u‖ ‖v‖        (Cauchy–Schwarz)\n‖u + v‖ ≤ ‖u‖ + ‖v‖        (triangle)\nu ⊥ v ⇒ ‖u + v‖² = ‖u‖² + ‖v‖²  (Pythagoras)"
            }
          </Code>
        ),
      },
      {
        icon: "example",
        title: "Other inner products",
        body: (
          <p>
            ⟨u, v⟩ = uᵀWv for any symmetric positive-definite W; ⟨f, g⟩ = ∫
            f(x)g(x) dx on functions.
          </p>
        ),
      },
    ],
  },
  "la-gram-schmidt": {
    unit: "IV",
    syllabus:
      "Orthonormal set, orthonormal basis, Gram-Schmidt orthonormalization",
    intro:
      "Orthonormal bases make coordinates trivial: the coordinate of v along qᵢ is just ⟨v, qᵢ⟩.",
    cards: [
      {
        icon: "math",
        title: "The process",
        body: (
          <Code>
            {
              "u₁ = v₁,                          q₁ = u₁/‖u₁‖\nu₂ = v₂ − ⟨v₂,q₁⟩q₁,               q₂ = u₂/‖u₂‖\nuₖ = vₖ − Σ_{i<k} ⟨vₖ,qᵢ⟩qᵢ,        qₖ = uₖ/‖uₖ‖"
            }
          </Code>
        ),
      },
      {
        icon: "key",
        title: "Facts",
        body: (
          <p>
            An orthogonal set of non-zero vectors is independent. span{"{"}q₁,
            …, qₖ{"}"} = span{"{"}v₁, …, vₖ{"}"} at every k. If some uₖ = 0, vₖ
            depended on the earlier vectors. In matrix form this is A = QR.
          </p>
        ),
      },
    ],
  },
  "la-orth-proj": {
    unit: "IV",
    syllabus: "Orthogonal projections",
    intro:
      "The orthogonal projection onto a subspace gives the best approximation from that subspace.",
    cards: [
      {
        icon: "math",
        title: "Formulas",
        body: (
          <Code>
            {
              "With an orthonormal basis q₁, …, qₖ of W:\nproj_W v = Σ ⟨v, qᵢ⟩ qᵢ\nWith W = column space of A:\nP = A(AᵀA)⁻¹Aᵀ"
            }
          </Code>
        ),
      },
      {
        icon: "key",
        title: "Best approximation",
        body: (
          <p>
            ‖v − proj_W v‖ ≤ ‖v − w‖ for every w ∈ W, with the error orthogonal
            to W. Least squares: solve AᵀAx̂ = Aᵀb when Ax = b is inconsistent.
          </p>
        ),
      },
    ],
  },
  "la-operators": {
    unit: "IV",
    syllabus:
      "Linear functional and adjoints, Hermitian, self-adjoint, Unitary and normal operators",
    intro:
      "On an inner product space every operator has a partner, its adjoint, and the operators that interact well with it have the best structure.",
    cards: [
      {
        icon: "def",
        title: "Riesz and adjoints",
        body: (
          <p>
            Every linear functional on a finite-dimensional inner product space
            is f(v) = ⟨v, w⟩ for a unique w. The adjoint satisfies ⟨Au, v⟩ = ⟨u,
            A*v⟩; for matrices A* is the conjugate transpose.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Special operators",
        body: (
          <ul>
            <li>
              <b>Self-adjoint / Hermitian</b>: A* = A. Real eigenvalues,
              orthogonal eigenvectors.
            </li>
            <li>
              <b>Unitary</b> (orthogonal over ℝ): A*A = I. Preserves lengths and
              angles; |λ| = 1.
            </li>
            <li>
              <b>Normal</b>: A*A = AA*. Includes both of the above.
            </li>
          </ul>
        ),
      },
      {
        icon: "exam",
        title: "Spectral theorem",
        body: (
          <p>
            A is normal ⇔ it is unitarily diagonalizable: A = UDU* with U
            unitary. Real symmetric matrices are orthogonally diagonalizable: A
            = QDQᵀ.
          </p>
        ),
      },
    ],
  },
  /* ---------------- Unit V ---------------- */
  "la-bilinear": {
    unit: "V",
    syllabus: "Bilinear forms, symmetric and skew-symmetric bilinear forms",
    intro:
      "A bilinear form is a function of two vectors that is linear in each.",
    cards: [
      {
        icon: "def",
        title: "Matrix of a form",
        body: (
          <p>
            B(u, v) = uᵀMv with Mᵢⱼ = B(eᵢ, eⱼ). Changing basis by P replaces M
            by PᵀMP (congruence), not P⁻¹MP.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Symmetric and skew",
        body: (
          <ul>
            <li>Symmetric: B(u, v) = B(v, u) ⇔ M = Mᵀ.</li>
            <li>
              Skew-symmetric: B(u, v) = −B(v, u) ⇔ M = −Mᵀ; then B(v, v) = 0.
            </li>
            <li>Every form: M = (M + Mᵀ)/2 + (M − Mᵀ)/2.</li>
          </ul>
        ),
      },
      {
        icon: "math",
        title: "Rank",
        body: (
          <p>
            The rank of B is the rank of M (basis-independent). B is
            non-degenerate when M is invertible.
          </p>
        ),
      },
    ],
  },
  "la-quadratic": {
    unit: "V",
    syllabus: "Real quadratic forms, positive definiteness",
    intro:
      "A quadratic form is B(x, x) for a symmetric bilinear form; its shape is decided by the signs of the eigenvalues.",
    cards: [
      {
        icon: "def",
        title: "Quadratic form",
        body: (
          <p>
            q(x) = xᵀSx with S symmetric; q(x, y) = ax² + 2bxy + cy² has S =
            [[a, b], [b, c]]. Orthogonal diagonalization S = QDQᵀ gives q =
            λ₁y₁² + … + λₙyₙ² along the principal axes.
          </p>
        ),
      },
      {
        icon: "key",
        title: "Positive definite ⇔",
        body: (
          <ul>
            <li>q(x) &gt; 0 for all x ≠ 0;</li>
            <li>all eigenvalues of S are positive;</li>
            <li>all leading principal minors are positive (Sylvester);</li>
            <li>S = RᵀR for some invertible R.</li>
          </ul>
        ),
      },
      {
        icon: "exam",
        title: "Signature",
        body: (
          <p>
            Sylvester's law of inertia: the numbers of positive, negative and
            zero coefficients are the same in every diagonal form. Indefinite
            forms give saddles; definite ones give bowls.
          </p>
        ),
      },
    ],
  },
};

export function LaTheory({ topic }: { topic: string }) {
  const n = notes[topic];
  return n ? <NotesPanel note={n} unit={n.unit} /> : null;
}
