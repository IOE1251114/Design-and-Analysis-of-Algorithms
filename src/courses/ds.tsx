import { DsTheory } from "../components/ds/DsTheory";
import {
  ArrayMemoryExplorer,
  ArrayOpsExplorer,
  BasicsExplorer,
  SearchExplorer,
  SparseExplorer,
} from "../components/ds/unit1/ArrayExplorers";
import {
  BacktrackingExplorer,
  RecursionExplorer,
} from "../components/ds/unit2/RecursionExplorers";
import {
  LinkedListExplorer,
  PolynomialExplorer,
} from "../components/ds/unit2/ListExplorers";
import {
  ExpressionExplorer,
  HanoiExplorer,
  MazeExplorer,
  QueueExplorer,
  StackExplorer,
} from "../components/ds/unit3/StackQueueExplorers";
import {
  ExpressionTreeExplorer,
  GeneralThreadedExplorer,
  TreeBasicsExplorer,
  TrieExplorer,
} from "../components/ds/unit4/TreeExplorers";
import {
  ElementarySortExplorer,
  KeysExternalExplorer,
  MultigraphExplorer,
} from "../components/ds/unit5/SortGraphExplorers";
// Topics shared with the Algorithms course reuse its visualizers.
import { HashExplorer } from "../components/daa/unit2/HashExplorer";
import { HeapExplorer } from "../components/daa/unit2/HeapExplorer";
import { SortingExplorer } from "../components/daa/unit2/SortingExplorer";
import { TreeExplorer } from "../components/daa/unit2/TreeExplorer";
import { RepresentationExplorer } from "../components/daa/unit3/RepresentationExplorer";
import { TopoExplorer } from "../components/daa/unit3/TopoExplorer";
import { TraversalExplorer } from "../components/daa/unit3/TraversalExplorer";
import { HuffmanExplorer } from "../components/daa/unit4/GreedyExplorers";
import { dsIdeas, dsUnits } from "../domain/ds/units";
import type { Course } from "./types";

const explorers: Course["explorers"] = {
  "ds-basics": () => <BasicsExplorer />,
  "ds-array-memory": () => <ArrayMemoryExplorer />,
  "ds-array-ops": (s) => <ArrayOpsExplorer onSteps={s} />,
  "ds-search": (s) => <SearchExplorer onSteps={s} />,
  "ds-sparse": (s) => <SparseExplorer onSteps={s} />,
  "ds-recursion": (s) => <RecursionExplorer onSteps={s} />,
  "ds-backtracking": (s) => <BacktrackingExplorer onSteps={s} />,
  "ds-linked": (s) => <LinkedListExplorer onSteps={s} />,
  "ds-polynomial": (s) => <PolynomialExplorer onSteps={s} />,
  "ds-stack": (s) => <StackExplorer onSteps={s} />,
  "ds-hanoi": (s) => <HanoiExplorer onSteps={s} />,
  "ds-queue": (s) => <QueueExplorer onSteps={s} />,
  "ds-pq": (s) => <HeapExplorer onSteps={s} />,
  "ds-expressions": (s) => <ExpressionExplorer onSteps={s} />,
  "ds-maze": (s) => <MazeExplorer onSteps={s} />,
  "ds-tree-basics": (s) => <TreeBasicsExplorer onSteps={s} />,
  "ds-expression-tree": (s) => <ExpressionTreeExplorer onSteps={s} />,
  "ds-bst": (s) => <TreeExplorer onSteps={s} />,
  "ds-huffman": (s) => <HuffmanExplorer onSteps={s} />,
  "ds-general-threaded": (s) => <GeneralThreadedExplorer onSteps={s} />,
  "ds-trie": (s) => <TrieExplorer onSteps={s} />,
  "ds-elementary-sorts": (s) => <ElementarySortExplorer onSteps={s} />,
  "ds-advanced-sorts": (s) => <SortingExplorer onSteps={s} />,
  "ds-keys-external": (s) => <KeysExternalExplorer onSteps={s} />,
  "ds-hashing": (s) => <HashExplorer onSteps={s} />,
  "ds-graph-rep": () => <RepresentationExplorer />,
  "ds-graph-traversal": (s) => <TraversalExplorer onSteps={s} />,
  "ds-topo": (s) => <TopoExplorer onSteps={s} />,
  "ds-multigraph": () => <MultigraphExplorer />,
};

export const dsCourse: Course = {
  subjectId: "ds",
  units: dsUnits,
  ideas: dsIdeas,
  explorers,
  notes: (topic) => <DsTheory topic={topic} />,
  footer: "VATRIX · DATA STRUCTURES LAB",
};
