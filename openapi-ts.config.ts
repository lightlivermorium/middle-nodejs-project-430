import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './generated/openapi.yaml',
  output: './src/generated',
  plugins: ['@hey-api/typescript', 'fastify'],
});
