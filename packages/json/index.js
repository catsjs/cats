import chai from "chai";
import matchPattern from "lodash-match-pattern";
import { types } from "@catsjs/core";
import patternAssertions from "./pattern.js";
import schemaAssertions from "./schema.js";
import extractLinks from "./extract.js";
import util from "util";

const plugin = {
  type: types.content,
  name: "json",
  parameters: {},
  mediaTypes: ["application/json"],
  mediaTypePattern: undefined,
};

const init = (opts) => {
  chai.use(function (_chai, utils) {
    const Assertion = _chai.Assertion;

    const origAssert = Assertion.prototype.assert;

    Assertion.prototype.assert = function () {
      try {
        origAssert.apply(this, arguments);
      } catch (e) {
        const error = cleanupError(e);
        throw error;
      }
    };

    const methods = {
      ...patternAssertions(opts, utils),
      ...schemaAssertions(opts, utils),
    };

    Object.keys(methods).forEach((method) =>
      Assertion.addMethod(method, methods[method])
    );
  });

  return {
    ...plugin,
    ...matchPattern.getLodashModule(), // is* functions
    of: (content) => chai.expect(content),
    extractLinks,
  };
};

// TODO: replace functions in expected recursively
const cleanupError = (error) => {
  delete error.stack;
  //console.log("ERROR MSG", error.message);
  error.message = error.message.replace(
    /'function (is[A-Za-z]+)\((?:value)?\) \{\.\.\.\}'/,
    "$1"
  );

  return error;
};

export default {
  ...plugin,
  init: init,
};
