# Alex6 — Portfolio personnel

Site portfolio statique construit avec **Astro 5**, **Tailwind CSS** et déployé sur **GitHub Pages**.

## ✨ Fonctionnalités

- 🌗 Dark/Light mode (sans flash)
- 🌍 Bilingue FR/EN (i18n natif Astro)
- 📖 Content Collections (tutoriels Markdown/MDX)
- 🎬 View Transitions (navigation fluide)
- 💬 Commentaires Giscus (GitHub Discussions)
- 🔍 SEO complet (OG, Twitter Card, canonicals)
- 🚀 Déploiement automatique GitHub Actions

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
# → http://localhost:4321

# 3. Build de production
npm run build

# 4. Prévisualiser le build
npm run preview
```

## 📁 Structure du projet

```
-alex6.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← CI/CD GitHub Pages
├── public/
│   └── images/                 ← Images statiques (schémas, screenshots)
│       └── proxmox-gui.png
├── src/
│   ├── components/
│   │   ├── GiscusComments.astro
│   │   ├── Header.astro
│   │   ├── LanguageSwitcher.astro
│   │   ├── SEOHead.astro
│   │   ├── ThemeToggle.astro
│   │   └── TutorialCard.astro
│   ├── content/
│   │   ├── config.ts           ← Schéma Zod Content Collections
│   │   └── tutoriels/
│   │       ├── fr/
│   │       │   └── introduction-proxmox.md
│   │       └── en/
│   │           └── introduction-proxmox.md
│   ├── layouts/
│   │   ├── BaseLayout.astro    ← Layout racine (head, header, footer)
│   │   └── TutorialLayout.astro
│   ├── pages/
│   │   ├── index.astro         ← Redirect → /fr/
│   │   ├── 404.astro
│   │   ├── fr/
│   │   │   ├── index.astro
│   │   │   └── tutoriels/
│   │   │       ├── index.astro
│   │   │       └── [slug].astro
│   │   └── en/
│   │       ├── index.astro
│   │       └── tutorials/
│   │           ├── index.astro
│   │           └── [slug].astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## ✍️ Ajouter un tutoriel

Créez un fichier Markdown dans `src/content/tutoriels/fr/` ou `src/content/tutoriels/en/` :

```markdown
---
title: "Mon nouveau tutoriel"
date: 2025-08-01
description: "Une courte description (max 200 caractères)."
tags: ["linux", "homelab"]
lang: fr
draft: false
---

Contenu ici...
```

**Images** : placez vos images dans `public/images/` et référencez-les avec `![alt](/images/mon-image.png)`.

## 💬 Configurer Giscus

1. Allez sur [giscus.app](https://giscus.app)
2. Connectez votre dépôt GitHub
3. Copiez `REPO_ID` et `CATEGORY_ID`
4. Renseignez-les dans [`src/components/GiscusComments.astro`](src/components/GiscusComments.astro)

## 🌐 Déploiement GitHub Pages

1. Dans GitHub → Settings → Pages → Source : **GitHub Actions**
2. Pushez sur `main` → le workflow `.github/workflows/deploy.yml` se déclenche automatiquement

## 🏗️ Ajouter une nouvelle section

Par exemple "Projets Big Data" :

```
src/pages/fr/projets/index.astro   ← Page liste
src/pages/en/projects/index.astro  ← Version anglaise
```

Ajoutez le lien dans `src/components/Header.astro` dans le tableau `nav`.