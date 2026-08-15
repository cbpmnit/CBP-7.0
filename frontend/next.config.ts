import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "172.21.81.117:3000",
    "172.21.81.117",
    "192.168.137.1:3000",
    "192.168.137.1",
    "172.22.10.101:3000",
    "172.22.10.101",
  ],
  async redirects() {
    return [
      {
        source: "/registration",
        destination: "/register",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
