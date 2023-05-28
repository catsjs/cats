const Mochawesome = require("mochawesome");
const { log } = require("mochawesome/src/utils");
const Base = require("mocha/lib/reporters/base");

const marge = require("./marge.cjs");
const packageJson = require("./package.json");
const { loadOptsSync } = require("./config.cjs");

function copyOptions(source, target) {
  if (!target) {
    return;
  }

  target.options = source.options || {};

  if (target.tests) {
    for (let i = 0; i < target.tests.length; i++) {
      target.tests[i].options = source.tests[i].options || {};
    }
  }

  if (target.suites) {
    for (let i = 0; i < target.suites.length; i++) {
      copyOptions(source.suites[i], target.suites[i]);
    }
  }

  if (target.beforeHooks) {
    for (let i = 0; i < target.beforeHooks.length; i++) {
      target.beforeHooks[i].options = source._beforeAll[i].options || {};
    }
  }

  if (target.afterHooks) {
    for (let i = 0; i < target.afterHooks.length; i++) {
      target.afterHooks[i].options = source._afterAll[i].options || {};
    }
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

const { name, report = {} } = loadOptsSync(process.cwd());
const reportOpts = {
  reportDir: report.dir || "report",
  reportFilename:
    report.name === "full"
      ? `[datetime]_[status]_${name}`
      : report.name === "project"
      ? `${name}`
      : report.name === "index"
      ? "index"
      : report.dir
      ? `${name}`
      : "index",
  saveJson: report.json === true,
  saveHtml: report.html !== false,
};

/**
 * Wrapper for the mochawesome reporter:
 * - hardcode the reporter options
 * - optional options object for suites and tests
 * - use custom html assets, i.e. @catsjs/report
 */
function CatsReporter(runner, options) {
  options.reporterOptions = {
    ...reportOpts,
    inline: true,
    code: true,
    charts: true,
    htmlModule: "@catsjs/report",
    //htmlModule: "mochawesome-report-generator",
    showSkipped: true,
    showPending: true,
    showHooks: "always",
  };

  Mochawesome.call(this, runner, options);

  //TODO: not passed through, needed for console diff, does mochawesome have a limit as well?
  Base.maxDiffSize = 16384;

  this.done = (failures, exit) => {
    try {
      for (let i = 0; i < this.runner.suite.suites.length; i++) {
        copyOptions(
          this.runner.suite.suites[i],
          this.output.results[0].suites[i]
        );
      }
      for (let i = 0; i < this.runner.suite._beforeAll.length; i++) {
        copyOptions(
          this.runner.suite._beforeAll[i],
          this.output.results[0].beforeHooks[i]
        );
      }
      for (let i = 0; i < this.runner.suite._afterAll.length; i++) {
        copyOptions(
          this.runner.suite._afterAll[i],
          this.output.results[0].afterHooks[i]
        );
      }

      this.output.project = this.runner.suite.project;

      this.output.meta.cats = {
        name: "cats",
        version: packageJson.version,
        link: packageJson.repository,
        options: {},
      };
    } catch (e) {
      console.error("Error preparing report:", e);
    }

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
