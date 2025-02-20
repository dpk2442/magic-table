/* eslint-disable */
import { glob } from 'fs/promises';
import { basename } from 'path';
import { build } from 'vite';

await build({
    build: {
        lib: {
            entry: './src/index.ts',
            formats: ['es'],
            fileName: 'index',
        },
        copyPublicDir: false,
        emptyOutDir: true,
    },
    clearScreen: false,
});

for await (const bundle of glob('src/*.ts')) {
    if (bundle === 'src/index.ts') {
        continue;
    }

    await build({
        build: {
            lib: {
                entry: bundle,
                formats: ['es'],
                fileName: basename(bundle, '.ts'),
            },
            copyPublicDir: false,
            emptyOutDir: false,
        },
        clearScreen: false,
    });
}
