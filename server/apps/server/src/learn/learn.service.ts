import { Injectable } from '@nestjs/common';
import { PrismaService, ResponseService } from '@libs/shared';

@Injectable()
export class LearnService {
  constructor(private readonly prismaService: PrismaService, private readonly responseService: ResponseService) {}
  // 保存单词到 wordBookRecord
  async saveWordMaster(wordIds: string[], userId: string) {
    const wordBookRecords = wordIds.map((wordId) => ({
      wordId: wordId, // 单词id
      userId: userId, // 用户id
      isMaster: true, // 是否掌握
    }));
    await this.prismaService.wordBookRecord.createMany({
      data: wordBookRecords,
    });
    // 更新用户掌握的单词数量
    const user = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        wordNumber: {
          increment: wordIds.length, // 增加掌握的单词数量
        },
      }
    });
    return this.responseService.success({
      wordNumber: user.wordNumber, // 更新后的单词数量
    });
  }
  // 获取单词列表
  async getWordList(courseId: string, userId: string) {
    // 1.如果用户没有购买该课程，非法请求
    const courseRecord = await this.prismaService.courseRecord.findFirst({
      where: {
        courseId: courseId,
        userId: userId,
        isPurchased: true,
      },
      include: {
        course: true,
      }
    });
    if (!courseRecord) {
      return this.responseService.error(null, '非法请求或用户没有购买该课程');
    }
    // 2.如果用户购买了该课程，返回该课程的单词列表
    const courseType = courseRecord.course.value; // gk zk
    const words = await this.prismaService.wordBook.findMany({
      where: {
        [courseType]: true, // gk: true
        wordBookRecords: { // 掌握的单词不返回
          none: {
            userId: userId,
          }
        }
      },
      skip: 0, // 跳过0条
      take: 10, // 取10条
      orderBy: {
        frq: 'desc', // 按频率排序
      }
    })
    return this.responseService.success(words);
  }
}
