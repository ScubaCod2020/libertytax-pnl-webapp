import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: [
      'tests/**', // backward-compat: old path
      'test/**',  // exclude Playwright/E2E specs from vitest
      '**/node_modules/**', // exclude any nested node_modules (e.g., angular/node_modules)
    ],
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ]
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    },
    assetsInlineLimit: 4096 // Inline assets smaller than 4KB
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.API_PROXY || process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173
  }
})