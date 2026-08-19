import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Next.js 개발 서버는 파일이 바뀔 때마다 모듈을 다시 불러온다.
// 그때마다 PrismaClient 를 새로 만들면 DB 커넥션이 쌓여서 금방 한도에 걸린다.
// 그래서 전역 객체에 한 번 만든 인스턴스를 붙여두고 재사용한다.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
