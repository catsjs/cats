const fs = require("fs-extra");
const path = require("path");
const escapeHtml = require("escape-html");
//const renderMainHTML = require("mochawesome-report-generator/lib/main-html");
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

/**
 * Escape entities for use in HTML
 *
 * @param {string} str Input string
 *
 * @return {string}
 */

function e(str) {
  return escapeHtml(str).replace(/&#39/g, "&#x27");
}
/**
 * Render the main report HTML to a string
 *
 * @param {object} props Report properties
 * @param {string} data Raw report data
 * @param {string} inlineScripts App JS
 * @param {string} inlineStyles App CSS
 * @param {object} options App options
 * @param {string} scriptsUrl URL for app JS
 * @param {string} stylesUrl URL for app CSS
 * @param {string} title Report page title
 * @param {boolean} useInlineAssets Whether to render JS/CSS inline
 *
 * @return {string}
 */

function renderMainHTML(props) {
  var data = props.data,
    inlineScripts = props.inlineScripts,
    inlineStyles = props.inlineStyles,
    options = props.options,
    scriptsUrl = props.scriptsUrl,
    stylesUrl = props.stylesUrl,
    title = props.title,
    useInlineAssets = props.useInlineAssets;

  //TODO: not supported by Safari, but embedded png does not work either
  var iconSvg =
    '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjwhLS0gQ3JlYXRlZCB3aXRoIFZlY3Rvcm5hdG9yIChodHRwOi8vdmVjdG9ybmF0b3IuaW8vKSAtLT4KPHN2ZyBoZWlnaHQ9IjEwMCUiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3R5bGU9ImZpbGwtcnVsZTpub256ZXJvO2NsaXAtcnVsZTpldmVub2RkO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDsiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDMwIDMwIiB3aWR0aD0iMTAwJSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CjxkZWZzLz4KPGNsaXBQYXRoIGlkPSJBcnRib2FyZEZyYW1lIj4KPHJlY3QgaGVpZ2h0PSIzMCIgd2lkdGg9IjMwIiB4PSIwIiB5PSIwIi8+CjwvY2xpcFBhdGg+CjxnIGNsaXAtcGF0aD0idXJsKCNBcnRib2FyZEZyYW1lKSIgaWQ9IkViZW5lLTEiPgo8cGF0aCBkPSJNNi0xLjMzMjI3ZS0xNUwyNC0xLjMzMjI3ZS0xNUMyNy4zMTM3LTEuMzMyMjdlLTE1IDMwIDIuNjg2MjkgMzAgNkwzMCAyNEMzMCAyNy4zMTM3IDI3LjMxMzcgMzAgMjQgMzBMNiAzMEMyLjY4NjI5IDMwIDguODgxNzhlLTE2IDI3LjMxMzcgOC44ODE3OGUtMTYgMjRMOC44ODE3OGUtMTYgNkM4Ljg4MTc4ZS0xNiAyLjY4NjI5IDIuNjg2MjktMS4zMzIyN2UtMTUgNi0xLjMzMjI3ZS0xNVoiIGZpbGw9IiM0ZDQ4NjEiIGZpbGwtcnVsZT0ibm9uemVybyIgb3BhY2l0eT0iMSIgc3Ryb2tlPSJub25lIi8+CjwvZz4KPGcgaWQ9IlVudGl0bGVkIj4KPHBhdGggZD0iTTE1IDIxQzEzLjk0MiAyMSAxMi44ODUgMjAuNzQ2IDExLjgzNSAyMC4yMzhDMTEuODM1IDIwLjIzOCAxMS44MzUgMjAuMjM4IDExLjgzNCAyMC4yMzhDMTEuMzI3IDE5Ljk5MiAxMSAxOS40NjcgMTEgMTguOUMxMSAxNi43NSAxMi43OTQgMTUgMTUgMTVDMTcuMjA2IDE1IDE5IDE2Ljc1IDE5IDE4LjlDMTkgMTkuNDY2IDE4LjY3MyAxOS45OTIgMTguMTY3IDIwLjIzOEMxNy4xMTYgMjAuNzQ2IDE2LjA1OCAyMSAxNSAyMVoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtcnVsZT0ibm9uemVybyIgb3BhY2l0eT0iMSIgc3Ryb2tlPSJub25lIi8+CjxwYXRoIGQ9Ik0xMS40NjYgMTIuMDM0QzExLjIxNSAxMC44MjEgMTEuNDkzIDkuNDA4IDEyLjUwOCA5LjA1NkMxMi44NjQgOC45MzMgMTMuMjUzIDguOTc0IDEzLjYwMiA5LjE3MkMxNC4xNiA5LjQ4OSAxNC42MDIgMTAuMjA1IDE0Ljc4NCAxMS4wODlDMTUuMDM1IDEyLjMwMSAxNC43NTggMTMuNzE0IDEzLjc0MyAxNC4wNjZDMTIuOTYyIDE0LjMzNyAxMS44MzUgMTMuODExIDExLjQ2NiAxMi4wMzRaIiBmaWxsPSIjZmZmZmZmIiBmaWxsLXJ1bGU9Im5vbnplcm8iIG9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIvPgo8cGF0aCBkPSJNMTYuMzM2IDE0LjA2NUMxNS4zMjEgMTMuNzEyIDE1LjA0NCAxMi4zIDE1LjI5NSAxMS4wODhDMTUuNDc4IDEwLjIwNSAxNS45MiA5LjQ4OCAxNi40NzcgOS4xNzFDMTYuODI3IDguOTczIDE3LjIxNSA4LjkzMiAxNy41NzEgOS4wNTVDMTguNTg2IDkuNDA3IDE4Ljg2MyAxMC44MiAxOC42MTMgMTIuMDMzQzE4LjI0NCAxMy44MTIgMTcuMTE4IDE0LjMzNyAxNi4zMzYgMTQuMDY1WiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1ydWxlPSJub256ZXJvIiBvcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiLz4KPHBhdGggZD0iTTguMTI2IDE0LjgxMUM3LjU1NiAxMy44NyA3LjYwOSAxMi42MjMgOC41MTggMTIuMTIzQzkuMzM2IDExLjY3MyAxMC40NTYgMTIuMTEyIDExLjA2NyAxMy4xMjFDMTEuNzUyIDE0LjI1MiAxMS40MzkgMTUuMzg5IDEwLjY3NiAxNS44MDhDOS43OTMgMTYuMjk1IDguNjc5IDE1LjcyMyA4LjEyNiAxNC44MTFaIiBmaWxsPSIjZmZmZmZmIiBmaWxsLXJ1bGU9Im5vbnplcm8iIG9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIvPgo8cGF0aCBkPSJNMTkuMzI0IDE1LjgwOEMxOC40MjIgMTUuMzEyIDE4LjM1OSAxNC4wNjkgMTguOTMzIDEzLjEyQzE5LjU0NSAxMi4xMTEgMjAuNjYzIDExLjY3MSAyMS40ODMgMTIuMTIzQzIyLjM4NSAxMi42MTkgMjIuNDQ4IDEzLjg2MiAyMS44NzQgMTQuODFDMjEuMzE2IDE1LjczMiAyMC4yMDMgMTYuMjkxIDE5LjMyNCAxNS44MDhaIiBmaWxsPSIjZmZmZmZmIiBmaWxsLXJ1bGU9Im5vbnplcm8iIG9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIvPgo8cGF0aCBkPSJNMjMuNzIgNS4yMkwyMi45MjQgNi4wMTZDMjAuNzYxIDQuMDg5IDE3Ljk3NCAzIDE1IDNDOC4zODMgMyAzIDguMzgzIDMgMTVDMyAxNi4xNzMgMy4xNzMgMTcuMzM5IDMuNTEzIDE4LjQ2NkMzLjYxIDE4Ljc5MSAzLjkwOCAxOSA0LjIzIDE5QzQuMzAxIDE5IDQuMzc1IDE4Ljk5IDQuNDQ3IDE4Ljk2OEM0Ljg0MyAxOC44NDggNS4wNjggMTguNDMgNC45NDggMTguMDMzQzQuNjUxIDE3LjA0NiA0LjUgMTYuMDI2IDQuNSAxNUM0LjUgOS4yMSA5LjIxIDQuNSAxNSA0LjVDMTcuNTcxIDQuNSAxOS45ODIgNS40MyAyMS44NjMgNy4wNzZMMjEuMjIgNy43MkMyMC43NDggOC4xOSAyMS4wODEgOSAyMS43NSA5TDI0LjI1IDlDMjQuNjY0IDkgMjUgOC42NjQgMjUgOC4yNUwyNSA1Ljc1QzI1IDUuMDg3IDI0LjE5NSA0Ljc0NiAyMy43MiA1LjIyWiIgZmlsbD0iIzQwYzlhMiIgZmlsbC1ydWxlPSJub256ZXJvIiBvcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiLz4KPHBhdGggZD0iTTI2LjQ4NyAxMS41MzRDMjYuMzY3IDExLjEzOCAyNS45NTIgMTAuOTExIDI1LjU1MiAxMS4wMzJDMjUuMTU2IDExLjE1MiAyNC45MzEgMTEuNTcgMjUuMDUxIDExLjk2N0MyNS4zNDkgMTIuOTU0IDI1LjUgMTMuOTc0IDI1LjUgMTVDMjUuNSAyMC43OSAyMC43OSAyNS41IDE1IDI1LjVDMTIuNDI5IDI1LjUgMTAuMDE4IDI0LjU3IDguMTM3IDIyLjkyNEw4Ljc4IDIyLjI4QzkuMjUyIDIxLjgxIDguOTE5IDIxIDguMjUgMjFMNS43NSAyMUM1LjMzNiAyMSA1IDIxLjMzNiA1IDIxLjc1TDUgMjQuMjVDNSAyNC45MTkgNS44MTEgMjUuMjQ5IDYuMjggMjQuNzhMNy4wNzYgMjMuOTg0QzkuMjM5IDI1LjkxMSAxMi4wMjYgMjcgMTUgMjdDMjEuNjE3IDI3IDI3IDIxLjYxNyAyNyAxNUMyNyAxMy44MjcgMjYuODI3IDEyLjY2MSAyNi40ODcgMTEuNTM0WiIgZmlsbD0iIzQwYzlhMiIgZmlsbC1ydWxlPSJub256ZXJvIiBvcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiLz4KPC9nPgo8L3N2Zz4K" />';
  var styles = useInlineAssets
    ? "<style>".concat(inlineStyles, "</style>")
    : '<link rel="stylesheet" href="'.concat(stylesUrl, '"/>');
  var scripts = useInlineAssets
    ? '<script type="text/javascript">'.concat(inlineScripts, "</script>")
    : '<script src="'.concat(scriptsUrl, '"></script>');
  var meta =
    '<meta charSet="utf-8"/><meta http-equiv="X-UA-Compatible" content="IE=edge"/><meta name="viewport" content="width=device-width, initial-scale=1"/>';
  var head = "<head>"
    .concat(meta, "<title>")
    .concat(e(title), "</title>", iconSvg)
    .concat(styles, "</head>");
  var body = '<body data-raw="'
    .concat(e(data), '" data-config="')
    .concat(e(JSON.stringify(options)), '"><div id="report"></div>')
    .concat(scripts, "</body>");
  return '<html lang="en">'.concat(head).concat(body, "</html>");
}

module.exports = create;
