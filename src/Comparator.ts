import { DiffPatcher, Delta } from "jsondiffpatch";
import { TaskEither, fromEither } from "fp-ts/lib/TaskEither";
import { Either, fromNullable } from "fp-ts/lib/Either";

const Differ = new DiffPatcher();

export const Compare = (a: {}, b: {}): TaskEither<string, Delta> => {
  return fromEither(fromNullable("No Difference")(Differ.diff(a, b)));
};
