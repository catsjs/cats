import { types } from "@catsjs/core";
import { busywait } from "busywait";
import agent, { apply } from "./agent.js";
import crawl from "./crawl.js";
import request from "./request.js";
import { status, content, equals } from "./assertions.js";
import { compare, compareTo } from "./comparator.js";

export { comparator } from "./comparator.js";
export { default as crawl } from "./crawl.js";
export { default as request } from "./request.js";

let d = {};

export default {
  type: types.protocol,
  name: "http",
  parameters: {
    api: {
      required: true,
    },
    waitFor: {},
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
      content,
      equals,
    },
  },
  init: (parameters, defaults, { verbose }) => {
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

    if (parameters.waitFor) {
      const paths = [];
      const timeout = parameters.waitFor.timeout || 10;
      const waitUntil = Date.now() + timeout * 1000;

      if (typeof parameters.waitFor === "string") {
        paths.push(parameters.waitFor);
      } else if (parameters.waitFor.path) {
        if (Array.isArray(parameters.waitFor.path)) {
          paths.push(...parameters.waitFor.path);
        } else {
          paths.push(parameters.waitFor.path);
        }
      }
      if (paths.length > 0) {
        const success = {};

        const checkFn = async () => {
          if (Date.now() > waitUntil) {
            return Promise.resolve(false);
          }
          return Promise.all(
            paths.map(
              (path) =>
                success[path] ||
                api
                  .head(path)
                  .accept("*/*")
                  .expect(200)
                  .then(() => {
                    success[path] = true;
                    if (verbose) {
                      console.log(".. got 200", `(${path})`);
                    }
                  })
                  .catch((e) => {
                    if (verbose) {
                      console.log("..", e.message, `(${path})`);
                    }
                    throw e;
                  })
            )
          );
        };

        api.hooks = {
          waitFor: async () => {
            const maxChecks = Math.round(Math.log(timeout / 250) / Math.log(2));
            const urls = paths.map((path) => api.head(path).url);
            console.log("Waiting for successful HEAD requests to");
            urls.forEach((url) => console.log(" -", url));

            const result = await busywait(checkFn, {
              sleepTime: 250,
              multiplier: 2,
              jitter: "full",
              failMsg: "Timeout exceeded",
            });

            if (result.result === false) {
              throw new Error(`Timeout of ${timeout}s exceeded`);
            }
            console.log("=> success");
          },
        };
      }
    }

    return api;
  },
};
