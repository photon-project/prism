import { DiffPatcher, Delta } from "jsondiffpatch";
import { TaskEither, fromEither } from "fp-ts/lib/TaskEither";
import { Either, fromNullable } from "fp-ts/lib/Either";
import { omit } from "ramda";

const Differ = new DiffPatcher();

export const Compare = (ignoreParams: string[], a: {}, b: {}): TaskEither<string, Delta> => {
  const filteredA = omit(ignoreParams, a);
  const filteredB = omit(ignoreParams, b);
  return fromEither(fromNullable("No Difference")(Differ.diff(filteredA, filteredB)));
};
