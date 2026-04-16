import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Whisper の上限は 25MB なので、Server Action のリクエスト上限を
    // それより少し大きめに設定する。
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
