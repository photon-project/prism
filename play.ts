import { Run } from "./src/Runner";
import { Launch } from "./src/Browser";
import { RunConfig } from "./src/types/Types";

const config: RunConfig = {
  steps: [
    { name: "wait", time: 2000 },
    { name: "click", selector: ".map-expand-button__icon" },
    { name: "wait", time: 2000 },
  ],
  eventMatchers: [
    {
      provider: "Snowplow",
      name: "Expand Map",
      snapshotFile: "data/expand_map.json",
      ignoreParamKeysForComparison: ["aid"],
      filters: [
        {
          path: "$.meta.title",
          value: "expand_map",
        },
        // {
        //   path: "$.params[0].label",
        //   value: "Context Payload",
        // }
      ],
    },
  ],
};

const main = async () => {
  try {
    return Run(
      "https://www.realestate.com.au/sold/property-apartment-vic-highett-124470098",
      // "https://www.realestate.com.au/sold/in-apollo+bay%2c+vic+3233%3b/list-1?activeSort=price-asc",
      config,
      "compare"
    )
      .run()
      .then(res =>
        res.fold(error => console.error(`errored out: ${error}`), data => console.log(JSON.stringify(data, null, 4))),
      );
  } catch (e) {
    console.log("Run error: ", e);
  }
};

main();

// Launch("https://www.realestate.com.au/sold/property-apartment-vic-highett-124470098", ["AdobeAnalyticsAppMeasurement"])
//   .then(e => {
//     e.each(x => console.log("final", x));
//   })
//   .catch(console.log);
