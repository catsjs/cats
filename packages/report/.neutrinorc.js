const airbnb = require("@neutrinojs/airbnb");
const react = require("@neutrinojs/react");
//const mocha = require('@neutrinojs/mocha');
const fs = require("fs");
const path = require("path");
const merge = require("deepmerge");
const htmlEntities = require("html-entities");

const reportFile = process.env.APISPEC_PROJECT
  ? path.resolve(
      process.cwd(),
      process.env.APISPEC_PROJECT,
      "report/index.json"
    )
  : path.resolve(__dirname, "dev/data.json");

if (process.env.NODE_ENV !== "production") {
  console.log("Using report file", reportFile);
}

module.exports = {
  options: {
    root: __dirname,
    output: "dist",
    mains: {
      app: {
        entry: "app",
      },
    },
  },
  use: [
    /*airbnb({
            eslint: {
                baseConfig: {
                    rules: {
                        'react/jsx-props-no-spreading': 'off',
                        'arrow-body-style': 'off',
                        'no-underscore-dangle': 'off',
                        'import/prefer-default-export': 'off',
                        'import/no-extraneous-dependencies': [
                            'error',
                            { devDependencies: true },
                        ],
                        'react/jsx-filename-extension': 'warn',
                        'no-plusplus': [
                            'error',
                            { allowForLoopAfterthoughts: true },
                        ],
                    },
                    extends: [
                        require.resolve('eslint-config-prettier'),
                        require.resolve('eslint-config-prettier/babel'),
                        require.resolve('eslint-config-prettier/react'),
                    ],
                },
            },
        }),*/

    react({
      html:
        process.env.NODE_ENV !== "production"
          ? {
              filename: "index.html",
              template: require.resolve("./dev/index.ejs"),
              data: htmlEntities.encode(fs.readFileSync(reportFile, "utf8")),
              config: htmlEntities.encode(
                fs.readFileSync(path.join(__dirname, "dev/config.json"), "utf8")
              ),
            }
          : false,
      style: {
        extract: {
          plugin: {
            filename: "[name].css",
          },
        },
      },
      babel: {
        plugins: [
          [
            require.resolve("@babel/plugin-proposal-decorators"),
            { legacy: true },
          ],
        ],
      },
      font: {
        name: "[name].[ext]",
      },
    }),

    //mocha(),

    (neutrino) => {
      neutrino.config.optimization.splitChunks(false).runtimeChunk(false);

      neutrino.config.performance
        .maxEntrypointSize(512000)
        .maxAssetSize(512000);

      neutrino.config.output.filename("[name].js");

      // TODO: remove unused
      neutrino.config.module
        .rule("font")
        .test(/\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/)
        .use("file")
        .loader(require.resolve("url-loader"))
        .options({ limit: 100000 });

      if (process.env.NODE_ENV !== "production") {
        neutrino.config
          .plugin("refresh")
          .use(require.resolve("@pmmmwh/react-refresh-webpack-plugin"));

        neutrino.config.module
          .rule("compile")
          .use("babel")
          .tap((options) =>
            merge(options, {
              plugins: [require.resolve("react-refresh/babel")],
            })
          );

        neutrino.config.resolve.alias.set("react-dom", "@hot-loader/react-dom");
      }
    },
  ],
};
