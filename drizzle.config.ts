import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/github-daily.db',
  },
})
