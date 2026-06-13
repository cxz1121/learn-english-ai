import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@libs/shared';
import { ResponseService } from '@libs/shared';
import { RefreshTokenPayload, Token, TokenPayload, UserLogin, UserRegister, UserUpdate } from '@en/common/user';
import type { Prisma } from '@libs/shared/generated/prisma/client'; 
import { AuthService } from '../auth/auth.service';
import { userSelect, updateUserSelect } from './user.select';
import { JwtService } from '@nestjs/jwt';
import { MinioService } from '@libs/shared/minio/minio.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService, 
    private readonly responseService: ResponseService, 
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
  ) {}

  async login(createUserDto: UserLogin) {
    // 1.检查手机号是否存在
    const user = await this.prisma.user.findUnique({
      where: {
        phone: createUserDto.phone,
      },
    });
    if (!user) {
      return this.responseService.error(null, '手机号不存在');
    }
    // 2.检查密码是否正确
    if (user.password !== createUserDto.password) {
      return this.responseService.error(null, '密码错误');
    }
    // 3.查询用户信息 更新最后登录时间
    const updateUser = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
      select: userSelect,
    });
    // 4.生成token
    const token = this.authService.generateToken({
      userId: updateUser.id,
      name: updateUser.name,
      email: updateUser.email,
    });
    return this.responseService.success({...updateUser, token});
  }
  
  async register(createUserDto: UserRegister) {
    const data: Prisma.UserCreateInput = {
      name: createUserDto.name,
      phone: createUserDto.phone,
      password: createUserDto.password,
      lastLoginAt: new Date(),
    }
    // 1.手机号已存在 
    const user = await this.prisma.user.findUnique({
      where: {
        phone: createUserDto.phone,
      },
    });
    if (user) {
      return this.responseService.error(null, '手机号已存在');
    }
    
    // 2.邮箱已存在
    if (createUserDto.email) {
      const emailExist = await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });
      if (emailExist) {
        return this.responseService.error(null, '邮箱已存在');
      }
      // 如果传了email 且邮箱不存在，添加到数据中
      data.email = createUserDto.email;
    }
    
    // 3.创建用户
    const newUser = await this.prisma.user.create({
      data,
      select: userSelect,
    });
    // 4.生成token
    const token = this.authService.generateToken({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
    return this.responseService.success({...newUser, token});
  }

  async refreshToken(createUserDto: Omit<Token, 'accessToken'>) {
    // 1. 检查refreshToken是否有效，jwt 的 verify检查token， sign 生成 token
    try {
      const decoded = this.jwtService.verify<RefreshTokenPayload>(createUserDto.refreshToken);
      if(decoded.tokenType !== 'refresh') {
        // 2. 如果不是refreshToken，返回错误
        return this.responseService.error(null, 'refreshToken已过期或无效');
      }
      const user = await this.prisma.user.findUnique({
        where: {
          id: decoded.userId,
        },
      });
      // 3. 如果用户不存在，返回错误 伪造的userId
      if (!user) {
        return this.responseService.error(null, '用户不存在');
      }
      // 4. 生成新的token
      const token = this.authService.generateToken({
        userId: user.id,
        name: user.name,
        email: user.email,
      });
      return this.responseService.success(token);
    } catch (error) {
      return this.responseService.error(null, 'refreshToken已过期或无效');
    }
  }

  // 上传头像
  async uploadAvatar(file: Express.Multer.File) {
    // 1. 检查文件是否为空
    if (!file) {
      return this.responseService.error(null, '文件为空');
    }
    // 文件大小不能超过 5MB
    if (file.size > 5 * 1024 * 1024) {
      return this.responseService.error(null, '文件大小不能超过 5MB');
    }
    // 获取 minio 客户端
    const minioClient = this.minioService.getClient();
    // 获取 bucket 名称
    const bucket = this.minioService.getBucket();
    // 资源名称
    const fileName = `${Date.now()}-${file.originalname}`;
    // 上传文件到 minio
    const minioObject = await minioClient.putObject(bucket, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype, // 文件类型
    });
    // 返回文件 url
    const isHttps = !!Number(this.configService.get('MINIO_USE_SSL')); // 是否使用 https
    const baseUrl = isHttps ? 'https' : 'http';  // 协议
    const port = this.configService.get<string>('MINIO_PORT'); // 端口
    const databaseUrl = `/${bucket}/${fileName}`; // 数据库 url /avatar/1634567890-1234567890.jpg
    const previewUrl = `${baseUrl}://${this.configService.get('MINIO_ENDPOINT')}:${port}${databaseUrl}`; // 预览 url
    // previewUrl 类似 http://192.168.1.10:9000/avatar/1634567890-1234567890.jpg
    return this.responseService.success({
      previewUrl,
      databaseUrl,
    });
  }

  // 更新用户信息
  async updateUser(updateUserDto: UserUpdate, user: TokenPayload) {
    const updateUser = await this.prisma.user.update({
      where: {
        id: user.userId
      },
      data: {
        name: updateUserDto.name,
        email: updateUserDto.email,
        address: updateUserDto.address,
        avatar: updateUserDto.avatar,
        bio: updateUserDto.bio,
        isTimingTask: updateUserDto.isTimingTask,
        timingTaskTime: updateUserDto.timingTaskTime,
      },
      select: updateUserSelect,
    });
    return this.responseService.success(updateUser);
  }
}
