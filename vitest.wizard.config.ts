import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./apps/react/src/test/setup.ts'],
    include: [
      'apps/react/src/components/Wizard/**/__tests__/**/*.{test,spec}.{ts,tsx}',
      'apps/react/src/App.test.tsx',
    ],
    testTimeout: 20000,
    reporters: ['default'],
    outputFile: {
      junit: '.logs/wizard-vitest-results.xml',
    },
  },
});
