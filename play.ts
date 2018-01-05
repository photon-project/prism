import { Run } from "./src/Runner";
import { Launch } from "./src/Browser";
import { RunConfig } from "./src/types/Types";

const config: RunConfig = {
  steps: [{ click: "" }, { wait: 1000 }],
  eventInterceptors: [
    {
      provider: "Snowplow",
      matchers: [
        {
          name: "awesome",
          snapshotFile: "awesome",
          filter: [
            {
              label: "tre",
              value: "tre",
            },
          ],
        },
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
      "compare",
    )
      .run()
      .then(res =>
        res.fold(
          error => console.error(`errored out: ${error}`),
          data => console.log(JSON.stringify(data, null, 2)),
        ),
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
