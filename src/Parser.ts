import { WebRequestParam } from "./types/Types";
import { toPairs, map } from "ramda";
import * as querystring from "querystring";

const URL = require("url");

export const Parse = (url: string): WebRequestParam[] => {
  const parsed = new URL.parse(url);
  const data: WebRequestParam[] = map(createWebRequestParam, toPairs(querystring.parse(parsed.query)));
  return data;
};

const createWebRequestParam = (tuple: [string, string]): WebRequestParam => {
  return { label: tuple[0], value: tuple[1], valueType: "string" };
};
