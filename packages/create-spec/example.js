import { init } from "@catsjs/core";

const { api, json } = await init();

describe(
  {
    title: "Star Wars API",
    description:
      "This example spec uses the [Star Wars API](https://swapi.dev).",
  },
  () => {
    describe(
      {
        title: "Starships",
        description: "Some assertions about famous starships.",
      },
      () => {
        it(
          {
            title:
              "The Millenium Falcon can take 4 crew members and 6 passengers",
            description: "Should pass.",
          },
          () =>
            api
              .get("/starships/10/")
              .expect(200)
              .expect("Content-Type", "application/json")
              .expect((res) =>
                json.of(res.body).matches({
                  crew: "4",
                  passengers: "6",
                })
              )
        );
        it(
          {
            title: "An X-wing can take 1 pilot and 2 passengers",
            description: "Should fail, change `2` to `0` to make it pass.",
          },
          () =>
            api
              .get("/starships/12/")
              .expect(200)
              .expect("Content-Type", "application/json")
              .expect((res) =>
                json.of(res.body).matches({
                  crew: "1",
                  passengers: "2",
                })
              )
        );
      }
    );
  }
);
