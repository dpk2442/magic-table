import { UserConfig } from 'vite';

export default {
    server: {
        host: '0.0.0.0',
        port: 5173,
    },
    build: {
        lib: {
            entry: './src/index.ts',
            formats: ['es'],
        },
        copyPublicDir: false,
    },
    esbuild: {
        minifyIdentifiers: false,
    },
} satisfies UserConfig;
