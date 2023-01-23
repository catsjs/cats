import { types } from "@catsjs/core";
import agent, { apply } from "./agent.js";
import crawl from "./crawl.js";
import request from "./request.js";
import { status } from "./assertions.js";

export { default as comparator } from "./comparator.js";
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
    },
    actions: {
      crawl,
    },
    assertions: {
      status,
    },
  },
  init: (parameters, defaults) => {
    const api = agent(parameters.api);

    apply(api, defaults);

    return api;
  },
};
