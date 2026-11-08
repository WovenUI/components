// $components switches: off removes the component, bad names and values raise errors.
import { compileFile, compileString, fail } from './helpers.mjs';
import { BUNDLE } from './helpers.mjs';

const failures = [];
const expectError = (label, source, pattern) => {
    try {
        compileString(source);
        failures.push(`${label}: no error raised`);
    } catch (error) {
        if (!pattern.test(error.message)) {
            failures.push(`${label}: wrong error: ${error.message.split('\n')[0]}`);
        }
    }
};

if (!/\.wu-btn/.test(compileFile(BUNDLE))) {
    failures.push('bundle has no .wu-btn rules with defaults');
}
const off = compileString(
    '@use "index" with ($components: ("button": false, "btn-group": false, "pagination": false, "confirm-modal": false, "input-group": false));'
);
if (/\.wu-btn/.test(off)) failures.push('button: false still emits .wu-btn rules');

expectError(
    'unknown name',
    '@use "index" with ($components: ("nope": false));',
    /unknown component "nope"/
);
expectError(
    'non-boolean',
    '@use "index" with ($components: ("button": 1));',
    /takes true or false/
);
expectError(
    'missing dependency in the registry',
    '@use "index" with ($components: ("button": false));',
    /"btn-group" needs "button"/
);
expectError(
    'missing dependency',
    '@use "kit"; $r: ("a": (), "b": ("a",)); $x: kit.enabled(("a": false), $r);',
    /"b" needs "a"/
);
fail('switches', failures);
