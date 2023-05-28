const { cosmiconfig, cosmiconfigSync } = require("cosmiconfig");
const { resolve } = require("path");
const { readJSON, readJSONSync } = require("fs-extra");
const mocha = require("mocha/lib/cli/index.js");
const { merge } = require("merge-anything");

const loadEnv = () => {
  const env = {};

  Object.keys(process.env).forEach((key) => {
    if (key === "CATS_API") {
      env.api = process.env[key];
    } else if (key === "CATS_VERBOSE") {
      env.verbose = process.env[key] === "true";
    } else if (key.startsWith("CATS_VARS_")) {
      if (!env.vars) env.vars = {};
      env.vars[key.replace("CATS_VARS_", "").toLowerCase()] = process.env[key];
    }
  });

  return env;
};

const loadOpts = (rootDir, pkg, rc) => {
  const env = loadEnv();

  const verbose = env.verbose === true || rc.verbose;

  if (verbose) {
    console.log("RC", rc.filepath);
    console.log(rc.config);
    console.log("ENV", env);
  }

  const mocharc = mocha.loadRc();

  if (verbose) {
    console.log("MOCHARC", mocharc);
  }

  const pkg1 = { title: pkg.name, description: pkg.description };
  const pkg2 = { name: pkg.name, version: pkg.version };
  const other = { rootDir, mocha: mocharc };

  const opts = merge(pkg1, rc.config, env, pkg2, other);

  if (verbose) {
    console.log("OPTS", opts);
  }

  return opts;
};

module.exports.loadOpts = async (rootDir) => {
  const pkgPath = resolve(rootDir, "package.json");
  const pkg = await readJSON(pkgPath);
  const rc = await cosmiconfig("cats").search();

  return loadOpts(rootDir, pkg, rc);
};

module.exports.loadOptsSync = (rootDir) => {
  const pkgPath = resolve(rootDir, "package.json");
  const pkg = readJSONSync(pkgPath);
  const rc = cosmiconfigSync("cats").search();

  return loadOpts(rootDir, pkg, rc);
};
