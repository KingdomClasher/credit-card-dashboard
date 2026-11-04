import type { NextConfig } from "next"
import path from "node:path"

const nextConfig: NextConfig = {
  // Only specify monorepo root traversal in local development when not building on Vercel
  ...(process.env.VERCEL
    ? {}
    : {
        turbopack: {
          root: path.resolve(__dirname, "../../.."),
        },
      }),
}

export default nextConfig
