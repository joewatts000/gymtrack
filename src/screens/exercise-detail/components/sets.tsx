import { NoSetsText } from "./no-sets-text";
import Set from "./set";

export function Sets({
  sets,
  updateSet,
  removeSet,
  weightInputRefs,
  repsInputRefs,
}: any) {
  return (
    <>
      {sets.length === 0 && <NoSetsText />}
      {sets.map((item: any, index: number) => (
        <Set
          key={item.id}
          item={item}
          index={index}
          onChange={updateSet}
          onRemove={removeSet}
          weightRef={(r) => (weightInputRefs.current[item.id] = r)}
          repsRef={(r) => (repsInputRefs.current[item.id] = r)}
          showRemove={sets.length > 1 || item.weight != null || item.reps != null}
        />
      ))}
    </>
  );
}
