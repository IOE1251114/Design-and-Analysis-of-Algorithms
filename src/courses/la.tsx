import { LaTheory } from "../components/la/LaTheory";
import {
  ComplexSpaceExplorer,
  MatrixSpaceExplorer,
  PolySpaceExplorer,
  R3Explorer,
} from "../components/la/unit1/GalleryExplorers";
import {
  BasisExplorer,
  DirectSumExplorer,
  SpanExplorer,
  StructuresExplorer,
  SubspaceExplorer,
} from "../components/la/unit1/SpaceExplorers";
import {
  ChangeBasisExplorer,
  DualExplorer,
  InverseExplorer,
  ProjectionExplorer,
  RankNullityExplorer,
  TransformExplorer,
} from "../components/la/unit2/TransformExplorers";
import {
  CayleyHamiltonExplorer,
  DetTraceExplorer,
  DiagonalizeExplorer,
  EigenExplorer,
  JordanExplorer,
  NormsExplorer,
} from "../components/la/unit3/EigenExplorers";
import {
  GramSchmidtExplorer,
  InnerProductExplorer,
  OperatorsExplorer,
  OrthProjectionExplorer,
} from "../components/la/unit4/InnerExplorers";
import {
  BilinearExplorer,
  QuadraticExplorer,
} from "../components/la/unit5/FormExplorers";
import { laIdeas, laUnits } from "../domain/la/units";
import type { Course } from "./types";

const explorers: Course["explorers"] = {
  "la-structures": () => <StructuresExplorer />,
  "la-vector-spaces": () => <SubspaceExplorer />,
  "la-r3": () => <R3Explorer />,
  "la-matrix-space": () => <MatrixSpaceExplorer />,
  "la-poly-space": () => <PolySpaceExplorer />,
  "la-complex-space": () => <ComplexSpaceExplorer />,
  "la-span": () => <SpanExplorer />,
  "la-basis": () => <BasisExplorer />,
  "la-direct-sum": () => <DirectSumExplorer />,
  "la-transform": (s) => <TransformExplorer onSteps={s} />,
  "la-rank-nullity": (s) => <RankNullityExplorer onSteps={s} />,
  "la-projection": () => <ProjectionExplorer />,
  "la-inverse": (s) => <InverseExplorer onSteps={s} />,
  "la-change-basis": () => <ChangeBasisExplorer />,
  "la-dual": () => <DualExplorer />,
  "la-det-trace": () => <DetTraceExplorer />,
  "la-eigen": () => <EigenExplorer />,
  "la-cayley": (s) => <CayleyHamiltonExplorer onSteps={s} />,
  "la-diagonalize": () => <DiagonalizeExplorer />,
  "la-jordan": () => <JordanExplorer />,
  "la-norms": () => <NormsExplorer />,
  "la-inner": () => <InnerProductExplorer />,
  "la-gram-schmidt": (s) => <GramSchmidtExplorer onSteps={s} />,
  "la-orth-proj": () => <OrthProjectionExplorer />,
  "la-operators": () => <OperatorsExplorer />,
  "la-bilinear": () => <BilinearExplorer />,
  "la-quadratic": () => <QuadraticExplorer />,
};

export const laCourse: Course = {
  subjectId: "la",
  units: laUnits,
  ideas: laIdeas,
  explorers,
  notes: (topic) => <LaTheory topic={topic} />,
  footer: "VATRIX · LINEAR ALGEBRA LAB",
};
