import { resolve } from "path";
import fsExtra from "fs-extra";
import initCache from "./cache.js";
import initResources from "./resources.js";
export { default as addContext } from "mochawesome/addContext.js";
export { default as mocharc } from "./mocharc.cjs";
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
    const rcPath = resolve(rootDir, ".catsrc.js");
    console.log("RC", rcPath);

    const pkg = await readJSON(pkgPath);
    const { default: rc } = await import(rcPath);
    const opts = {
      title: pkg.name,
      description: pkg.description,
      ...rc,
      name: pkg.name,
      version: pkg.version,
      cache: initCache({ ...rc, rootDir }),
      resources: initResources({ ...rc, rootDir }),
      rootDir,
    };
    console.log("OPTS", opts);

    validateParameters(parameters, opts, "core");

    const { plugins, protocol, contentTypes } = opts;

    const resolvedPlugins = await Promise.all(
      plugins.map(
        async (plugin) => await import(plugin).then((plugin) => plugin.default)
      )
    );

    console.log("PLUGINS", resolvedPlugins);

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

    //TODO: server -> [protocol]
    core = {
      opts,
      server: protocolPlugin.init(opts),
      ...contentPlugins,
      save: (key, value, context = "GLOBAL") => {
        if (!shared[context]) shared[context] = {};
        shared[context][key] = value;
        console.log("SAVED", key, context);
      },
      load: (key, context = "GLOBAL") => {
        if (!shared[context]) shared[context] = {};
        return shared[context][key];
      },
    };
  }

  return core;
};
