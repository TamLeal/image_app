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
  },
  // Adicione esta configuração para garantir que os arquivos JS sejam servidos corretamente
  assetsInclude: ['**/*.js'],
});