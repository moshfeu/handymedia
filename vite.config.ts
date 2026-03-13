import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['ffmpeg-static', 'fluent-ffmpeg'],
            },
          },
        },
      },
      {
        entry: 'src/preload.ts',
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
