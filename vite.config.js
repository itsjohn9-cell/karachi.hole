import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { handleAnalyticsApiRequest } from './src/analytics/analyticsApiHandler.js';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'analytics-api-and-clean-url-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url.split('?')[0];

          // 1. API endpoint routing
          if (url.startsWith('/api/analytics') || url.startsWith('/api/admin/analytics')) {
            try {
              const handled = await handleAnalyticsApiRequest(req, res);
              if (handled) return;
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
              return;
            }
          }

          // 2. Clean URL rewrites
          if (url === '/analytics' || url === '/analytics-admin' || url === '/command-center') {
            req.url = '/analytics-admin.html' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
          } else if (url === '/mastermode' || url === '/master' ||
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
        runnerConsole: resolve(process.cwd(), 'runner-console.html'),
        analyticsAdmin: resolve(process.cwd(), 'analytics-admin.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/lucide-react')) {
            return 'vendor-react';
          }
        }
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
