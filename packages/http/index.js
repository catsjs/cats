import { types } from "@catsjs/core";
import agent, { apply } from "./agent.js";
import crawl from "./crawl.js";
import request from "./request.js";
import { status, equals } from "./assertions.js";
import { compare, compareTo } from "./comparator.js";

export { comparator } from "./comparator.js";
export { default as crawl } from "./crawl.js";

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
      compare,
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
    const api = agent(parameters.api);

    apply(api, defaults);

    //TODO: does this change the prototype in a way that the proxy no longer works?
    api.crawl = (params) => crawl(params, api.core);
    api.compareTo = (other, params) => compareTo(api, other, params);

    return api;
  },
};
