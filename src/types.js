// @flow

export type WebRequestParam = {|
  label: string,
  value: string,
  valueType: "string" | "json",
  category?: string | null;
|};

export type WebRequestData = {|
  meta?: {
    title: string
  },
  params: Array<WebRequestParam>
|};