import { WebRequestParam, ProviderCanonicalName, WebRequestData } from "ski-providers";
import { Delta } from "jsondiffpatch";
import * as Highland from "highland";
import { PathLike } from "fs";

export { WebRequestData, WebRequestParam, ProviderCanonicalName } from "ski-providers";

export type ProcessParams = (wrp: WebRequestParam[]) => any;

export type DiffData = Delta | undefined;

export type StreamData = Highland.Stream<WebRequestData>;

// Interceptor Config
export type Matcher = {
  name: string;
  snapshotFile: PathLike;
  filter: {
    label: string;
    value: string | RegExp;
  }[];
};

export type EventInterceptor = {
  provider: ProviderCanonicalName;
  matchers: Matcher[];
  ignoreParamsForComparison?: (string | RegExp)[];
};

export type ClickStep = {
  click: string
}

export type WaitStep = {
  wait: number
}

export type Step = ClickStep | WaitStep;

export type RunConfig = {
  eventInterceptors: EventInterceptor[]
  steps: Step[]
};
