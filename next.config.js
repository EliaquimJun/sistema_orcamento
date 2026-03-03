/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ESSENCIAL
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;