/** @type {import('next').NextConfig} */

// Catalogue photography is served from the Supabase Storage public bucket.
// Derive the host from the configured project URL so changing projects only
// requires a .env update, not a code change.
const remotePatterns = []
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const supabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
    remotePatterns.push({
      protocol: supabase.protocol.replace(":", ""),
      hostname: supabase.hostname,
      pathname: "/storage/v1/object/public/**",
    })
  } catch {
    console.warn("NEXT_PUBLIC_SUPABASE_URL is not a valid URL")
  }
}

const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns,
    formats: ["image/avif", "image/webp"],
  },

  // Sensible production defaults
  poweredByHeader: false,
  compress: true,
}

module.exports = nextConfig
