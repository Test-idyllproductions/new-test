import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode, command }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    // Use base path only for GitHub Pages build, not for local development
    const base = command === 'build' && mode === 'production' ? '/new-test/' : '/';
    
    return {
      base: base,
      server: {
        port: 3001,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: undefined,
          }
        }
      },
      css: {
        postcss: './postcss.config.js',
      }
    };
});
