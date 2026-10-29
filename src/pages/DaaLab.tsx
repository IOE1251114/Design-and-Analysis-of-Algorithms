import { LabPage } from "./LabPage";
import { daaCourse } from "../courses/daa";

/** Route entry for /algorithms (its own lazily loaded chunk). */
export default function DaaLab() {
  return <LabPage course={daaCourse} />;
}
