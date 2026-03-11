import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bddk.org.tr",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
