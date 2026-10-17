import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Ensure DATABASE_URL is set so Prisma doesn't throw on serverless Vercel runtimes
if (!process.env.DATABASE_URL) {
  if (process.env.VERCEL) {
    // Vercel serverless functions have a read-only filesystem except for /tmp
    const tmpDbPath = path.join("/tmp", "dev.db");
    
    // If the template database exists in the project root/prisma, copy it to /tmp
    const sourceDbPaths = [
      path.join(process.cwd(), "prisma", "dev.db"),
      path.join(process.cwd(), "dev.db"),
    ];

    if (!fs.existsSync(tmpDbPath)) {
      for (const src of sourceDbPaths) {
        if (fs.existsSync(/* turbopackIgnore: true */ src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            break;
          } catch {
            // ignore
          }
        }
      }
    }

    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  } else {
    process.env.DATABASE_URL = "file:./dev.db";
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

