import type { ReactNode } from "react";
import { RamExplorer } from "../components/daa/unit1/RamExplorer";
import { AsymptoticExplorer } from "../components/daa/unit1/AsymptoticExplorer";
import { ComplexityExplorer } from "../components/daa/unit1/ComplexityExplorer";
import { ParadigmExplorer } from "../components/daa/unit1/ParadigmExplorer";
import {
  Unit1Theory,
  hasUnit1Theory,
} from "../components/daa/unit1/Unit1Theory";
import { SortingExplorer } from "../components/daa/unit2/SortingExplorer";
import { LinearSortExplorer } from "../components/daa/unit2/LinearSortExplorer";
import { TreeExplorer } from "../components/daa/unit2/TreeExplorer";
import { HeapExplorer } from "../components/daa/unit2/HeapExplorer";
import { HashExplorer } from "../components/daa/unit2/HashExplorer";
import { StringExplorer } from "../components/daa/unit2/StringExplorer";
import {
  Unit2Theory,
  hasUnit2Theory,
} from "../components/daa/unit2/Unit2Theory";
import { RepresentationExplorer } from "../components/daa/unit3/RepresentationExplorer";
import { TraversalExplorer } from "../components/daa/unit3/TraversalExplorer";
import { ComponentsExplorer } from "../components/daa/unit3/ComponentsExplorer";
import { TopoExplorer } from "../components/daa/unit3/TopoExplorer";
import { BiconnectedExplorer } from "../components/daa/unit3/BiconnectedExplorer";
import { ShortestPathExplorer } from "../components/daa/unit3/ShortestPathExplorer";
import {
  Unit3Theory,
  hasUnit3Theory,
} from "../components/daa/unit3/Unit3Theory";
import {
  DijkstraImplExplorer,
  FractionalExplorer,
  HuffmanExplorer,
  MSTExplorer,
} from "../components/daa/unit4/GreedyExplorers";
import {
  BinomialExplorer,
  KnapsackDPExplorer,
  LCSExplorer,
  MatrixChainExplorer,
} from "../components/daa/unit4/DPExplorers";
import {
  Unit4Theory,
  hasUnit4Theory,
} from "../components/daa/unit4/Unit4Theory";
import {
  NPCExplorer,
  PvsNPExplorer,
} from "../components/daa/unit5/ClassExplorers";
import {
  ReductionExplorer,
  SATExplorer,
} from "../components/daa/unit5/SatExplorers";
import {
  HamiltonExplorer,
  TSPExplorer,
} from "../components/daa/unit5/HamTspExplorers";
import {
  Unit5Theory,
  hasUnit5Theory,
} from "../components/daa/unit5/Unit5Theory";
import { daaIdeas, daaUnits } from "../domain/daa/units";
import type { Course } from "./types";

/** The interactive visualizer for each topic id. */
const explorers: Course["explorers"] = {
  ram: (s) => <RamExplorer onSteps={s} />,
  asymptotic: () => <AsymptoticExplorer />,
  complexity: (s) => <ComplexityExplorer onSteps={s} />,
  paradigms: (s) => <ParadigmExplorer onSteps={s} />,
  sorting: (s) => <SortingExplorer onSteps={s} />,
  linear: (s) => <LinearSortExplorer onSteps={s} />,
  trees: (s) => <TreeExplorer onSteps={s} />,
  heaps: (s) => <HeapExplorer onSteps={s} />,
  hashing: (s) => <HashExplorer onSteps={s} />,
  matching: (s) => <StringExplorer onSteps={s} />,
  representations: () => <RepresentationExplorer />,
  traversal: (s) => <TraversalExplorer onSteps={s} />,
  components: (s) => <ComponentsExplorer onSteps={s} />,
  topological: (s) => <TopoExplorer onSteps={s} />,
  biconnected: (s) => <BiconnectedExplorer onSteps={s} />,
  shortest: (s) => <ShortestPathExplorer onSteps={s} />,
  mst: (s) => <MSTExplorer onSteps={s} />,
  dijkstra: (s) => <DijkstraImplExplorer onSteps={s} />,
  greedy: (s) => <FractionalExplorer onSteps={s} />,
  huffman: (s) => <HuffmanExplorer onSteps={s} />,
  binomial: (s) => <BinomialExplorer onSteps={s} />,
  matrixchain: (s) => <MatrixChainExplorer onSteps={s} />,
  lcs: (s) => <LCSExplorer onSteps={s} />,
  dp: (s) => <KnapsackDPExplorer onSteps={s} />,
  pnp: (s) => <PvsNPExplorer onSteps={s} />,
  npc: (s) => <NPCExplorer onSteps={s} />,
  reductions: (s) => <ReductionExplorer onSteps={s} />,
  sat: (s) => <SATExplorer onSteps={s} />,
  hamiltonian: (s) => <HamiltonExplorer onSteps={s} />,
  tsp: (s) => <TSPExplorer onSteps={s} />,
};

/** Syllabus theory notes, one component per unit. */
const theoryNotes: [
  (id: string) => boolean,
  (p: { topic: string }) => ReactNode,
][] = [
  [hasUnit1Theory, Unit1Theory],
  [hasUnit2Theory, Unit2Theory],
  [hasUnit3Theory, Unit3Theory],
  [hasUnit4Theory, Unit4Theory],
  [hasUnit5Theory, Unit5Theory],
];

export const daaCourse: Course = {
  subjectId: "daa",
  units: daaUnits,
  ideas: daaIdeas,
  explorers,
  notes: (topic) => {
    const found = theoryNotes.find(([has]) => has(topic));
    if (!found) return null;
    const Notes = found[1];
    return <Notes topic={topic} />;
  },
  footer: "VATRIX · DESIGN & ANALYSIS OF ALGORITHMS LAB",
};
