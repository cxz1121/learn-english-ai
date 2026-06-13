import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' } // 允许所有域名连接
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;
  // 链接成功之后会自动调用这个方法
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId; // 前端在连接时传递的userId
    if (userId) { // 加判断 userId 是否存在 热更新有时没有 userId
      client.join(`user_${userId}`); // 加入用户房间
    }
  }
  // 方法名随便起 支付成功之后通过前端关闭那个弹窗
  emitPaymentSuccess(userId: string) {
    // 通知房间内的用户触发这个事件
    this.server.to(`user_${userId}`).emit('paymentSuccess', userId);
  }
}
