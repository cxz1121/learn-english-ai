import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import type { RefreshTokenPayload } from '@en/common/user';

// 认证守卫
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest(); // 获取请求对象
    const headers = request.headers;
    if(!headers.authorization) {
      throw new UnauthorizedException('你是偷子???'); // 未授权 401
    }
    const token = headers.authorization.split(' ')[1]; // 从请求头中获取token
    try {
      const decoded = this.jwtService.verify<RefreshTokenPayload>(token);
      if(decoded.tokenType !== 'access') {
        throw new UnauthorizedException('token已过期或无效');
      }
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('token已过期或无效');
    }
  }
}

//因为不是所有的接口都需要增加token 按需的 login接口 register接口 公共接口 按需使用 哪个接口需要鉴权就给谁加
// web -> axios -> 请求 -> guard -> controller -> service -> xxx -> response
