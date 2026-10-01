// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // ── GitHub Pages deployment ─────────────────────────────────────────────────
  // Replace with your real GitHub username/repo if the repo name differs
  site: 'https://alex6.github.io',
  // base: '/-alex6.github.io', // ← Uncomment if repo is NOT username.github.io

  // ── Integrations ────────────────────────────────────────────────────────────
  integrations: [
    tailwind({
      // Let Astro handle the CSS injection; we define config in tailwind.config.mjs
      applyBaseStyles: false,
    }),
    mdx(),
  ],

  // ── i18n ────────────────────────────────────────────────────────────────────
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      prefixDefaultLocale: true, // /fr/... and /en/...
    },
  },

  // ── Markdown ─────────────────────────────────────────────────────────────────
  markdown: {
    shikiConfig: {
      // 'css-variables' permet de contrôler les couleurs via CSS (dark/light)
      theme: 'css-variables',
      wrap: true,
    },
  },

  // ── Redirections ─────────────────────────────────────────────────────────────
  redirects: {
    '/': '/fr/',
  },

  // ── Build output ─────────────────────────────────────────────────────────────
  output: 'static',

  // ── Dev server ───────────────────────────────────────────────────────────────
  server: {
    port: 4321,
    host: true,
  },
});
