import { SkiProviderHelpers } from 'ski-providers';
import puppeteer from 'puppeteer';
import { parse } from './parser';

puppeteer.launch().then(async browser => {
  const masterPattern = SkiProviderHelpers.generateMasterPattern(['Snowplow']);
  const page = await browser.newPage();
  await page.setRequestInterceptionEnabled(true);
  page.on('request', interceptedRequest => {
    if(SkiProviderHelpers.matchesBroadly(interceptedRequest.url, masterPattern)){
      const parsed = parse(interceptedRequest.url);
      const provider = SkiProviderHelpers.lookupByUrl(interceptedRequest.url);
      console.log(provider.transformer({params: parsed}));
    }
    interceptedRequest.continue();
  });
  await page.goto('https://www.realestate.com.au/sold/property-apartment-vic-highett-124470098');
  await browser.close();
});