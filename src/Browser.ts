import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither";
import * as Highland from "highland";
import * as puppeteer from "puppeteer";
import { Request, Page } from "puppeteer";
import { SkiProviderHelpers, WebRequestData } from "ski-providers";

import { parse } from "./Parser";
import { StreamData, Step, ClickStep, WaitStep } from "./types/Types";
import { map } from "fp-ts/lib/Array";
import when from "when-switch";

export const Launch = (url: string, masterPattern: RegExp, steps: Step[]): TaskEither<string, StreamData> => {
  return tryCatch(() => {
    return puppeteer.launch().then(async browser => {
      const page = await browser.newPage();
      const requestEvent$ = setupRequestEvent$(page, masterPattern);

      await page.goto(url, { waitUntil: "load" });

      await Promise.all(runSteps(page, steps));

      await await browser.close();

      return requestEvent$;
    });
  }, e => `Error processing Browser request: ${e}`);
};

const runSteps = (page: Page, steps: Step[]): Promise<void>[] => {
  return map(async s => {
    try {
      await applyStep(page, s);
    } catch (e) {
      console.log(`Error running step: ${s.name}: `, e);
    }
  }, steps);
};

const applyStep = (page: Page, step: Step): Promise<void> => {
  switch (step.name) {
    case "click":
      console.log("clicking...");
      const clickStep = step as ClickStep;
      return page.click(clickStep.selector);
    case "wait":
      console.log("waiting...");
      const waitStep = step as WaitStep;
      return sleep(waitStep.time);
    default:
      return Promise.resolve();
  }
};

const setupRequestEvent$ = (page: Page, masterPattern: RegExp): Highland.Stream<WebRequestData> => {
  return Highland("requestfinished", page)
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
};

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
