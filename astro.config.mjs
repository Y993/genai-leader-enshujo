// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://Y993.github.io',
  base: '/genai-leader-enshujo',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
