// The script modules and both dist builds load without a DOM and export the same functions.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { DIST, SRC, fail } from './helpers.mjs';

const expected = [
    'dismiss',
    'init',
    'initAutocomplete',
    'initDataTable',
    'initInputClear',
    'initTable',
    'initTabs',
    'initToast',
    'sortTable',
    'toast',
];
const failures = [];
const check = (label, api) => {
    const names = Object.keys(api).sort();
    if (JSON.stringify(names) !== JSON.stringify(expected)) {
        failures.push(`${label}: exports ${names.join(', ')}`);
    }
    for (const name of expected) {
        if (typeof api[name] !== 'function') {
            failures.push(`${label}: ${name} is not a function`);
        }
    }
};
// dist is imported as a data URL: the package has no "type", and a .js file there would warn
const load = async (label, file, asData = false) => {
    try {
        if (!asData) return await import(pathToFileURL(file));
        const code = readFileSync(file, 'utf8');
        return await import(`data:text/javascript,${encodeURIComponent(code)}`);
    } catch (error) {
        failures.push(`${label} does not load: ${error.message}`);
        return {};
    }
};

check(
    'src/js/index.js',
    await load('src/js/index.js', path.join(SRC, 'js/index.js'))
);
for (const name of ['tabs', 'toast', 'autocomplete', 'data-table', 'input-clear']) {
    const mod = await load(name, path.join(SRC, 'js', `${name}.js`));
    if (Object.keys(mod).length === 0)
        failures.push(`src/js/${name}.js exports nothing`);
}
check(
    'dist/wovenui-kit.js',
    await load('dist/wovenui-kit.js', path.join(DIST, 'wovenui-kit.js'), true)
);

const context = {};
try {
    vm.runInNewContext(
        readFileSync(path.join(DIST, 'wovenui-kit.iife.js'), 'utf8'),
        context
    );
    check('dist/wovenui-kit.iife.js', context.WovenUIKit ?? {});
} catch (error) {
    failures.push(`dist/wovenui-kit.iife.js does not run: ${error.message}`);
}
fail(`js (${expected.length} exports)`, failures);
