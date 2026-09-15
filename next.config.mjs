/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Allow CMS image uploads (partner logos) through server actions — the
    // default server-action body limit is 1 MB.
    serverActions: { bodySizeLimit: '4mb' },
  },
};

export default nextConfig;
