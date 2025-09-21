import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./react-app-reference/react-app-reference/src/test/setup.ts'],
    include: [
      'react-app-reference/react-app-reference/src/components/Wizard/**/__tests__/**/*.{test,spec}.{ts,tsx}',
      'react-app-reference/react-app-reference/src/App.test.tsx',
    ],
    testTimeout: 20000,
    reporters: ['default'],
    outputFile: {
      junit: '.logs/wizard-vitest-results.xml',
    },
  },
});
