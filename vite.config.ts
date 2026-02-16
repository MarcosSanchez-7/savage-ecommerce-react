import path from 'path';
import { defineConfig, loadEnv } from 'vite';
// Trigger HMR restart
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5175,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // 'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '') // REMOVED FOR SECURITY
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
