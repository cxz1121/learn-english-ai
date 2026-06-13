import { Injectable, OnModuleInit } from '@nestjs/common';
import { AlipaySdk } from 'alipay-sdk';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class PayService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}
  public alipaySdk: AlipaySdk;
  onModuleInit() { 
    // 初始化支付服务
    this.alipaySdk = new AlipaySdk({
      appId: this.configService.get<string>('ALIPAY_APP_ID')!, // 应用ID
      gateway: this.configService.get<string>('ALIPAY_GATEWAY')!, // 支付网关
      privateKey: this.configService.get<string>('ALIPAY_PRIVATE_KEY')!, // 支付宝应用私钥
      alipayPublicKey: this.configService.get<string>('ALIPAY_PUBLIC_KEY')!, // 支付宝公钥
    });
  }
  getAlipaySdk() {
    return this.alipaySdk;
  }
}
