import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'packages/*/src/**/*.test.ts', 'apps/web/src/**/*.spec.ts'],
    environment: 'node',
  },
});
