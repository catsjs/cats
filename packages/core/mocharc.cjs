const defaults = {
  ui: "@catsjs/core/interface",
  reporter: "@catsjs/core/reporter",
  spec: "spec",
  recursive: true,
  inlineDiff: true,
};

//TODO: split into mutable and immutable defaults
//TODO: get user options from .apispecrc (cannot require esm in cjs)

const rc = (custom, finalize = true) => {
  const merged = custom ? Object.assign({}, defaults, custom) : defaults;

  const mergedReporterOptions =
    custom && custom.reporterOptions
      ? Object.assign({}, defaults.reporterOptions, custom.reporterOptions)
      : defaults.reporterOptions;

  const finalReporterOptions = finalize
    ? Object.keys(mergedReporterOptions).map(
        (key) => `${key}=${mergedReporterOptions[key]}`
      )
    : mergedReporterOptions;

  return {
    ...merged,
    reporterOptions: finalReporterOptions,
  };
};

module.exports = rc;
