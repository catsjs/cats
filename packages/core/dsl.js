import yaml from "js-yaml";
import fsExtra from "fs-extra";
import mocha from "mocha/lib/cli/index.js";
import { init } from "@catsjs/core";
import util from "util";

const { api, opts, json, html, load, save, setup } = await init();

export async function mochaGlobalSetup() {
  await loadDsl();
}

const loadDsl = async () => {
  const files = mocha.lookupFiles(
    opts.mocha.spec || "test",
    [".yml"],
    opts.mocha.recursive
  );

  if (opts.verbose) {
    console.log("DSL", files);
  }

  for (let i = 0; i < files.length; i++) {
    const data = fsExtra.readFileSync(files[i], "utf8");
    const loaded = yaml.load(data);

    await apply(loaded);
  }
};

const agent = (req) => {
  const res = api[req.method.toLowerCase()](req.path);

  //TODO: headers, redirects, etc

  return res;
};

const ass = (req, assertions = []) => {
  let res = req;

  //TODO: body, etc
  assertions.forEach((assertion) => {
    if (assertion.status) {
      res = res.expect(assertion.status);
    }
  });

  return res;
};

const apply = async (spec) => {
  const { setup: setupDsl, suites, ...options } = spec;

  if (Array.isArray(setupDsl)) {
    for (let i = 0; i < setupDsl.length; i++) {
      const { title, actions } = setupDsl[i];

      if (!Array.isArray(actions)) {
        continue;
      }

      await setup(title, async () => {
        for (let j = 0; j < actions.length; j++) {
          const { type, ...options } = actions[j];

          if (type === "crawl") {
            const { sort, save: saveAs } = options;
            await html
              .crawl(api, opts)
              .then((result) => {
                if (sort) {
                  result.links.sort();
                }
                console.log(
                  "LINKS2",
                  result,
                  result.links.length,
                  [...new Set(result.links)].length
                );

                if (saveAs) {
                  save(saveAs, result.links);
                }
                return "CRAWL LOG";
              })
              //ignore errors in setup, requests will be repeated in test
              .catch((e) => {
                console.error(e);

                if (saveAs) {
                  save(saveAs, []);
                }
                return e;
              });
          }
        }
      });
    }
  }

  if (!Array.isArray(suites)) {
    return;
  }

  for (let i = 0; i < suites.length; i++) {
    const { tests, ...options } = suites[i];

    describe(options, () => {
      if (!Array.isArray(tests)) {
        return;
      }

      for (let j = 0; j < tests.length; j++) {
        const { request, assertions, ...options } = tests[j];

        it(options, () => {
          if (request) {
            return ass(agent(request), assertions);
          }
        });
      }
    });
  }
};