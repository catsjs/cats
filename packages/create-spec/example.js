import { init } from "@catsjs/core";

const { api, json } = await init();

describe({ title: "Millenium Falcon", foo: "bar" }, function () {
  it(
    { title: "can take 3 crew members and 6 passengers", bar: "foo" },
    function (done) {
      api
        .context(this)
        .get("/starships/10/")
        .expect(200)
        .expect("Content-Type", "application/json")
        .expect((res) =>
          json.of(res.body).matches({
            crew: "3",
            passengers: "6",
          })
        )
        .end(done);
    }
  );
});
