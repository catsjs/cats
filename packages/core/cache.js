import fsExtra from 'fs-extra';
import { resolve, dirname } from 'path';

const { ensureDirSync, readFileSync, readFile, writeFileSync } = fsExtra;

const createCache = (rootDir) => (subDirs = '') => {
    const cacheDir = resolve(rootDir, 'cache', subDirs);

    return {
        save: (name, content) => {
            const path = resolve(cacheDir, name);
            console.log('SAVING', path);
            ensureDirSync(dirname(path));
            writeFileSync(path, content);
        },
        load: (name) => {
            const path = resolve(cacheDir, name);
            return readFile(path, 'utf8');
        },
        loadSync: (name) => {
            const path = resolve(cacheDir, name);
            return readFileSync(path, 'utf-8');
        },
    };
};

export default (opts) => {
    const { rootDir } = opts;

    return {
        create: createCache(rootDir),
        ...createCache(rootDir)(),
    };
};
