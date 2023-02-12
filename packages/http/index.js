import { types } from "@catsjs/core";
import agent, { apply } from "./agent.js";
import crawl from "./crawl.js";
import request from "./request.js";
import { status, equals } from "./assertions.js";
import { compare, compareTo } from "./comparator.js";

export { comparator } from "./comparator.js";
export { default as crawl } from "./crawl.js";

let d = {};

export default {
  type: types.protocol,
  name: "http",
  parameters: {
    api: {
      required: true,
    },
  },
  defaults: {
    accept: undefined,
    headers: {},
    redirects: 2,
  },
  dsl: {
    creators: {
      request,
      compare: (params, api1) => {
        const { to, vars, ...p } = params;
        const api2 = agent(vars.load(to));
        apply(api2, d);
        return compare({ api2, ...p }, api1);
      },
    },
    actions: {
      crawl,
    },
    assertions: {
      status,
      equals,
    },
  },
  init: (parameters, defaults) => {
    d = defaults;
    const api = agent(parameters.api);

    apply(api, defaults);

    //TODO: does this change the prototype in a way that the proxy no longer works?
    api.crawl = (params) => crawl(params, api.core);
    api.compareTo = (other, params) => {
      const api2 = agent(other);

      apply(api2, defaults);
      return compareTo(api, api2, params);
    };

    return api;
  },
};
