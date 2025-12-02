/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@assistant-ui/react", "@assistant-ui/react-markdown"]
  },
  webpack: (config, { dev, isServer }) => {
    // Disable all optimization in production to avoid CSS parsing issues
    if (!dev && !isServer) {
      config.optimization.minimize = false;
    }
    return config;
  }
};

module.exports = nextConfig;