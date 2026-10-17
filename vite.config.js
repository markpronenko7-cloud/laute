import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function lauteApiPlugin() {
  return {
    name: 'laute-api-backend',
    async configureServer(server) {
      process.env.VITE_EMBEDDED = 'true';
      try {
        const { app } = await import('./server/index.js');
        server.middlewares.use(app);
        console.log('⚡ [LAUTE] Backend CMS API успешно подключен к Vite Dev Server');
      } catch (err) {
        console.error('❌ [LAUTE] Ошибка подключения Backend API к Vite:', err);
      }
    }
  };
}

export default defineConfig({
  base: '/laute/',
  plugins: [react(), lauteApiPlugin()],
  server: {
    port: 5173,
    open: false,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-xlsx': ['xlsx']
        }
      }
    }
  }
});

