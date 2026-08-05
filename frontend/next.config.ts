import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "172.22.10.101:3000",
    "172.22.10.101",
  ],
};

export default nextConfig;
