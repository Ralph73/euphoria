import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oknqvquknfkqwretxblp.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    qualities: [75, 85, 90], // 👈 AGREGAR ESTO
  },
};

export default nextConfig;