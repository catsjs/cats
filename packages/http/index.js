import { types } from "@catsjs/core";
import http from "./http.js";
import crawl from "./crawl.js";
export { default as comparator } from "./comparator.js";

export default {
  type: types.protocol,
  name: "http",
  parameters: {
    api: {
      required: true,
    },
  },
  dsl: {
    actions: {
      crawl,
    },
  },
  init: (opts) => http(opts.api),
};
