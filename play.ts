import { Launch } from "./src/Launcher";

Launch(
  "https://www.realestate.com.au/sold/property-apartment-vic-highett-124470098",
  ["AdobeAnalyticsAppMeasurement"],
  console.log
).then(
  () => console.log('Complete!')
).catch((e) => console.error('Error: ', JSON.stringify(e)))
