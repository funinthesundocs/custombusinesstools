/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'

const nextConfig = {
  ...(isDev ? {} : { output: 'export' }),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  ...(isDev ? {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8787/api/:path*',
        },
      ]
    },
  } : {}),
}

export default nextConfig
