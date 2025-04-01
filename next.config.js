/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['google.com', 'lh3.googleusercontent.com', 'i.imgur.com', 'images.unsplash.com', 'placehold.co', 'randomuser.me', 'api.dicebear.com', 'i.ibb.co'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'eco-hub-git-main-draj222s-projects.vercel.app', 'eco-hub.vercel.app'],
    },
  },
}

module.exports = nextConfig 