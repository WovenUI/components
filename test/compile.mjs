// The bundle and every entry compile and declare no core tokens (only --wu-kit-* custom properties).
import postcss from 'postcss';
import { BUNDLE, compileFile, entryFiles, fail } from './helpers.mjs';

const failures = [];
const files = [BUNDLE, ...entryFiles()];
for (const file of files) {
    let css;
    try {
        css = compileFile(file);
    } catch (error) {
        failures.push(`${file} does not compile: ${error.message.split('\n')[0]}`);
        continue;
    }
    postcss.parse(css).walkDecls((decl) => {
        if (decl.prop.startsWith('--wu-') && !decl.prop.startsWith('--wu-kit-')) {
            failures.push(`${file} declares ${decl.prop}`);
        }
    });
}
fail(`compile (${files.length} files)`, failures);
