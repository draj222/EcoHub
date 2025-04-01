/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['google.com', 'lh3.googleusercontent.com', 'i.imgur.com', 'images.unsplash.com', 'placehold.co', 'randomuser.me', 'api.dicebear.com', 'i.ibb.co'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = nextConfig 