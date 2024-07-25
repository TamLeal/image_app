import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: undefined,
      },
      external: ['style.css'], // Adicione esta linha para externalizar o CSS
    },
  },
  server: {
    mimeTypes: {
      'js': 'application/javascript',
      'css': 'text/css'
    }
  }
});
