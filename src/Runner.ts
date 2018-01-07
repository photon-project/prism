import { curry } from "fp-ts/lib/function";
import { PathLike } from "fs";
import { map, values, find, all, identity, propOr, reduce, assoc } from "ramda";
import { SkiProviderHelpers, WebRequestData, WebRequestParam } from "ski-providers";
import * as JsonPath from "jsonpath";

import { Launch } from "./Browser";
import { Compare } from "./Comparator";
import { ReadSnapshot, WriteSnapshot } from "./Snapshot";
import { RunConfig, StreamData, WebRequestDataEnvelope, EventMatcher } from "./types/Types";
import { fromNullable, Either } from "fp-ts/lib/Either";
import { TaskEither, fromEither, chain, tryCatch, taskEither } from "fp-ts/lib/TaskEither";
import { flatten } from "fp-ts/lib/Chain";
import { array, isEmpty } from "fp-ts/lib/Array";
import { sequence } from "fp-ts/lib/Traversable";
import { ProviderCanonicalName } from "ski-providers/dist/types/Types";
import { lift } from "fp-ts/lib/Functor";
import { Delta } from "jsondiffpatch/src";

type Action = "compare" | "write";

type MatchedRow = {
  snapshotFile: string;
  ignoreParams: string[];
  envelope: WebRequestDataEnvelope;
};

export const Run = (url: string, config: RunConfig, action: Action = "compare"): TaskEither<string, any> => {
  const processor = action === "write" ? curry(writer) : curry(comparator);
  const providers = map(ei => ei.provider, config.eventMatchers);
  const masterPattern = SkiProviderHelpers.generateMasterPattern(providers);

  const wrdTe = flatten(taskEither)(
    Launch(url, masterPattern, config.steps).map(stream => {
      return tryCatch(() => {
        const data = stream.collect().toPromise(Promise) as Promise<WebRequestData[]>;
        stream.end(); // clean up
        return data;
      }, () => "Could not read from Webrequest stream");
    }),
  );

  const parsedRaw = wrdTe.map(wrd => sequence(taskEither, array)(map(parseParams, wrd)));

  const parsed = flatten(taskEither)(parsedRaw);
  const matchedRaw = parsed.map(wrdes => {
    return sequence(taskEither, array)(map(em => filterForMatcher(wrdes, em), config.eventMatchers));
  });

  const matched = flatten(taskEither)(matchedRaw);

  if (action === "write") {
    const writers = lift(array)(writer);
    return flatten(taskEither)(matched.map(writers).map(a => sequence(taskEither, array)(a)));
  } else {
    const comparators = lift(array)(comparator);
    return flatten(taskEither)(matched.map(comparators).map(a => sequence(taskEither, array)(a)));
  }
};

const writer = (mr: MatchedRow): TaskEither<string, string> => {
  const snapshotFile = mr.snapshotFile;
  const wrps = mr.envelope.data;
  return WriteSnapshot(snapshotFile, JSON.stringify(wrps));
};

const comparator = (mr: MatchedRow): TaskEither<string, any> => {
  const snapshotFile = mr.snapshotFile;
  const wrps = mr.envelope.data.params;

  return ReadSnapshot(snapshotFile)
    .map(d => propOr({}, "params", d))
    .map(transformParams)
    .chain(curry(Compare)(mr.ignoreParams)(transformParams(wrps)))
};

const transformParams = (wrps: WebRequestParam[]): {} => {
  return reduce(
    (acc, wrp) => {
      const val = wrp.valueType === "json" ? safeJsonParse(wrp.value) : wrp.value;
      return assoc(wrp.label, val, acc);
    },
    {},
    wrps,
  );
};

const safeJsonParse = (json: string): {} => {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.log(e);
    return {};
  }
};

const parseParams = (wrd: WebRequestData): TaskEither<string, WebRequestDataEnvelope> => {
  const url = wrd.meta.requestUrl;
  const provider = fromNullable(`Could not find a Provider for ${url}`)(SkiProviderHelpers.lookupByUrl(url));
  const data = provider.map(p => {
    return {
      data: p.transformer(wrd),
      provider: p,
    } as WebRequestDataEnvelope;
  });
  return fromEither(data);
};

const filterForMatcher = (wrdes: WebRequestDataEnvelope[], em: EventMatcher): TaskEither<string, MatchedRow> => {
  const extracted = isEmpty(wrdes)
    ? wrdes[0]
    : find(wrde => {
        return all((a: boolean) => a, map(f => match(JsonPath.value(wrde.data, f.path), f.value), em.filters));
      }, wrdes);

  const extractedEither = fromNullable("No matching events found")(extracted).map(d => {
    return {
      snapshotFile: em.snapshotFile,
      ignoreParams: em.ignoreParamKeysForComparison,
      envelope: d,
    } as MatchedRow;
  });
  return fromEither(extractedEither);
};

const match = (a: string, b: string | RegExp): boolean => {
  switch (typeof b) {
    case "string":
      return a === b;
    default:
      const pattern = b as RegExp;
      try {
        return pattern.test(a);
      } catch (e) {
        return false;
      }
  }
};
