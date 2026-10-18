import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        godmode: resolve(process.cwd(), 'godmode.html')
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    watch: {
      ignored: ['**/android/**', '**/dist/**', '**/.git/**']
    }
  }
});
