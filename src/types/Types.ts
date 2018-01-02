import { WebRequestParam } from "ski-providers";

export { WebRequestData, WebRequestParam, ProviderCanonicalName } from "ski-providers";

export type ProcessParams = (wrp: WebRequestParam[]) => void
