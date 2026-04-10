export const siteConfig = {
  name: 'NovaTec Aula Virtual',
  shortName: 'NovaTec Aula',
  description:
    'Plataforma educativa y aula virtual para colegios, academias e instituciones que necesitan gestionar cursos, tareas, exámenes, recursos y comunicación en línea.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://myaula.vercel.app',
  ogImage: '/logo-novatec.jpeg',
  locale: 'es_PE',
  type: 'website',
};

export const coreKeywords = [
  'aula virtual',
  'plataforma educativa',
  'campus virtual',
  'LMS para colegios',
  'LMS para academias',
  'software de gestión educativa',
  'sistema de gestión educativa',
  'gestión de cursos online',
  'tareas y evaluaciones online',
  'exámenes en línea',
  'plataforma para docentes y estudiantes',
  'recursos educativos digitales',
  'foros educativos',
  'educación virtual para instituciones',
];

export const indexRobots = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
};

export const noIndexRobots = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = '/',
  keywords = [],
  index = true,
} = {}) {
  const mergedKeywords = [...new Set([...coreKeywords, ...keywords])];
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;

  return {
    metadataBase: new URL(siteConfig.url),
    title: title ? fullTitle : { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
    description,
    applicationName: siteConfig.shortName,
    keywords: mergedKeywords,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    alternates: {
      canonical: path,
      languages: {
        'es-PE': path,
        es: path,
        'x-default': path,
      },
    },
    category: 'education',
    creator: siteConfig.name,
    publisher: siteConfig.name,
    robots: index ? indexRobots : noIndexRobots,
    openGraph: {
      type: siteConfig.type,
      locale: siteConfig.locale,
      url: path,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [siteConfig.ogImage],
    },
  };
}
