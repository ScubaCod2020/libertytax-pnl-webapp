import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['angular/src/app/domain/**/*.spec.ts'],
    reporters: 'default',
  },
});
