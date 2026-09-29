/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

  // Class-based dark mode so we can toggle programmatically
  darkMode: 'class',

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            // Responsive images in prose by default
            img: {
              borderRadius: theme('borderRadius.xl'),
              maxWidth: '100%',
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'block',
            },
            // Syntax highlight blocks
            pre: {
              borderRadius: theme('borderRadius.xl'),
            },
            // Links
            a: {
              color: theme('colors.brand.600'),
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.brand.400'),
            },
            h1: { color: theme('colors.gray.100') },
            h2: { color: theme('colors.gray.100') },
            h3: { color: theme('colors.gray.200') },
            h4: { color: theme('colors.gray.200') },
            strong: { color: theme('colors.gray.100') },
            code: { color: theme('colors.brand.300') },
            blockquote: {
              color: theme('colors.gray.400'),
              borderLeftColor: theme('colors.brand.500'),
            },
          },
        },
      }),
    },
  },

  plugins: [require('@tailwindcss/typography')],
};
