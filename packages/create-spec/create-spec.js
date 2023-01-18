import { EOL } from "os";
import { resolve, basename, join } from "path";
import fs from "fs-extra";
import chalk from "chalk";
import validateProjectName from "validate-npm-package-name";

export function createSpec(
  name,
  version,
  verbose,
  addJsonAsserts,
  useLocalApispec
) {
  const root = resolve(name);
  const appName = basename(root);

  checkAppName(appName);
  fs.ensureDirSync(name);
  fs.ensureDirSync(resolve(name, "spec"));
  //  if (!isSafeToCreateProjectIn(root, name)) {
  //    process.exit(1);
  //  }

  console.log(
    `Creating a new ${chalk.cyan("cats")} project at ${chalk.green(root)}.`
  );
  console.log();

  fs.copyFileSync(
    new URL("./example.js", import.meta.url),
    resolve(name, "spec", "example.js")
  );

  const packageJson = {
    name: appName,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      test: "mocha",
    },
    dependencies: {
      "@catsjs/core": "^" + version,
      mocha: "^10.2.0",
    },
  };

  if (useLocalApispec) {
    packageJson.workspaces = ["../cats/*"];
  }

  fs.writeFileSync(
    join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + EOL
  );

  const mochaOpts = {
    ui: "@catsjs/core/interface",
    reporter: "@catsjs/core/reporter",
    require: "@catsjs/core/hooks",
    spec: "spec",
    recursive: true,
    timeout: "60s",
    slow: "500ms",
  };
  fs.writeFileSync(
    join(root, ".mocharc.json"),
    JSON.stringify(mochaOpts, null, 2) + EOL
  );

  const catsrc = {
    plugins: ["@catsjs/http", "@catsjs/json"],
    protocol: "http",
    contentTypes: ["json"],
    endpoint: "https://swapi.dev/api",
    verbose: false,
  };
  fs.writeFileSync(
    join(root, ".catsrc.json"),
    JSON.stringify(catsrc, null, 2) + EOL
  );
}

function checkAppName(appName) {
  const validationResult = validateProjectName(appName);
  if (!validationResult.validForNewPackages) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${appName}"`
      )} because of npm naming restrictions:`
    );
    printValidationResults(validationResult.errors);
    printValidationResults(validationResult.warnings);
    process.exit(1);
  }

  // TODO: there should be a single place that holds the dependencies
  const dependencies = ["react", "react-dom", "react-scripts"].sort();
  if (dependencies.indexOf(appName) >= 0) {
    console.error(
      chalk.red(
        `We cannot create a project called ${chalk.green(
          appName
        )} because a dependency with the same name exists.\n` +
          `Due to the way npm works, the following names are not allowed:\n\n`
      ) +
        chalk.cyan(dependencies.map((depName) => `  ${depName}`).join("\n")) +
        chalk.red("\n\nPlease choose a different project name.")
    );
    process.exit(1);
  }
}

function printValidationResults(results) {
  if (typeof results !== "undefined") {
    results.forEach((error) => {
      console.error(chalk.red(`  *  ${error}`));
    });
  }
}
