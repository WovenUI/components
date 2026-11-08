// Each per-component entry emits the same rules as the bundle with only that component and its needs on.
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { ENTRIES_DIR, compileFile, compileString, fail, rulesOf } from './helpers.mjs';

const names = readdirSync(ENTRIES_DIR)
    .filter((f) => f.endsWith('.scss'))
    .map((f) => path.basename(f, '.scss'));
// A component and the components it needs, from the registry
const needsOf = (name) => {
    const css = compileString(
        `@use "kit"; a { b: kit.with-needs("${name}"); }`
    );
    return css.match(/b: (.*);/)[1].replace(/"/g, '').split(', ');
};

const failures = [];
for (const name of names) {
    const keep = needsOf(name);
    const others = names
        .filter((n) => !keep.includes(n))
        .map((n) => `"${n}": false`)
        .join(', ');
    const bundle = rulesOf(
        compileString(`@use "index" with ($components: (${others}));`)
    );
    const entry = rulesOf(compileFile(path.join(ENTRIES_DIR, `${name}.scss`)));
    if (entry.length === 0) failures.push(`${name}: entry emits no rules`);
    if (JSON.stringify(entry) !== JSON.stringify(bundle)) {
        const missing = entry.filter((r) => !bundle.includes(r));
        const extra = bundle.filter((r) => !entry.includes(r));
        failures.push(
            `${name}: entry differs from bundle (${missing.length} only in entry, ${extra.length} only in bundle)`
        );
    }
}
fail(`entries (${names.length})`, failures);
