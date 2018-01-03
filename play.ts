import { Run } from "./src/Runner";
import { Launch } from "./src/Launcher";

Run(
  "https://www.realestate.com.au/sold/property-apartment-vic-highett-124470098",
  ["AdobeAnalyticsAppMeasurement"],
  "test.json",
  "compare"
).
then(
  (e) => e.each(console.log)
).catch(console.log)

// Launch("https://www.realestate.com.au/sold/property-apartment-vic-highett-124470098", ["AdobeAnalyticsAppMeasurement"])
//   .then(e => {
//     e.each(x => console.log("final", x));
//   })
//   .catch(console.log);
