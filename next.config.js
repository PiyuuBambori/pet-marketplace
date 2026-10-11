/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // `domains` is deprecated in Next 14 — use remotePatterns instead.
    // All catalogue photography is served from /public, so no remote
    // hosts are currently allowed. Add patterns here if you add S3/Cloudinary.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },

  // Sensible production defaults
  poweredByHeader: false,
  compress: true,
}

module.exports = nextConfig