import { WebRequestParam } from "ski-providers";
import { Delta } from "jsondiffpatch";
import * as Highland from "highland";

export { WebRequestData, WebRequestParam, ProviderCanonicalName } from "ski-providers";

export type ProcessParams = (wrp: WebRequestParam[]) => any

export type DiffData = Delta | undefined;

export type StreamData = Highland.Stream<string>
