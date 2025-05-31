import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ignore TypeScript errors during build
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore unused imports warning
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
        
        // Ignore circular dependency warnings if needed
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        
        // Default warning handling
        warn(warning);
      }
    },
    // Continue build despite errors
    sourcemap: false,
    minify: 'esbuild'
  },
  esbuild: {
    // Ignore TypeScript type errors
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Remove unused imports
    treeShaking: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    exclude: ['@typescript-eslint/parser']
  }
})