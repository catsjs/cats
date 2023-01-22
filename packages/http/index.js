import { types } from "@catsjs/core";
import agent from "./agent.js";
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
  dsl: {
    request,
    actions: {
      crawl,
    },
    assertions: {
      status,
    },
  },
  init: (opts) => agent(opts.api),
};
