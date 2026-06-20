import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9009/api/v1/portfolio-management"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
