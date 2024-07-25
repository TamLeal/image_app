import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: undefined,
      },
      external: ['./main.js', './style.css'], // Externalize JS and CSS
    },
  },
  server: {
    mimeTypes: {
      'js': 'application/javascript',
      'css': 'text/css'
    }
  }
});
