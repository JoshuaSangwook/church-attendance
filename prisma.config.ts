import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"), // DATABASE_URL에서 DIRECT_URL로 변경
  },
});

// 주의: .env 파일에 비밀번호가 포함되어 있어서 git에 올라지지 않습니다
// 로컬 개발 시: .env 사용 (Direct URL - IPv4)
// Vercel 배포 시: .env.vercel 사용 (Transaction Pooler URL - IPv6)
