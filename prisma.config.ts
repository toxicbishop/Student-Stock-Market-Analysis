import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7: datasource URL must be configured here instead of schema.prisma
export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
