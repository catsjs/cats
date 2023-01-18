//const Mocha = require("mocha");
const Test = require("mocha/lib/test");
const Common = require("mocha/lib/interfaces/common");
var EVENT_FILE_PRE_REQUIRE =
  require("mocha/lib/suite").constants.EVENT_FILE_PRE_REQUIRE;

const createSuite = (options, file, fn, create) => {
  const title = typeof options === "object" ? options.title : options;
  const opts = typeof options === "object" ? options : {};

  const suite = create({ title, file, fn: wrap(fn, opts, true) });
  suite.options = opts;

  return suite;
};

const createTest = (options, fn) => {
  const title = typeof options === "object" ? options.title : options;
  const opts = typeof options === "object" ? options : {};

  const test = new Test(title, wrap(fn, opts));
  test.body = (fn || "").toString();
  test.options = opts;

  return test;
};

const isChain = (obj) => !!obj && !!obj.ctx && !!obj.end;

const hasSlow = (options) =>
  !!options &&
  (typeof options.slow === "number" || typeof options.slow === "string");

const hasContext = (options) => hasSlow(options);

const wrap = (fn, options, isSuite) => {
  if (!fn && !hasContext(options)) {
    return fn;
  }

  //TODO: timeout, retries, bail && isSuite
  return function (done) {
    if (hasSlow(options)) {
      this.slow(options.slow);
    }

    const result = fn.call(this, done);

    if (isChain(result)) {
      result.ctx(this).end(done);
      return undefined;
    }

    return result;
  };
};

module.exports = function bddOptions(suite) {
  var suites = [suite];

  suite.on(EVENT_FILE_PRE_REQUIRE, function (context, file, mocha) {
    var common = Common(suites, context, mocha);

    context.before = common.before;
    context.after = common.after;
    context.beforeEach = common.beforeEach;
    context.afterEach = common.afterEach;
    context.run = mocha.options.delay && common.runWithSuite(suite);
    /**
     * Describe a "suite" with the given `title`
     * and callback `fn` containing nested suites
     * and/or tests.
     */

    context.describe = context.context = function (title, fn) {
      return createSuite(title, file, fn, common.suite.create);
    };

    /**
     * Pending describe.
     */

    context.xdescribe =
      context.xcontext =
      context.describe.skip =
        function (title, fn) {
          return createSuite(title, file, fn, common.suite.skip);
        };

    /**
     * Exclusive suite.
     */

    context.describe.only = function (title, fn) {
      return createSuite(title, file, fn, common.suite.only);
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.it = context.specify = function (title, fn) {
      var suite = suites[0];
      if (suite.isPending()) {
        fn = null;
      }
      var test = createTest(title, fn);
      test.file = file;
      suite.addTest(test);
      return test;
    };

    /**
     * Exclusive test-case.
     */

    context.it.only = function (options, fn) {
      return common.test.only(mocha, context.it(options, fn));
    };

    /**
     * Pending test case.
     */

    context.xit =
      context.xspecify =
      context.it.skip =
        function (options) {
          return context.it(options);
        };

    /**
     * Number of attempts to retry.
     */
    context.it.retries = function (n) {
      context.retries(n);
    };
  });
};

module.exports.description =
  "BDD or RSpec style with options and arrow functions";
