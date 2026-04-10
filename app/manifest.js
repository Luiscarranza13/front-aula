import { siteConfig } from '@/lib/seo';

export default function manifest() {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    categories: ['education', 'productivity', 'business'],
    start_url: '/',
    id: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#0f172a',
    lang: 'es-PE',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
  };
}
