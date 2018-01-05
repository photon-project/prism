import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither";
import * as Highland from "highland";
import * as puppeteer from "puppeteer";
import { Request } from "puppeteer";
import { SkiProviderHelpers, WebRequestData } from "ski-providers";

import { parse } from "./Parser";
import { StreamData } from "./types/Types";

export const Launch = (url: string, masterPattern: RegExp): TaskEither<string, StreamData> => {
  return tryCatch(() => {
    return puppeteer.launch().then(async browser => {
      const page = await browser.newPage();
      const event$ = Highland("requestfinished", page)
        .filter(req => {
          const r = req as Request;
          return SkiProviderHelpers.matchesBroadly(r.url, masterPattern);
        })
        .map(req => {
          const r = req as Request;
          const wrd: WebRequestData = {
            meta: {
              requestUrl: r.url,
            },
            params: parse(r.url),
          };
          return wrd;
        });
      await page.goto(url);
      await sleep(1000);
      const close = await browser.close();

      return event$;
    });
  }, e => `Error processing Browser request: ${e}`);
};

const sleep = (ms: number): Promise<void> => {
  console.log(`sleeping for ${ms / 1000} seconds...`);
  return new Promise(resolve => setTimeout(resolve, ms));
};
