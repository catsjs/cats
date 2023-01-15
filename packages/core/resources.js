import fsExtra from 'fs-extra';
import { resolve } from 'path';
const { readFileSync, readFile } = fsExtra;

const createResourceLoader = (rootDir) => (subDirs = '') => {
    const resourceDir = resolve(rootDir, subDirs);

    return {
        load: (name) => {
            const path = resolve(resourceDir, name);
            return readFile(path, 'utf8');
        },
        loadSync: (name) => {
            const path = resolve(resourceDir, name);
            return readFileSync(path, 'utf-8');
        },
    };
};

export default (opts) => {
    const { rootDir } = opts;

    return {
        create: createResourceLoader(rootDir),
        ...createResourceLoader(rootDir)(),
    };
};
