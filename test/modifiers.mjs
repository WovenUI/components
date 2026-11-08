// Runs scripts/check-modifiers.mjs against the built dist.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { DIST, ROOT_DIR } from './helpers.mjs';

const script = path.join(ROOT_DIR, 'scripts', 'check-modifiers.mjs');
const result = spawnSync(
    process.execPath,
    [script, path.join(DIST, 'wovenui-kit.css')],
    { stdio: 'inherit' }
);
process.exit(result.status ?? 1);
