import { merge } from "merge-anything";

export const types = {
  protocol: "protocol",
  content: "content",
};

export const validateParameters = (schema, opts, requiredBy) => {
  Object.keys(schema).forEach((param) => {
    if (schema[param].required && !opts[param]) {
      throw new Error(
        `Required parameter '${param}' is not set (required by ${requiredBy}).`
      );
    }
  });
};

const resolve = (schema, opts, isDefaults) => {
  const parameters = {};

  if (typeof schema === "object" && typeof opts === "object") {
    Object.keys(schema).forEach((param) => {
      if (isDefaults) {
        parameters[param] = schema[param];
      }
      if (Object.hasOwn(opts, param)) {
        if (isDefaults && typeof opts[param] === "object") {
          parameters[param] = merge(schema[param], opts[param]);
        } else {
          parameters[param] = opts[param];
        }
      }
    });
  }

  return parameters;
};

const validatePlugin = (plugin, name, opts) => {
  if (plugin === undefined) {
    throw new Error(`Invalid ${name}, no matching plugin found.`);
  }

  validateParameters(plugin.parameters, opts, name);
};

const applyDsl = (dsl, plugin, pluginName) => {
  if (!plugin.dsl) return;

  Object.keys(dsl).forEach((type) => {
    if (plugin.dsl[type]) {
      Object.keys(plugin.dsl[type]).forEach((name) => {
        if (dsl[type][name]) {
          throw new Error(
            `DSL ${type} already contains '${name}' (provided by '${pluginName}').`
          );
        }

        dsl[type][name] = plugin.dsl[type][name];
      });
    }
  });
};

const loadPlugin = async (parameters, label, dsl, opts) => {
  const module =
    typeof parameters === "string" ? parameters : parameters.plugin;

  const plugin = await import(module).then((m) => m.default);

  validatePlugin(plugin, label, opts);

  const initParams = resolve(plugin.parameters, opts);
  const defaults = resolve(plugin.defaults, parameters.defaults, true);

  applyDsl(dsl, plugin, label);

  if (opts.verbose) {
    console.log("PLUGIN", plugin);
  }

  return plugin.init(initParams, defaults);
};

export const loadPlugins = async (opts) => {
  const { protocol, contentTypes } = opts;

  const dsl = {
    creators: {},
    actions: {},
    assertions: {},
  };

  const protocolPlugin = await loadPlugin(
    protocol,
    `protocol '${protocol}'`,
    dsl,
    opts
  );

  const contentPlugins = {};

  for (const contentType of contentTypes) {
    const contentPlugin = await loadPlugin(
      contentType,
      `content type '${contentType}'`,
      dsl,
      opts
    );

    contentPlugins[contentPlugin.name] = contentPlugin;
  }

  return { dsl, protocolPlugin, contentPlugins };
};
