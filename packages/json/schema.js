import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import superagent from 'superagent';
import util from 'util';
import path from 'path';

const isUrl = (path) => path.substr(0, 4) === 'http';

const remoteSchemaLoader = (baseUri, cache) => {
    const schemaCache = cache ? cache.create('schemas') : null;

    const load = (url) =>
        superagent
            .get(url)
            .buffer()
            .then((res) => {
                console.log('LOADED', url, res.statusCode, res);
                if (res.statusCode >= 400)
                    throw new Error('Loading error: ' + res.statusCode);

                return res.text || (res.body && res.body.toString());
            });

    return (file) => {
        const url = isUrl(file) ? file : new URL(file, baseUri).toString();
        const cachePath = url.replace('http://', '').replace('https://', '');

        console.log('LOADING', url, cachePath);

        const schema = schemaCache
            ? schemaCache.load(cachePath).catch((err) => {
                  console.log('NOT CACHED', err, cachePath);
                  return load(url).then((schema) => {
                      console.log('LOADED', url, schema);
                      schemaCache.save(cachePath, schema);

                      return schema;
                  });
              })
            : load(url);

        return schema
            .then((schema) => {
                return schema.replace(/\$href/g, '$ref'); //TODO: bug in landingPage.json
                //.replace(/title/g, 'titl'); //TODO: force fail, remove when done
            })
            .then((schema) => {
                return JSON.parse(schema);
            });
    };
};

const localSchemaLoader = (basePath, resources) => {
    const schemas = resources.create(basePath);

    return (path) => {
        const schema = schemas.load(path);

        return schema
            .then((schema) => {
                return schema.replace(/\$href/g, '$ref'); //TODO: bug in landingPage.json
                //.replace(/title/g, 'titl'); //TODO: force fail, remove when done
            })
            .then((schema) => {
                return JSON.parse(schema);
            });
    };
};

const validateAgainstSchema = (json, schemaPath, loadSchema) => {
    //TODO
    const ajv = new Ajv.default({
        strict: 'log',
        loadSchema: loadSchema,
    });
    addFormats(ajv);

    return loadSchema(schemaPath)
        .then((schema) => {
            // draft-04 is no longer supported, leads to endless recursion
            if (
                schema.$schema &&
                schema.$schema === 'http://json-schema.org/draft-04/schema#'
            ) {
                const validate = () => false;
                validate.errors = [
                    {
                        message: `JSON Schema draft-04 is not supported (${schemaPath}).`,
                    },
                ];
                return Promise.resolve(validate);
            }
            return ajv.compileAsync(schema);
        })
        .then((validate) => {
            const result = validate(json);

            return {
                success: result,
                message: ajv.errorsText(validate.errors),
                errors: validate.errors,
            };
        });
};

const createAssertion = (validationResult, context, verbose = false) => {
    let placeholder;
    let detail;

    if (verbose) {
        placeholder = '#{this}';
        detail =
            ' -> errors:\n' +
            util.inspect(validationResult.errors, false, null);
    } else {
        placeholder = '#{this}';
        detail = ' -> ' + validationResult.message;
    }

    context.assert(
        validationResult.success,
        `expected ${placeholder} to match json-schema${detail}`,
        `expected ${placeholder} to not match json-schema`
    );
};

export default (opts, chai) => ({
    // needs to be actual function for this to work
    compliesToSchema: function (
        file,
        basePath = path.dirname(file) + '/',
        useCache = true
    ) {
        console.log('BASEPATH', basePath, path.basename(file));
        const schemaLoader = isUrl(basePath)
            ? remoteSchemaLoader(basePath, useCache ? opts.cache : null)
            : localSchemaLoader(basePath, opts.resources);
        const context = this;
        const json = chai.flag(context, 'object');

        return {
            end: (done) =>
                validateAgainstSchema(json, path.basename(file), schemaLoader)
                    .then((result) => {
                        createAssertion(result, context, opts.verbose);
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    }),
        };
    },
});
