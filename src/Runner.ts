import { ProcessParams, WebRequestParam, ProviderCanonicalName, StreamData } from "./types/Types";
import { PathLike, readFileSync, accessSync, constants } from "fs";
import { Launch } from './Launcher';
import { TaskEither, taskEither, tryCatch } from "fp-ts/lib/TaskEither";
import { curry } from "fp-ts/lib/function";
import { WriteSnapshot, ReadSnapshot } from "./Snapshot";
import { Compare } from "./Comparator";
import { map, values } from "ramda";

type Action = "compare" | "write";

export const Run = (
  url: string,
  providers: ProviderCanonicalName[],
  snapshotFile: PathLike,
  action: Action,
): Promise<StreamData> => {
  const processor = action === "write" ? curry(writer) : curry(comparator);
  return Launch(url, providers);
};

const writer = (snapshotFile: PathLike, wrps: WebRequestParam[]): void => {
  WriteSnapshot(snapshotFile, JSON.stringify(wrps))
    .run()
    .then(console.log)
    .catch(console.error);
};

const comparator = (snapshotFile: PathLike, wrps: WebRequestParam[]): any => {
  return ReadSnapshot(snapshotFile)
    .map(transformParams)
    .chain(curry(Compare)(transformParams(wrps)))
    .map(values).run().then(a => console.log(JSON.stringify(a, null, 4))).catch(console.error);
};

const transformParams = (wrps: WebRequestParam[]): {} => {
  return map(wrp => {
    return { [wrp.label]: wrp.value };
  }, wrps);
};
