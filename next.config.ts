import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['logo.clearbit.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://your-netlify-domain.netlify.app/api'  // Replace with your actual Netlify domain
      : 'http://localhost:3000/api'
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/signout',
        destination: '/signin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
