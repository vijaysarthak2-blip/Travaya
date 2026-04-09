/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        hostname: 'localhost',
        port: '',
        pathname: '**',
      },
      {
        hostname: '127.0.0.1',
        port: '',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
