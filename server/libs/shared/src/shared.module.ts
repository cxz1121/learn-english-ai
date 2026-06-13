import { Module, Global } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';
import { ResponseModule } from './response/response.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MinioModule } from './minio/minio.module';
import { PayModule } from './pay/pay.module';
import { EmailModule } from './email/email.module';
import { BullModule } from '@nestjs/bullmq';
@Global()
@Module({
  providers: [SharedService],
  exports: [SharedService, PrismaModule, ResponseModule, ConfigModule, JwtModule, MinioModule, PayModule, EmailModule],
  imports: [
    PrismaModule,
    ResponseModule,
    ConfigModule.forRoot({
      isGlobal: true, // 全局配置
      envFilePath: '.env', // 环境变量文件路径
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule], // 引入配置模块
      inject: [ConfigService], // 注入配置服务
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get('REDIS_PORT')),
        }
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // 引入配置模块
      inject: [ConfigService], // 注入配置服务
      useFactory: (configService: ConfigService) => ({ // 工厂函数 configService 是 new ConfigService 实例
        secret: configService.get('SECRET_KEY'), // 从配置服务中获取密钥
        signOptions: { expiresIn: '15m' }, // 过期时间 15分钟
      }),
    }),
    MinioModule,
    PayModule,
    EmailModule,
  ],
})
export class SharedModule {}
