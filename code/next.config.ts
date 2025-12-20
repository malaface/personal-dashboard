import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimización para Docker: standalone output genera una versión minimalista
  output: 'standalone',

  // Configuración de imágenes (si se usan external images)
  images: {
    remotePatterns: [],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Transpile packages si es necesario (para monorepos o packages específicos)
  transpilePackages: [],

  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // Configuración experimental (Next.js 16)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
