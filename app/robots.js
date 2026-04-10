import { siteConfig } from '@/lib/seo';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/help'],
        disallow: [
          '/admin/',
          '/dashboard',
          '/calendar',
          '/chat',
          '/courses',
          '/exams',
          '/forum',
          '/grades',
          '/login',
          '/notifications',
          '/profile',
          '/register',
          '/resources',
          '/settings',
          '/tasks',
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
