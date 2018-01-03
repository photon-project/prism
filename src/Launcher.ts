import { SkiProviderHelpers } from "ski-providers";
import * as puppeteer from "puppeteer";
import { Request } from "puppeteer";
import { Parse } from "./Parser";
import { ProcessParams, WebRequestParam, ProviderCanonicalName, StreamData } from "./types/Types";
import  * as Highland from "highland";
import { append } from "ramda";

export const Launch = (url: string, providers: ProviderCanonicalName[]): Promise<StreamData> => {
  return new Promise((res, rej) => {
    puppeteer
      .launch()
      .then(async browser => {
        const masterPattern = SkiProviderHelpers.generateMasterPattern(providers);
        const page = await browser.newPage();
        const event$ = Highland("requestfinished", page)
          .filter(req => {
            const r = req as Request;
            return SkiProviderHelpers.matchesBroadly(r.url, masterPattern);
          })
          .map(req => {
            const r = req as Request;
            return r.url;
          });
        await page.goto(url);
        await sleep(3000)
        const close = await browser.close();
        res(event$)
      })
      .catch(e => console.error("Erroring", e));
  });
};

const sleep = (ms: number): Promise<void> => {
  console.log("sleeping...");
  return new Promise(resolve => setTimeout(resolve, ms));
};
