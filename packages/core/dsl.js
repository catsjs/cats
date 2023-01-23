import yaml from "js-yaml";
import fsExtra from "fs-extra";
import mocha from "mocha/lib/cli/index.js";
import { init } from "@catsjs/core";

const cats = await init();
const { api, opts, dsl, vars, setup } = cats;

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
  for (let j = 0; j < assertions.length; j++) {
    res = execute("assertions", assertions[j], req, title);
  }

  return res;
};

const execute = (category, { type, ...parameters }, obj, requiredBy) => {
  const typ =
    !type && Object.keys(parameters).length === 1
      ? Object.keys(parameters)[0]
      : type;

  if (!dsl[category][typ]) {
    throw new Error(
      `DSL ${category} '${typ}' does not exist (required by '${requiredBy}').`
    );
  }

  return dsl[category][typ](parameters, obj);
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
          await execute("actions", actions[j], cats, title);
        }
      });
    }
  }

  if (!Array.isArray(suites)) {
    return;
  }

  for (let i = 0; i < suites.length; i++) {
    suite(suites[i]);
  }
};

const suite = ({ title, timeout, slow, vars, tests, ...parameterDefaults }) => {
  describe({ title, timeout, slow }, () => {
    if (Array.isArray(tests)) {
      for (let i = 0; i < tests.length; i++) {
        const {
          foreach,
          type,
          title,
          timeout,
          slow,
          assertions,
          ...parameters
        } = tests[i];
        const options = {
          title,
          timeout,
          slow,
          yml: yaml.dump(tests[i], { indent: 2, noArrayIndent: true }),
        };
        console.log("IN", parameterDefaults, parameters);
        if (foreach) {
          generator(
            foreach,
            vars,
            type,
            { ...parameterDefaults, ...parameters },
            assertions,
            options
          );
        } else {
          test(
            type,
            { ...parameterDefaults, ...parameters },
            assertions,
            options
          );
        }
      }
    }
  });
};

const test = (type = "request", parameters, assertions, options) => {
  console.log("PARAMS", parameters);
  it(options, () => {
    const res = execute(
      "creators",
      { type, ...parameters },
      api,
      options.title
    );

    return assert(res, options.title, assertions);
  });
};

//TODO: load shared
const generator = (
  foreach,
  suiteVars,
  type,
  parameters,
  assertions,
  options
) => {
  const values = vars.orLoad(foreach, suiteVars);
  console.log("VAR", foreach, values);

  if (!values || !Array.isArray(values)) {
    console.error("foreach: " + foreach + " not found");
    return;
  }

  for (let i = 0; i < values.length; i++) {
    const current = values[i];

    //TODO: subst all params/options
    test(
      type,
      {
        ...parameters,
        path: parameters.path ? subst(parameters.path, current) : undefined,
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
