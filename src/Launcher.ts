import { SkiProviderHelpers } from "ski-providers";
import * as puppeteer from "puppeteer";
import { Parse } from "./Parser";
import { ProcessParams, WebRequestParam, ProviderCanonicalName } from "./types/Types";

export const Launch = (url: string, providers: ProviderCanonicalName[], processParams: ProcessParams): Promise<void> => {
  return new Promise((res, rej) => {
    puppeteer.launch().then(async browser => {
      const masterPattern = SkiProviderHelpers.generateMasterPattern(providers);
      const page = await browser.newPage();
      await page.setRequestInterception(true);

      page.on("request", interceptedRequest => {
        if (SkiProviderHelpers.matchesBroadly(interceptedRequest.url, masterPattern)) {
          processParams(Parse(interceptedRequest.url));
        }
        interceptedRequest.continue();
      });

      await page.goto(url);
      const close = await browser.close();
      res(close);
    }).catch(rej);
  });
};
