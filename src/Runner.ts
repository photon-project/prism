import { curry, identity } from "fp-ts/lib/function";
import { PathLike } from "fs";
import { map, values } from "ramda";
import { SkiProviderHelpers, WebRequestData } from "ski-providers";

import { Launch } from "./Browser";
import { Compare } from "./Comparator";
import { ReadSnapshot, WriteSnapshot } from "./Snapshot";
import { RunConfig, StreamData, WebRequestParam } from "./types/Types";
import { fromNullable } from "fp-ts/lib/Either";
import { TaskEither, fromEither, chain, tryCatch, taskEither } from "fp-ts/lib/TaskEither";
import { flatten } from "fp-ts/lib/Chain";
import { array } from "fp-ts/lib/Array";
import { sequence } from "fp-ts/lib/Traversable";

type Action = "compare" | "write";

export const Run = (url: string, config: RunConfig, action: Action): TaskEither<string, WebRequestData[]> => {
  const processor = action === "write" ? curry(writer) : curry(comparator);
  const providers = map(ei => ei.provider, config.eventInterceptors);
  const masterPattern = SkiProviderHelpers.generateMasterPattern(providers);

  const wrdTe = flatten(taskEither)(
    Launch(url, masterPattern).map(stream => {
      return tryCatch(
        () => {
          const data = stream.collect().toPromise(Promise) as Promise<WebRequestData[]>
          stream.end() // clean up
          return data
        },
        () => "Could not read from Webrequest stream",
      );
    }),
  );

  const parsed = wrdTe.map(wrd => sequence(taskEither, array)(map(parseParams, wrd)));

  return flatten(taskEither)(parsed);
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
    .map(values)
    .run()
    .then(a => console.log(JSON.stringify(a, null, 4)))
    .catch(console.error);
};

const transformParams = (wrps: WebRequestParam[]): {} => {
  return map(wrp => {
    return { [wrp.label]: wrp.value };
  }, wrps);
};

const parseParams = (wrd: WebRequestData): TaskEither<string, WebRequestData> => {
  const url = wrd.meta.requestUrl;
  const provider = fromNullable(`Could not find a Provider for ${url}`)(SkiProviderHelpers.lookupByUrl(url));
  const data = provider.map(p => p.transformer(wrd));
  console.log(`processing ${url}`)
  return fromEither(data);
};
