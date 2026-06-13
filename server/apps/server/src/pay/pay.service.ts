import { CreatePayDto } from '@en/common/pay';
import { Injectable } from '@nestjs/common';
import { TokenPayload } from '@en/common/user';
import { PrismaService, ResponseService, PayService as SharedPayService } from '@libs/shared';
import * as nanoid from 'nanoid';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { TradeStatus } from '@libs/shared/generated/prisma/enums';
import { SocketGateway } from '../socket/socket.gateway';
@Injectable()
export class PayService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sharedPayService: SharedPayService,
    private readonly configService: ConfigService,
    private readonly socketGateway: SocketGateway,
    private readonly responseService: ResponseService,
  ) {}
  private createTradeNo() {
    const prefix = 'CXZ';
    return prefix + '-' + nanoid.nanoid(12);
  }
  async create(createPayDto: CreatePayDto, user: TokenPayload) {
    // 购买过该课程 则直接返回成功
    const isPurchased = await this.prismaService.courseRecord.findFirst({
      where: {
        userId: user.userId,
        courseId: createPayDto.courseId,
      },
    })
    if (isPurchased) {
      return this.responseService.error(null, '您已经购买过该课程');
    }
    const result = await this.prismaService.$transaction(async (tx) => {
      // 1.创建订单表 订单状态为未支付 （待支付）
      const outTradeNo = this.createTradeNo();
      await tx.paymentRecord.create({
        data: {
          userId: user.userId, // 用户ID
          outTradeNo: outTradeNo, // 订单号
          amount: createPayDto.total_amount, // 订单金额
          body: createPayDto.body, // 支付内容
          subject: createPayDto.subject, // 订单标题
        },
      })
      // 2.支付宝SDK支付 返回支付链接
      const dateTime = dayjs().add(5, 'minute') // 订单过期时间 5分钟后 为了测试快一点
      const payUrl = this.sharedPayService.getAlipaySdk().pageExecute('alipay.trade.page.pay', 'GET', {
        bizContent: {
          out_trade_no: outTradeNo, // 订单号
          product_code: "FAST_INSTANT_TRADE_PAY", // 支付产品码
          subject: createPayDto.subject, // 订单标题
          body: JSON.stringify({
            userId: user.userId, // 用户ID
            courseId: createPayDto.courseId, // 课程ID
          }), // 支付内容
          total_amount: createPayDto.total_amount, // 订单金额
          time_expire: dateTime.format('YYYY-MM-DD HH:mm:ss'), // 订单过期时间
        },
        notify_url: `${this.configService.get<string>('ALIPAY_NOTIFY_URL')}/api/v1/pay/notify`, // 异步回调地址
      })
      return {
        payUrl, //支付URL
        timeExpire: dateTime.toDate().getTime(), // element-plus 组件需要时间戳
      }
    })
    return this.responseService.success(result);
  }
  async notify(req: Request) {
    this.prismaService.$transaction(async (tx) => {
      // 1.更新支付库  支付时间 + 支付宝交易号 
      const paymentRecord = await tx.paymentRecord.update({
        where: {
          outTradeNo: req.body.out_trade_no,
        },
        data: {
          tradeNo: req.body.trade_no, // 支付宝交易号
          tradeStatus: TradeStatus.TRADE_SUCCESS, // 支付状态
          sendPayTime: dayjs(req.body.gmt_payment).toDate(), // 支付时间
        },
      })
      // 2.创建用户课程购买记录
      const { userId, courseId } = JSON.parse(req.body.body) as { userId: string, courseId: string };
      await tx.courseRecord.create({
        data: {
          userId: userId, // 用户ID
          courseId: courseId, // 课程ID
          isPurchased: true, // 是否购买
          paymentRecordId: paymentRecord.id, // 支付记录ID
        },
      })
      // 3.通知前端支付成功 socket
      this.socketGateway.emitPaymentSuccess(userId);
    })
    return true;
  }
}
