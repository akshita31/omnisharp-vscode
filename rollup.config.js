import pkg from './package.json';
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default {
    input: 'src/main.ts',
    output: {
        sourcemap: 'inline',
        file: pkg.main,
        format: 'cjs'
    },
    external: [
        ...Object.keys(pkg.devDependencies || {})
    ],
    plugins: [
        typescript({
            typescript: require('typescript'),
            tsconfigOverride: {
                "compilerOptions": {
                    //"lib": ["es2015", "dom"],
                    //"declaration": true,
                    //"noImplicitAny": true,
                    "module": "ES2015",
                    //"target": "es5"
                },
            },
        }),
        
        resolve(),
        commonjs({
            include: 'node_modules/**',
            namedExports: {
                'node_modules/jsonc-parser/lib/main.js': ['getLocation', 'createScanner', 'SyntaxKind', 'parse'],
                'node_modules/fs-extra/lib/index.js': ['mkdirpSync', 'readFileSync', 'exists', 'readFile', 'writeFile', 'ensureDir', 'lstat', 'existsSync'],
                //'node_modules/request-light/lib/main.js': ['configure']
            }
        })
        ]
};