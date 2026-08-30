import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/fast2sms': {
        target: 'https://www.fast2sms.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fast2sms/, '/dev/bulkV2'),
        headers: {
          'authorization': 'Ug2syWBXxhicpOw8aHGqDzr90mISQMA6FnCtoPuElNb37KVY1dTHXiktdqvzI1O7Rwn2lA4M6KcmhCGE',
        },
      },
    },
  },
});
