import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages: defina BASE_PATH=/nome-repo/ no deploy se necessário
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
