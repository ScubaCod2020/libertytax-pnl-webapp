import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['angular/src/app/domain/**/*.spec.ts'],
    reporters: [
      'default',
      ['junit', { outputFile: 'run-reports/unit/junit-domain.xml' }],
      ['html', { outputFolder: 'run-reports/unit/html-domain' }],
    ],
  },
});
