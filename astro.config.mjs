// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://webacela.com',
  adapter: netlify({
    devFeatures: false,
  }),
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
