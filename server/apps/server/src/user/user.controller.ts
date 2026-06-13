import { Controller, Post, Body, Patch, UploadedFile, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Token, UserLogin, UserRegister, UserUpdate } from '@en/common/user';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@libs/shared/auth/auth.guard';
import type { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 登录
  @Post('login')
  login(@Body() createUserDto: UserLogin) {
    return this.userService.login(createUserDto);
  }

  // 注册
  @Post('register')
  register(@Body() createUserDto: UserRegister) {
    return this.userService.register(createUserDto);
  }

  // 刷新token 只需要refreshToken
  @Post('refresh-token')
  refresh(@Body() createUserDto: Omit<Token, 'accessToken'>) {
    return this.userService.refreshToken(createUserDto);
  }

  // 上传头像
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file')) // 限制前端上传的key 为 file
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.userService.uploadAvatar(file);
  }

  // 更新用户信息
  @UseGuards(AuthGuard)
  @Post('update-user')
  update(@Body() updateUserDto: UserUpdate, @Req() req: Request) {
    const user = req.user
    return this.userService.updateUser(updateUserDto, user);
  }
}
