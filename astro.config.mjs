import { defineConfig } from 'astro/config';

// Pages are fully prerendered; /api is implemented with Vercel Functions.
export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  vite: { build: { cssMinify: 'esbuild' } },
});
