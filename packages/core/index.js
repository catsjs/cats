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

let core;

export const init = async (rootDir = process.cwd()) => {
  if (!core) {
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

    validateParameters(parameters, opts, "core");

    const { plugins, protocol, contentTypes } = opts;

    const resolvedPlugins = await Promise.all(
      plugins.map(
        async (plugin) => await import(plugin).then((plugin) => plugin.default)
      )
    );

    if (rc.verbose) {
      console.log("PLUGINS", resolvedPlugins);
    }

    const protocolPlugin = resolvedPlugins.find(
      (plugin) => plugin.type === "protocol" && plugin.name === protocol
    );

    validatePlugin(protocolPlugin, `protocol '${protocol}'`, opts);

    const contentPlugins = {};

    contentTypes.forEach((contentType) => {
      const contentPlugin = resolvedPlugins.find(
        (plugin) => plugin.type === "content" && plugin.name === contentType
      );

      validatePlugin(contentPlugin, `content type '${contentType}'`, opts);

      contentPlugins[contentType] = contentPlugin.init(opts);
    });

    const shared = {};

    const save = (key, value, context = "GLOBAL") => {
      if (!shared[context]) shared[context] = {};
      shared[context][key] = value;
      if (rc.verbose) {
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

    //TODO: server -> [protocol]
    core = {
      opts,
      api: protocolPlugin.init(opts),
      ...contentPlugins,
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
