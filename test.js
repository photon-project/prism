const puppeteer = require('puppeteer');

puppeteer.launch().then(async browser => {
  const page = await browser.newPage();
  await page.setRequestInterceptionEnabled(true);
  page.on('request', interceptedRequest => {
    console.log(interceptedRequest.url);
    interceptedRequest.continue();
  });
  await page.goto('https://www.realestate.com.au/sold/property-apartment-vic-highett-124470098');
  await browser.close();
});