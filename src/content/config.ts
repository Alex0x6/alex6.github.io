import { defineCollection, z } from 'astro:content';

// ── Tutoriels ────────────────────────────────────────────────────────────────
const tutorielsCollection = defineCollection({
  type: 'content', // markdown / MDX files
  schema: z.object({
    /** Titre de l'article (affiché en <h1> et dans le <title>) */
    title: z.string().min(1),

    /** Date de publication – accepte "2025-06-15" ou ISO 8601 */
    date: z.coerce.date(),

    /** Courte description (méta SEO + card preview) */
    description: z.string().max(200),

    /**
     * Image de couverture (optionnelle).
     * Utilisez un chemin absolu depuis la racine du site : "/images/mon-image.png"
     * (l'image doit être dans public/images/).
     *
     * 💡 Pour utiliser l'optimisation automatique d'Astro (<Image />), passez en .mdx
     *    et importez l'image depuis src/assets/ :
     *    import cover from '../../assets/mon-image.png';
     */
    cover: z.string().optional(),

    /** Tags/catégories (optionnels) */
    tags: z.array(z.string()).default([]),

    /** Langue de l'article : 'fr' | 'en' */
    lang: z.enum(['fr', 'en']).default('fr'),

    /** Brouillon – non publié si true */
    draft: z.boolean().default(false),
  }),
});

// ── Export des collections ────────────────────────────────────────────────────
export const collections = {
  tutoriels: tutorielsCollection,
};
