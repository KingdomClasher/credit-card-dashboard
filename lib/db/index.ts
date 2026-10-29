import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@127.0.0.1:5432/postgres"

if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "test") {
  console.warn(
    "[db] DATABASE_URL is not set. Using local fallback connection string."
  )
}

// Connection caching across hot reloads in Next.js development
declare global {
  var __postgres_client__: postgres.Sql | undefined
}

const client =
  globalThis.__postgres_client__ ??
  postgres(connectionString, {
    max: 10,
    prepare: false, // Required for Supabase transaction pooler (pgbouncer)
    connect_timeout: 5,
  })

if (process.env.NODE_ENV !== "production") {
  globalThis.__postgres_client__ = client
}

export const db = drizzle(client, { schema })
export type Database = typeof db

export * from "./schema"
