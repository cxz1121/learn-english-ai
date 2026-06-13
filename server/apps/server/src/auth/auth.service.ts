import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TokenPayload, RefreshTokenPayload, Token } from '@en/common/user';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: TokenPayload): Token {
    return {
      accessToken: this.jwtService.sign<RefreshTokenPayload>({ ...payload, tokenType: 'access' }), // 访问令牌
      refreshToken: this.jwtService.sign<RefreshTokenPayload>({ ...payload, tokenType: 'refresh' }, { expiresIn: '7d' }), // 刷新令牌
    }
  }
}
