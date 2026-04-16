/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API ?? process.env.GOOGLE_MAPS_API ?? '',
  },
}

export default nextConfig
