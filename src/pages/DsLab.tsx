import { LabPage } from "./LabPage";
import { dsCourse } from "../courses/ds";

/** Route entry for /data-structures (its own lazily loaded chunk). */
export default function DsLab() {
  return <LabPage course={dsCourse} />;
}
