import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ["https://5a44-89-185-28-24.ngrok-free.app"],
  compiler: {},
  experimental: {},
  devIndicators: { position: "bottom-right" }
}

export default nextConfig
