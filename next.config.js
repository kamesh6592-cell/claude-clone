/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@assistant-ui/react", "@assistant-ui/react-markdown"]
  }
};

module.exports = nextConfig;