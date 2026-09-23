// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://your-domain.com', // Replace with your actual domain
  adapter: node({ mode: 'standalone' }),
  env: {
    schema: {
      OMNIROUTER_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
      }),
      OMNIROUTER_API_BASE_URL: envField.string({
        context: 'server',
        access: 'public',
        url: true,
        default: 'https://api.webacela.com',
      }),
    },
  },
  integrations: [tailwind(), sitemap()]
});
