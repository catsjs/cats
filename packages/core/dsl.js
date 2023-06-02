import yaml from "js-yaml";
import fsExtra from "fs-extra";
import mocha from "mocha/lib/cli/index.js";
import { get, set, keys, isArray, isObject } from "radash";
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

const initDsl = (category, { type, ...parameters }, options, requiredBy) => {
  const typ =
    !type && Object.keys(parameters).length === 1
      ? Object.keys(parameters)[0]
      : type;

  const initializer = dsl[category][typ] && dsl[category][typ].init;

  if (!initializer) {
    return options;
  }

  return initializer(options, parameters);
};

const execute = (category, { type, ...parameters }, obj, requiredBy) => {
  const typ =
    !type && Object.keys(parameters).length === 1
      ? Object.keys(parameters)[0]
      : type;

  const executor =
    dsl[category][typ] && (dsl[category][typ].execute || dsl[category][typ]);

  if (!executor) {
    throw new Error(
      `DSL ${category} '${typ}' does not exist (required by '${requiredBy}').`
    );
  }

  return executor(parameters, obj, cats);
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

const suite = ({
  title,
  description,
  timeout,
  slow,
  vars,
  suites,
  tests,
  ...parameterDefaults
}) => {
  describe({ title, description, timeout, slow }, () => {
    if (Array.isArray(suites)) {
      for (let i = 0; i < suites.length; i++) {
        suite(suites[i]);
      }
      return;
    }
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
        if (opts.verbose) {
          console.log("IN", parameterDefaults, parameters);
        }
        if (foreach) {
          generator(
            foreach,
            vars,
            type,
            {
              ...parameterDefaults,
              ...parameters,
              vars: cats.vars.merge(vars),
            },
            assertions,
            options
          );
        } else {
          test(
            type,
            {
              ...parameterDefaults,
              ...parameters,
              vars: cats.vars.merge(vars),
            },
            assertions,
            options
          );
        }
      }
    }
  });
};

const test = (type = "request", parameters, assertions, options) => {
  const options2 = initDsl("creators", { type, ...parameters }, options);

  it(options2, () => {
    const res = execute(
      "creators",
      { type, ...parameters },
      api,
      options2.title
    );

    return assert(res, options2.title, assertions);
  });
};

const generator = (
  foreach,
  suiteVars,
  type,
  parameters,
  assertions,
  options
) => {
  const values = vars.orLoad(foreach, suiteVars);
  if (opts.verbose) {
    console.log("VAR", foreach, values);
  }
  if (!values || !Array.isArray(values)) {
    console.error("foreach: " + foreach + " not found");
    return;
  }

  for (let i = 0; i < values.length; i++) {
    const current = values[i];

    //TODO: subst yml
    test(
      type,
      substituteDeep(parameters, current, ["vars"]),
      substituteDeep(assertions, current),
      substituteDeep(options, current, ["yml"])
    );
  }
};

const exact = /^\$\{([\.A-Za-z]+)\}$/;
const any = /\$\{([\.A-Za-z]+)\}/g;

const substituteDeep = (src, subst, ignore = []) => {
  if (!isArray(src) && !isObject(src)) {
    return src;
  }

  if (isArray(src)) {
    return src.map((item) => substituteDeep(item, subst, ignore));
  }

  let result = src;

  for (const key of keys(src)) {
    if (ignore.find((ign) => key.startsWith(ign))) {
      continue;
    }

    const val = get(src, key);
    const next = substitute(val, subst);
    //console.log(key, val, next);

    if (val !== next) {
      result = set(result, key, next);
    }
  }
  return result;
};

const substitute = (src, subst) => {
  if (exact.test(src)) {
    return substituteRef(src, subst);
  }
  if (any.test(src)) {
    return substituteStr(src, subst);
  }

  return src;
};

const substituteStr = (str, subst) => {
  return str.replaceAll(any, (match, ref) => {
    return ref === "." ? subst : get(subst, ref);
  });
};

const substituteRef = (ref, subst) => {
  const found = exact.exec(ref);

  if (found) {
    return ref === "." ? subst : get(subst, found[1]);
  }

  return ref;
};
