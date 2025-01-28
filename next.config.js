/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    config.module.exprContextCritical = false;
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' blob: data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://unpkg.com; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; child-src blob:; connect-src 'self' https://unpkg.com blob:;"
          }
        ],
      },
    ];
  },
}

module.exports = nextConfig