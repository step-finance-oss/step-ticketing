import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    globals: true,
    env: {
      NEXT_PUBLIC_RECIPIENT_PUBLIC_KEY:
        "9BeLQY6AxrbLogjc7hSzuWq2eLX7X6ELqscqVLXjhXF9",
      NEXTAUTH_URL: "http://localhost:3000",
      NEXT_PUBLIC_USDC_MINT_ADDRESS:
        "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    },
  },
  resolve: {
    alias: {
      lib: path.resolve(__dirname, "./lib"),
    },
  },
})
