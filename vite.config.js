import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    mimeTypes: {
      'js': 'application/javascript',
      'css': 'text/css'
    }
  }
});
