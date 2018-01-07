import { WebRequestParam, ProviderCanonicalName, WebRequestData, Provider } from "ski-providers";
import { Delta } from "jsondiffpatch";
import * as Highland from "highland";
import { PathLike } from "fs";

export type ProcessParams = (wrp: WebRequestParam[]) => any;

export type DiffData = Delta | undefined;

export type StreamData = Highland.Stream<WebRequestData>;

export type WebRequestDataEnvelope = {
  provider: Provider
  data: WebRequestData
}

// Interceptor Config
export type EventMatcher = {
  name: string;
  provider: ProviderCanonicalName;
  snapshotFile: PathLike;
  filters: {
    path: string;
    value: string | RegExp;
  }[];
  ignoreParamKeysForComparison?: (string | RegExp)[];
};

export interface BasicStep {
  name: string;
}

export interface ClickStep extends BasicStep {
  name: "click";
  selector: string;
}

export interface WaitStep {
  name: "wait";
  time: number;
}

export type Step = ClickStep | WaitStep;

export type RunConfig = {
  eventMatchers: EventMatcher[]
  steps: Step[]
};
