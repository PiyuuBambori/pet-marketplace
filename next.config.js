/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // `domains` is deprecated in Next 14 — use remotePatterns instead.
    // Catalogue photography lives in the Supabase Storage bucket, so its
    // project host must be allowed here. Local /public photos still work.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hgworwdthqjzmnpujkvd.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Sensible production defaults
  poweredByHeader: false,
  compress: true,
}

module.exports = nextConfig