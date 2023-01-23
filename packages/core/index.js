import { loadOpts } from "./config.js";
import { loadPlugins, validateParameters } from "./plugins.js";
import initVars from "./vars.js";
import initCache from "./cache.js";
import initResources from "./resources.js";

export { default as addContext } from "mochawesome/addContext.js";
export { types } from "./plugins.js";

const parameters = {
  protocol: {
    required: true,
  },
};

let core;

export const init = async (rootDir = process.cwd()) => {
  if (!core) {
    const opts = await loadOpts(rootDir);

    validateParameters(parameters, opts, "core");

    const { dsl, protocolPlugin, contentPlugins } = await loadPlugins(opts);

    const vars = initVars(opts);

    const setup = async (title, fn) => {
      const key = "__HOOKS__";
      const value = await fn();

      vars.save(key, [...vars.loadOr(key, []), { title, value }]);
    };

    const content = (type) =>
      Object.values(contentPlugins).find(
        (plugin) =>
          (plugin.mediaTypePattern && plugin.mediaTypePattern.test(type)) ||
          (plugin.mediaTypes && plugin.mediaTypes.includes(type))
      );

    core = {
      opts,
      api: protocolPlugin,
      ...contentPlugins,
      dsl,
      vars,
      content,
      setup,
      cache: initCache({ rootDir }),
      resources: initResources({ rootDir }),
    };
  }

  return core;
};

export const getHooks = () => {
  if (!core) {
    console.error("CORE NOT LOADED YET");
    return [];
  }
  return core.vars.loadOr("__HOOKS__", []);
};
