const fs = require("fs-extra");
const path = require("path");
const renderMainHTML = require("mochawesome-report-generator/lib/main-html");
const {
  getMergedOptions,
} = require("mochawesome-report-generator/lib/options");

/**
 * This is a reduced version of marge, see https://github.com/adamgruber/mochawesome-report-generator/blob/master/src/lib/main.js.
 * - only inline assets
 * - custom report assets
 * - fixed timestamp format
 * - always overwrite
 */

const htmlJsonExtRegex = /\.(?:html|json)$/;

function getFilename({ reportDir, reportFilename, timestamp }, reportData) {
  const DEFAULT_FILENAME = "index";
  const NAME_REPLACE = "[name]";
  const STATUS_REPLACE = "[status]";
  const DATETIME_REPLACE = "[datetime]";
  const STATUSES = {
    Pass: "pass",
    Fail: "fail",
  };

  let filename = reportFilename || DEFAULT_FILENAME;

  const hasDatetimeReplacement = filename.includes(DATETIME_REPLACE);

  const now = new Date();
  //const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  //const dateLocal = new Date(now.getTime() - offsetMs);
  const ts = now
    .toISOString()
    .slice(0, 19)
    .replace(/-/g, "/")
    .replace("T", " ");

  if (timestamp !== false && timestamp !== "false") {
    if (!hasDatetimeReplacement) {
      filename = `${filename}_${DATETIME_REPLACE}`;
    }
  }

  const specFilename = path
    .basename(reportData.results[0].file || "")
    .replace(/\..+/, "");

  const status = reportData.stats.failures > 0 ? STATUSES.Fail : STATUSES.Pass;

  filename = filename
    .replace(NAME_REPLACE, specFilename || DEFAULT_FILENAME)
    .replace(STATUS_REPLACE, status)
    .replace(DATETIME_REPLACE, ts)
    .replace(htmlJsonExtRegex, "");

  return path.resolve(process.cwd(), reportDir, filename);
}

function getOptions(opts, reportData) {
  const mergedOptions = {
    ...opts,
    ...getMergedOptions(opts || {}),
  };
  const filename = getFilename(mergedOptions, reportData);

  // For saving JSON from mochawesome reporter
  if (mergedOptions.saveJson) {
    mergedOptions.jsonFile = `${filename}.json`;
  }

  mergedOptions.htmlFile = `${filename}.html`;
  return mergedOptions;
}

function loadFile(filename) {
  return fs.readFileSync(filename, "utf8");
}

function getAssets(reportOptions) {
  try {
    var distDir = path.join(
      path.dirname(require.resolve(reportOptions.htmlModule + "/package.json")),
      "dist"
    ); // Default URLs to assets path

    return {
      inlineScripts: loadFile(path.join(distDir, "app.js")),
      inlineStyles: loadFile(path.join(distDir, "app.inline.css")),
    };
  } catch (e) {
    console.error("Cannot locate htmlReport assets:", e);
    throw e;
  }
}

// see https://github.com/adamgruber/mochawesome-report-generator/blob/master/src/lib/main.js#L258
function prepare(reportData, opts) {
  // Get the options
  const reportOptions = getOptions(opts, reportData);

  // Stop here if we're not generating an HTML report
  if (!reportOptions.saveHtml) {
    return { reportOptions };
  }

  // Get the assets
  const assets = getAssets(reportOptions);

  // Render basic template to string
  const renderedHtml = renderMainHTML({
    data: JSON.stringify(reportData),
    options: reportOptions,
    title: reportOptions.reportPageTitle,
    useInlineAssets: true,
    ...assets,
  });

  const html = `<!doctype html>\n${renderedHtml}`;
  return { html, reportOptions };
}

function saveFile(filename, data, overwrite) {
  return fs.outputFile(filename, data).then(() => filename);
}

function create(data, opts) {
  const { html, reportOptions } = prepare(data, opts);
  const { saveJson, saveHtml, autoOpen, overwrite, jsonFile, htmlFile } =
    reportOptions;

  const savePromises = [];

  savePromises.push(
    saveHtml !== false
      ? saveFile(htmlFile, html, overwrite).then(
          (savedHtml) => (autoOpen && openFile(savedHtml)) || savedHtml
        )
      : null
  );

  savePromises.push(
    saveJson !== false
      ? saveFile(
          jsonFile,
          // Preserve `undefined` values as `null` when stringifying
          JSON.stringify(data, (k, v) => (v === undefined ? null : v), 2),
          overwrite
        )
      : null
  );

  return Promise.all(savePromises);
}

module.exports = create;
