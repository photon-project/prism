import { PathLike, readFileSync, writeFileSync } from "fs";
import { TaskEither, taskEither, tryCatch } from "fp-ts/lib/TaskEither";

export const ReadSnapshot = (snapshotPath: PathLike): TaskEither<string, {}> => {
  return tryCatch(() => Promise.resolve(JSON.parse(readFileSync(snapshotPath).toString())), JSON.stringify);
};

export const WriteSnapshot = (snapshotPath: PathLike, contents: string): TaskEither<string, string> => {
  return tryCatch(() => {
    writeFileSync(snapshotPath, contents);
    return Promise.resolve("Snapshotted!");
  }, JSON.stringify);
};
