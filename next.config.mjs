/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: 'https://backend-aula-production.up.railway.app',
  },
  publicRuntimeConfig: {
    NEXT_PUBLIC_API_URL: 'https://backend-aula-production.up.railway.app',
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Backend-URL',
            value: 'https://backend-aula-production.up.railway.app',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
