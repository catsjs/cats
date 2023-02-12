import agent, { methods, apply } from "./agent.js";
import request from "./request.js";

//TODO: apply defaults to new agent
export const compare = ({ api2, ...options }, api1) => {
  const compareAgent = comparator(api1, api2);

  return request(options, compareAgent);
};

export const compareTo = (api, api2, parameters) => {
  const asserts = parameters.callback ? [parameters.callback] : [];
  const compareAgent = comparator(api, api2, asserts);

  return request(parameters, compareAgent);
};

//TODO: validate input parameters
//TODO: allow switched parameters
export const comparator = (api1, api2, asserts = []) => {
  console.log("ASSERTS " + asserts.length);
  /*if (!url || typeof url !== "string" || !url.startsWith("http")) {
    //TODO: validate with new URL ?
    throw new Error("diff - invalid url provided as second parameter: " + url);
  }*/

  let current1 = api1;
  let current2 = api2;
  let currentProxy1;

  const end = (arg) => {
    const done = typeof arg === "function" ? arg : () => {};

    current1.compareIndex = 1;
    current2.compareIndex = 2;

    return Promise.allSettled([
      Promise.resolve(current1),
      Promise.resolve(current2),
    ]).then((results) => {
      console.log("DONE", results.length);

      for (let j = 0; j < results.length; j++) {
        if (results[j].status === "rejected") {
          done(results[j].reason);
          return;
        }
      }

      try {
        for (let j = 0; j < asserts.length; j++) {
          console.log("ASS" + j);
          asserts[j](results[0].value, results[1].value);
        }
      } catch (e) {
        done(e);
        return;
      }

      done();
    });
  };

  const methodHandler = (name, method2) => ({
    apply: (method, thisArg, argumentsList) => {
      if (name === "end") {
        end(argumentsList[0]);
        return;
      }
      if (name === "addComparison") {
        console.log(name);
        return;
      }

      const result = Reflect.apply(method, current1, argumentsList);
      const result2 = Reflect.apply(method2, current2, argumentsList);

      if (methods.includes(name)) {
        currentProxy1 = new Proxy(result, classHandler);
        current1 = result;
        current2 = result2;
      }

      if (typeof result === "object") {
        return currentProxy1;
      }

      return result;
    },
  });

  const classHandler = {
    get: (target, method, argumentsList) => {
      if (method === "addComparison") {
        return (assert) => {
          asserts.push(wrapAssertFn(assert));
        };
      }

      const result = Reflect.get(target, method, argumentsList);

      if (typeof result === "function") {
        return new Proxy(result, methodHandler(method, current2[method]));
      }

      return result;
    },
  };

  currentProxy1 = new Proxy(api1, classHandler);

  return currentProxy1;
};

/**
 * Wraps an assert function into another.
 * The wrapper function edit the stack trace of any assertion error, prepending a more useful stack to it.
 *
 * @param {Function} assertFn
 * @returns {Function} wrapped assert function
 */

function wrapAssertFn(assertFn) {
  const savedStack = new Error().stack.split("\n").slice(3);

  return function (res1, res2) {
    let badStack;
    let err;
    try {
      err = assertFn(res1, res2);
    } catch (e) {
      err = e;
    }
    if (err instanceof Error) {
      if (err.stack) {
        badStack = err.stack.replace(err.message, "").split("\n").slice(1);
        err.stack = [err.toString()]
          .concat(savedStack)
          .concat("----")
          .concat(badStack)
          .join("\n");
      }
      throw err;
    }
    return err;
  };
}
