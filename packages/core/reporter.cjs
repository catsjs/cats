const Mochawesome = require("mochawesome");
const { log } = require("mochawesome/src/utils");

const marge = require("./marge.cjs");
const packageJson = require("./package.json");

function copyOptions(source, target) {
  target.options = source.options || {};

  for (let i = 0; i < target.tests.length; i++) {
    target.tests[i].options = source.tests[i].options || {};
  }

  for (let i = 0; i < target.suites.length; i++) {
    copyOptions(source.suites[i], target.suites[i]);
  }
}

// see https://github.com/adamgruber/mochawesome/blob/master/src/mochawesome.js#L34
function done(output, options, config, failures, exit) {
  return marge(output, options)
    .then(([htmlFile, jsonFile]) => {
      if (!htmlFile && !jsonFile) {
        log("No files were generated", "warn", config);
      } else {
        jsonFile && log(`Report JSON saved to ${jsonFile}`, null, config);
        htmlFile && log(`Report HTML saved to ${htmlFile}`, null, config);
      }
    })
    .catch((err) => {
      log(err, "error", config);
    })
    .then(() => {
      exit && exit(failures > 0 ? 1 : 0);
    });
}

//TODO: option to use either index or [datetime]-[status]
/**
 * Wrapper for the mochawesome reporter:
 * - hardcode the reporter options
 * - optional options object for suites and tests
 * - use custom html assets, i.e. @catsjs/report
 */
function CatsReporter(runner, options) {
  options.reporterOptions = {
    reportDir: "report",
    //reportFilename: "[datetime]-[status]-todo_[name]",
    reportFilename: "index",
    //timestamp: "yyyy-mm-dd'T'HH:MM:ss", // "isoDateTime",
    inline: true,
    code: true,
    charts: true,
    saveJson: true,
    saveHtml: true,
    htmlModule: "@catsjs/report",
  };

  Mochawesome.call(this, runner, options);

  this.done = (failures, exit) => {
    for (let i = 0; i < this.runner.suite.suites.length; i++) {
      copyOptions(
        this.runner.suite.suites[i],
        this.output.results[0].suites[i]
      );
    }

    this.output.meta.cats = {
      version: packageJson.version,
      options: {},
    };

    return done(
      this.output,
      options.reporterOptions,
      this.config,
      failures,
      exit
    );
  };
}

module.exports = CatsReporter;
