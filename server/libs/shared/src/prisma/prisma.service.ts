import { Injectable } from '@nestjs/common';

// import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { ConfigService } from '@nestjs/config'; // 使用 ConfigService get 替代 dotenv 的 process.env.DATABASE_URL
// const connectionString = `${process.env.DATABASE_URL}`;
// const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    const adapter = new PrismaPg({ connectionString: configService.get('DATABASE_URL') });
    super({ adapter });
  }
}
