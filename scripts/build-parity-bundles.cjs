#!/usr/bin/env node
const { build } = require('esbuild');
const { mkdirSync } = require('fs');

(async function run() {
    mkdirSync('dist-parity', { recursive: true });

    await build({
        entryPoints: ['angular/src/app/domain/calculations/calc.ts'],
        bundle: true,
        platform: 'node',
        format: 'esm',
        outfile: 'dist-parity/angular-calc.mjs',
        sourcemap: false,
        logLevel: 'silent',
    });

    await build({
        entryPoints: ['react-app-reference/react-app-reference/src/lib/calcs.ts'],
        bundle: true,
        platform: 'node',
        format: 'esm',
        outfile: 'dist-parity/react-calc.mjs',
        sourcemap: false,
        logLevel: 'silent',
    });

    console.log('Built parity bundles in dist-parity/.');
})().catch((err) => {
    console.error(err);
    process.exit(1);
});

