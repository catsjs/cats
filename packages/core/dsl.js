import yaml from "js-yaml";
import fsExtra from "fs-extra";
import mocha from "mocha/lib/cli/index.js";
import { init } from "@catsjs/core";
import util from "util";

const cats = await init();
const { api, opts, dsl, json, html, load, save, setup } = cats;

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

const assert = (req, title, assertions = []) => {
  let res = req;

  //TODO: body, etc
  assertions.forEach((assertion) => {
    const { type, ...parameters } = assertion;

    const typ =
      !type && Object.keys(parameters).length === 1
        ? Object.keys(parameters)[0]
        : type;

    if (!dsl.assertions[typ]) {
      throw new Error(
        `DSL assertion '${typ}' does not exist (required by '${title}').`
      );
    }

    dsl.assertions[typ](parameters, req);
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
          const { type, ...parameters } = actions[j];

          if (!dsl.actions[type]) {
            throw new Error(
              `DSL action '${type}' does not exist (required by '${title}').`
            );
          }

          await dsl.actions[type](parameters, cats);
        }
      });
    }
  }

  if (!Array.isArray(suites)) {
    return;
  }

  for (let i = 0; i < suites.length; i++) {
    const { tests, generators, data, ...options } = suites[i];

    suite(tests, generators, data, options);
  }
};

const suite = (tests, generators, data, options) => {
  describe(options, () => {
    if (Array.isArray(tests)) {
      for (let i = 0; i < tests.length; i++) {
        const { request, assertions, ...options } = tests[i];

        test(request, assertions, {
          ...options,
          yml: yaml.dump(tests[i], { indent: 2, noArrayIndent: true }),
        });
      }
    }

    if (Array.isArray(generators)) {
      for (let i = 0; i < generators.length; i++) {
        const { each, request, assertions, ...options } = generators[i];

        generator(each, request, assertions, data, {
          ...options,
          yml: yaml.dump(generators[i], { indent: 2, noArrayIndent: true }),
        });
      }
    }
  });
};

const test = (request, assertions, options) => {
  it(options, () => {
    if (request) {
      const res = dsl.request(api, request);

      return assert(res, options.title, assertions);
    }
  });
};

//TODO: load shared
const generator = (each, request, assertions, data, options) => {
  if (!data || !Array.isArray(data[each])) {
    console.error("each: " + each + " not found");
    return;
  }

  for (let i = 0; i < data[each].length; i++) {
    const current = data[each][i];

    test(
      {
        ...request,
        path: request.path ? subst(request.path, current) : undefined,
      },
      assertions,
      {
        ...options,
        title: options.title ? subst(options.title, current) : undefined,
        description: options.description
          ? subst(options.description, current)
          : undefined,
      }
    );
  }
};

//TODO: matcher, objects
const subst = (str, val) => {
  return str.replaceAll(/\$\{\.\}/g, val);
};
