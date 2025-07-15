/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["res.cloudinary.com",'img.clerk.com'],
      },
      eslint: {
  ignoreDuringBuilds: true,
},

};

export default nextConfig;
