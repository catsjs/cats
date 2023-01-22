import { resolve, extname } from "path";
import fsExtra from "fs-extra";
import { findUpSync } from "find-up";
import yaml from "js-yaml";
import mocha from "mocha/lib/cli/index.js";
export { default as addContext } from "mochawesome/addContext.js";

import initCache from "./cache.js";
import initResources from "./resources.js";

const { readJSON } = fsExtra;

export const types = {
  protocol: "protocol",
  content: "content",
};

const parameters = {
  protocol: {
    required: true,
  },
};

const dsl = {
  actions: {},
};

const CONFIG_FILES = [
  //'.catsrc.cjs',
  ".catsrc.js",
  ".catsrc.yaml",
  ".catsrc.yml",
  ".catsrc.json",
];

const parsers = {
  yaml: (rcPath) =>
    fsExtra.readFile(rcPath, "utf8").then((doc) => yaml.load(doc)),
  js: (rcPath) => {
    const { default: rc } = import(rcPath);
    return rc;
  },
  json: (rcPath) => fsExtra.readJSON(rcPath),
};

const loadConfig = async (rcPath) => {
  let config = {};

  const ext = extname(rcPath);
  try {
    if (ext === ".yml" || ext === ".yaml") {
      config = await parsers.yaml(rcPath);
    } else if (ext === ".js" || ext === ".cjs") {
      config = await parsers.js(rcPath);
    } else {
      config = await parsers.json(rcPath);
    }
  } catch (err) {
    throw createUnparsableFileError(
      `Unable to read/parse ${rcPath}: ${err}`,
      rcPath
    );
  }
  return config;
};

const validateParameters = (schema, values, requiredBy) => {
  Object.keys(schema).forEach((param) => {
    if (schema[param].required && !values[param]) {
      throw new Error(
        `Required parameter '${param}' is not set (required by ${requiredBy}).`
      );
    }
  });
};

const validatePlugin = (plugin, name, opts) => {
  if (plugin === undefined) {
    throw new Error(`Invalid ${name}, no matching plugin found.`);
  }

  validateParameters(plugin.parameters, opts, name);
};

const applyDsl = (plugin, name) => {
  if (!plugin.dsl) return;

  if (plugin.dsl.actions) {
    Object.keys(plugin.dsl.actions).forEach((action) => {
      if (dsl.actions[action]) {
        throw new Error(
          `DSL action '${action}' does already exist (provided by ${name}).`
        );
      }

      dsl.actions[action] = plugin.dsl.actions[action];
    });
  }
};
const loadPlugin = async (name) =>
  await import(name).then((plugin) => plugin.default);

const loadPlugins = async (opts) => {
  const { plugins, protocol, contentTypes, verbose } = opts;

  /*const resolvedPlugins = await Promise.all(
    plugins.map(
      async (plugin) => await import(plugin).then((plugin) => plugin.default)
    )
  );*/

  const protocolPlugin = await loadPlugin(protocol);
  /*const protocolPlugin = resolvedPlugins.find(
    (plugin) => plugin.type === "protocol" && plugin.name === protocol
  );*/

  validatePlugin(protocolPlugin, `protocol '${protocol}'`, opts);

  applyDsl(protocolPlugin, `protocol '${protocol}'`);

  if (verbose) {
    console.log("PROTOCOL", protocolPlugin);
  }

  const contentPlugins = {};

  for (const contentType of contentTypes) {
    //await contentTypes.forEach(async (contentType) => {
    const contentPlugin = await loadPlugin(contentType);
    /*const contentPlugin = resolvedPlugins.find(
      (plugin) => plugin.type === "content" && plugin.name === contentType
    );*/

    validatePlugin(contentPlugin, `content type '${contentType}'`, opts);

    applyDsl(contentPlugin, `content type '${contentType}'`);

    contentPlugins[contentPlugin.name] = contentPlugin.init(opts);

    if (verbose) {
      console.log("CONTENT", contentPlugin);
    }
  }

  return { protocolPlugin, contentPlugins };
};

const loadOpts = async (rootDir) => {
  //const rootDir = process.cwd();
  const pkgPath = resolve(rootDir, "package.json");
  const rcPath = findUpSync(CONFIG_FILES, { cwd: rootDir });
  //const rcPath = resolve(rootDir, ".catsrc.js");

  const pkg = await readJSON(pkgPath);
  //const { default: rc } = await import(rcPath);
  const rc = await loadConfig(rcPath);

  if (rc.verbose) {
    console.log("RC", rcPath);
    console.log(rc);
  }

  const mocharc = mocha.loadRc();

  if (rc.verbose) {
    console.log("MOCHARC", mocharc);
  }

  const opts = {
    title: pkg.name,
    description: pkg.description,
    ...rc,
    name: pkg.name,
    version: pkg.version,
    cache: initCache({ ...rc, rootDir }),
    resources: initResources({ ...rc, rootDir }),
    rootDir,
    mocha: mocharc,
  };

  if (rc.verbose) {
    console.log("OPTS", opts);
  }

  return opts;
};

let core;

export const init = async (rootDir = process.cwd()) => {
  if (!core) {
    const opts = await loadOpts(rootDir);

    validateParameters(parameters, opts, "core");

    const { protocolPlugin, contentPlugins } = await loadPlugins(opts);

    const shared = {};

    const save = (key, value, context = "GLOBAL") => {
      if (!shared[context]) shared[context] = {};
      shared[context][key] = value;
      if (opts.verbose) {
        console.log("SAVED", key, context);
      }
    };

    const load = (key, context = "GLOBAL") => {
      if (!shared[context]) shared[context] = {};
      return shared[context][key];
    };

    const loadOr = (key, or, context = "GLOBAL") => {
      return shared[context] && shared[context][key] ? load(key, context) : or;
    };

    const setup = async (title, fn) => {
      const key = "__HOOKS__";
      const value = await fn();

      save(key, [...loadOr(key, []), { title, value }]);
    };

    const content = (type) =>
      Object.values(contentPlugins).find(
        (plugin) =>
          (plugin.mediaTypePattern && plugin.mediaTypePattern.test(type)) ||
          (plugin.mediaTypes && plugin.mediaTypes.includes(type))
      );

    //TODO: server -> [protocol]
    core = {
      opts,
      api: protocolPlugin.init(opts),
      ...contentPlugins,
      dsl,
      content,
      save,
      load,
      loadOr,
      setup,
    };
  }

  return core;
};

export const getHooks = () => {
  if (!core) {
    console.error("CORE NOT LOADED YET");
    return [];
  }
  return core.loadOr("__HOOKS__", []);
};
