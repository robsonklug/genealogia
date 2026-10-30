import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    environment: 'node',
    testTimeout: 180_000,
    // O REST do AppServer de demonstração tem uma thread só (2 licenças):
    // arquivos em paralelo enfileiram e recebem 503. Um arquivo por vez.
    fileParallelism: false,
  },
});
