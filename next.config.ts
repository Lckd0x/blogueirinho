/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/Short-Track',
        permanent: false, 
      },
    ];
  },
};

module.exports = nextConfig;
