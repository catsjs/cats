import { types } from "@catsjs/core";
import agent, { apply } from "./agent.js";
import crawl from "./crawl.js";
import request from "./request.js";
import { status, equals } from "./assertions.js";
import { compare } from "./comparator.js";

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

    return api;
  },
};
