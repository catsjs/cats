import { resolve, extname } from "path";
import fsExtra from "fs-extra";
import { findUpSync } from "find-up";
import yaml from "js-yaml";
import mocha from "mocha/lib/cli/index.js";

const { readJSON } = fsExtra;

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

export const loadOpts = async (rootDir) => {
  //const rootDir = process.cwd();
  const pkgPath = resolve(rootDir, "package.json");
  const rcPath = findUpSync(CONFIG_FILES, { cwd: rootDir });
  //const rcPath = resolve(rootDir, ".catsrc.js");

  const pkg = await readJSON(pkgPath);
  //const { default: rc } = await import(rcPath);
  const rc = await loadRc(rcPath);

  if (rc.verbose) {
    console.log("RC", rcPath);
    console.log(rc);
  }

  const mocharc = mocha.loadRc();

  if (rc.verbose) {
    console.log("MOCHARC", mocharc);
  }

  const opts = {
    title: pkg.name,
    description: pkg.description,
    ...rc,
    name: pkg.name,
    version: pkg.version,
    rootDir,
    mocha: mocharc,
  };

  if (rc.verbose) {
    console.log("OPTS", opts);
  }

  return opts;
};
