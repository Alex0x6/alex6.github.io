// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // ── GitHub Pages deployment ─────────────────────────────────────────────────
  site: 'https://alex6.github.io',

  // ── Integrations ────────────────────────────────────────────────────────────
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
    sitemap({
      // Exclure les pages /fr/ qui sont de simples redirections (pas le contenu canonique)
      filter: (page) => !page.includes('/fr/'),
      i18n: {
        defaultLocale: 'fr',
        locales: {
          fr: 'fr-FR',
          en: 'en-US',
        },
      },
    }),
  ],

  // ── i18n ────────────────────────────────────────────────────────────────────
  // prefixDefaultLocale: false → `/` sert le FR, `/en/` sert l'EN
  // Meilleur pour le SEO : pas de redirection sur la page racine
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
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

  // ── Build output ─────────────────────────────────────────────────────────────
  output: 'static',

  // ── Dev server ───────────────────────────────────────────────────────────────
  server: {
    port: 4321,
    host: true,
  },
});
