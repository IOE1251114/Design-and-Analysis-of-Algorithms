import { LabPage } from "./LabPage";
import { laCourse } from "../courses/la";

/** Route entry for /linear-algebra (its own lazily loaded chunk). */
export default function LaLab() {
  return <LabPage course={laCourse} />;
}
