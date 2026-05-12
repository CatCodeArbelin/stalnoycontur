import type { NextConfig } from "next";

const DEFAULT_API_PROXY_TARGET = "http://localhost:8000/api";

function getApiProxyTarget() {
  const apiProxyTarget = process.env.API_PROXY_TARGET || process.env.INTERNAL_API_URL || DEFAULT_API_PROXY_TARGET;
  return apiProxyTarget.replace(/\/+$/, "");
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${getApiProxyTarget()}/:path*`,
      },
    ];
  },
};

export default nextConfig;
