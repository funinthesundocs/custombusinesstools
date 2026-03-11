/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Exclude dev-only API routes from static export build
  excludeDefaultMomentLocales: true,
}

export default nextConfig
