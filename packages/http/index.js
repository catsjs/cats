import { types } from "@catsjs/core";
import http from "./http.js";

export default {
  type: types.protocol,
  name: "http",
  parameters: {
    endpoint: {
      required: true,
    },
  },
  init: (opts) => http(opts.endpoint),
};
