import { glob } from 'fs/promises';
import { basename } from 'path';
import { build } from 'vite';

await build({
    build: {
        lib: {
            entry: './src/index.ts',
            fileName: 'index',
        },
        emptyOutDir: true,
    },
    clearScreen: false,
});

for await (const bundle of glob('src/*.ts')) {
    if (bundle !== 'src/index.ts') {
        await build({
            build: {
                lib: {
                    entry: bundle,
                    fileName: basename(bundle, '.ts'),
                },
                emptyOutDir: false,
            },
            clearScreen: false,
        });
    }
}
