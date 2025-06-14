/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cd636124db1f735e79eb319c97fe7210.r2.cloudflarestorage.com",
        // pathname: "**", // optional, allows all paths
      },
    ],
  },
};

export default nextConfig;
