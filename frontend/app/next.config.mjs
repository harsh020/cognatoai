/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/app',
  reactStrictMode: true,
  // swcMinify: true, // Optional: Usually enabled by default in recent Next.js versions
  output: 'standalone',
  trailingSlash: true,
};

export default nextConfig;
