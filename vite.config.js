import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: undefined,
      },
      external: ['main.js', 'style.css'], // Adicione esta linha para externalizar o JS e CSS
    },
  },
  server: {
    mimeTypes: {
      'js': 'application/javascript',
      'css': 'text/css'
    }
  }
});
