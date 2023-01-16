#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import fs from "fs-extra";

import { createSpec } from "./create-spec.js";
//import packageJson from "./package.json" assert { type: "json" };

const packageJson = fs.readJSONSync(new URL("./package.json", import.meta.url));
let projectName;

const program = new Command()
  .name(packageJson.name)
  .usage(`${chalk.green("<project-directory>")} [options]`)
  .arguments("<project-directory>")
  .action((name) => {
    projectName = name;
  })
  .option("-j, --json", "add json asserts")
  .option(
    "-w, --workspace",
    "dev only: create yarn workspace to use local cats"
  )
  //  .allowUnknownOption()
  .on("--help", () => {
    console.log();
    console.log(`    Only ${chalk.green("<project-directory>")} is required.`);
    console.log();
  })
  .version(packageJson.version, "-v, --version", "output the current version")
  .parse(process.argv);

//if (!process.argv.slice(2).length) {
//  program.outputHelp();
//}

if (typeof projectName === "undefined") {
  program.outputHelp();
  process.exit(0);
}

createSpec(
  projectName,
  packageJson.version,
  program.verbose,
  program.json,
  program.workspace
);
