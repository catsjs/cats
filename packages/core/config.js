import { resolve, extname } from "path";
import fsExtra from "fs-extra";
import { findUpSync } from "find-up";
import yaml from "js-yaml";
import mocha from "mocha/lib/cli/index.js";
import { merge } from "merge-anything";

const { readJSON } = fsExtra;

//TODO: use https://github.com/cosmiconfig/cosmiconfig ???
const CONFIG_FILES = [
  //'.catsrc.cjs',
  ".catsrc.js",
  ".catsrc.yaml",
  ".catsrc.yml",
  ".catsrc.json",
];

const parsers = {
  yaml: (rcPath) =>
    fsExtra.readFile(rcPath, "utf8").then((doc) => yaml.load(doc)),
  js: (rcPath) => {
    const { default: rc } = import(rcPath);
    return rc;
  },
  json: (rcPath) => fsExtra.readJSON(rcPath),
};

const loadRc = async (rcPath) => {
  let config = {};

  const ext = extname(rcPath);
  try {
    if (ext === ".yml" || ext === ".yaml") {
      config = await parsers.yaml(rcPath);
    } else if (ext === ".js" || ext === ".cjs") {
      config = await parsers.js(rcPath);
    } else {
      config = await parsers.json(rcPath);
    }
  } catch (err) {
    throw createUnparsableFileError(
      `Unable to read/parse ${rcPath}: ${err}`,
      rcPath
    );
  }
  return config;
};

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

export const loadOpts = async (rootDir) => {
  //const rootDir = process.cwd();
  const pkgPath = resolve(rootDir, "package.json");
  const rcPath = findUpSync(CONFIG_FILES, { cwd: rootDir });
  //const rcPath = resolve(rootDir, ".catsrc.js");

  const pkg = await readJSON(pkgPath);
  //const { default: rc } = await import(rcPath);
  const rc = await loadRc(rcPath);

  const env = loadEnv();

  const verbose = env.verbose === true || rc.verbose;

  if (verbose) {
    console.log("RC", rcPath);
    console.log(rc);
    console.log("ENV", env);
  }

  const mocharc = mocha.loadRc();

  if (verbose) {
    console.log("MOCHARC", mocharc);
  }

  const pkg1 = { title: pkg.name, description: pkg.description };
  const pkg2 = { name: pkg.name, version: pkg.version };
  const other = { rootDir, mocha: mocharc };

  const opts = merge(pkg1, rc, env, pkg2, other);

  if (verbose) {
    console.log("OPTS", opts);
  }

  return opts;
};
