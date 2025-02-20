import { UserConfig } from 'vite';

export default {
    server: {
        host: '0.0.0.0',
    },
    build: {
        lib: {
            entry: './src/index.ts',
            formats: ['es'],
        },
        copyPublicDir: false,
    },
} satisfies UserConfig;
