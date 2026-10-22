import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'mastermode-clean-url-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url.split('?')[0];
          if (url === '/mastermode' || url === '/master' ||
              url === '/godmode' || url === '/admin' || url === '/dashboard' || url === '/ops') {
            req.url = '/runner-console.html' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        mastermode: resolve(process.cwd(), 'mastermode.html'),
        godmode: resolve(process.cwd(), 'godmode.html'),
        runnerConsole: resolve(process.cwd(), 'runner-console.html')
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
