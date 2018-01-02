import { ProcessParams, WebRequestParam, ProviderCanonicalName } from "./types/Types";
import { PathLike, readFileSync, accessSync, constants } from "fs";
import { Launch } from "./Launcher";
import { TaskEither, taskEither, tryCatch } from "fp-ts/lib/TaskEither";

export const Run = (
  url: string,
  providers: ProviderCanonicalName[],
  snapshotFile: PathLike,
  overWrite: boolean = false,
) => {
  const file = getFile(snapshotFile);
  // Launch
};

const getFile = (filePath: PathLike): TaskEither<string, string> => {
  return tryCatch(
    () => Promise.resolve(readFileSync(filePath).toString()),
    JSON.stringify,
  );
};
