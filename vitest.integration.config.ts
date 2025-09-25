import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.integration.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ]
    },
    testTimeout: 10000, // Longer timeout for integration tests
    reporters: [
      'default',
      ['junit', { outputFile: 'run-reports/integration/junit-integration.xml' }],
      ['html', { outputFolder: 'run-reports/integration/html' }],
    ],
  },
})
