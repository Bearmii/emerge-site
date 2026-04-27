/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['framer-motion', '@react-three/drei'],
  },
  async redirects() {
    return [
      { source: '/normal',         destination: '/',                permanent: true },
      { source: '/full-ai',        destination: '/ai',              permanent: true },
      { source: '/stabilization',  destination: '/support',         permanent: true },
      { source: '/optimization',   destination: '/customization',   permanent: true },
      { source: '/rescue',         destination: '/implementation',  permanent: true },
      { source: '/technical-debt', destination: '/customization',   permanent: true },
    ];
  },
};

export default nextConfig;
