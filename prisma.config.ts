import { defineConfig, env } from "prisma/config";
import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";

// .env.local 파일에서 환경변수 로드
const envPath = resolve(process.cwd(), ".env.local");
try {
  const envFile = readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const [key, ...values] = line.split("=");
    if (key && !key.startsWith("#") && values.length > 0) {
      const value = values.join("=").trim().replace(/^"|"$/g, "");
      process.env[key] = value;
    }
  });
} catch (e) {
  console.warn(".env.local 파일을 찾을 수 없습니다.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
