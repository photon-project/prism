import { DiffPatcher, Delta } from "jsondiffpatch";
import { TaskEither, fromEither } from "fp-ts/lib/TaskEither";
import { Either, fromNullable, tryCatch, right } from 'fp-ts/lib/Either';
import { omit, isNil } from "ramda";

const Differ = new DiffPatcher();

export const Compare = (matcherName: string, ignoreParams: string[], a: {}, b: {}): TaskEither<{}, {}> => {
  const filteredA = omit(ignoreParams, a);
  const filteredB = omit(ignoreParams, b);
  const diff = Differ.diff(filteredA, filteredB) || { message: "No difference" };
  const cleanDiff = right({
    name: matcherName,
    diff: diff,
  });

  return fromEither(cleanDiff);
};
