import { defineConfig } from "drizzle-kit"
import { config } from "dotenv"

config({ path: ".env.local" })
config({ path: ".env" })

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@127.0.0.1:5432/postgres",
  },
})
