import path from 'path';
import { type NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    turbo: true, // ensures Turbopack is enabled
  },
  webpack(config) {
    // Add alias @ -> app/
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'app'),
    };
    return config;
  },
};

export default nextConfig;
