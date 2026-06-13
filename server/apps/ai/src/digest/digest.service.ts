import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
import dayjs from 'dayjs';
import { tool } from '@langchain/core/tools';
import { createAgent } from 'langchain';
import { createDeepSeek } from '../llm/llm.config';
import marked from 'marked';
import { Queue } from 'bullmq'; // 类型
import { digestQueueName } from './digest.queue';
import { InjectQueue } from '@nestjs/bullmq';
@Injectable()
export class DigestService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue(digestQueueName.name) private readonly digestQueue: Queue,
  ) {}

  queryTool() {
    return tool(async ({ userId }: { userId: string }) => {
      const user = await this.prismaService.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          name: true,
          email: true,
          wordNumber: true,
          wordBookRecords: {
            where: {
              createdAt: {
                gte: dayjs().startOf('day').toDate(), // >=今天00:00:00
                lte: dayjs().add(1, 'day').startOf('day').toDate(), // <=明天00:00:00
              }
            },
            select: {
              word: {
                select: {
                  word: true
                }
              }
            }
          },
        }
      });
      return user;
    }, {
      name: 'queryTool', // 工具名称 语义化
      description: '根据用户ID查询用户的单词学习记录', // 工具描述
      schema: {
        type:'object',
        properties: {
          userId: { description: '用户ID', type: 'string' }
        },
        required: ['userId'],
      }
    });
  }

  async onModuleInit() {
    this.digestQueue.add(digestQueueName.task.everydayDigest, {}, {
      repeat: {
        pattern: '0 0 * * *', // 每天0点执行一次 cron表达式
      }
    })
  }

  async handleEmailDigest() {
    console.log('定时任务开始处理');
    //1.筛选高质量用户(打开定时任务 + 定时任务有时间 + 今天学过的单词 + 邮箱不为空)
    const userIds = await this.prismaService.user.findMany({
      where: {
        isTimingTask: true,
        timingTaskTime: { not: '' },
        email: { not: null },
        wordBookRecords: {
          some: {
            createdAt: {
              gte: dayjs().startOf('day').toDate(), // >=今天00:00:00
              lte: dayjs().add(1, 'day').startOf('day').toDate(), // <=明天00:00:00
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        timingTaskTime: true,
      }
    });
    for (const user of userIds) {
      const agent = createAgent({
        model: createDeepSeek(),
        tools: [this.queryTool()],
        systemPrompt: '你是一个单词记忆助手，根据用户信息和单词记录，生成单词记忆报告',
      });
      const result = await agent.invoke({
        messages: [{ role: 'user', content: `查询用户信息,并且根据用户id关联单词记录表，查询出用户今天的单词记录,用户id: ${user.id}，过滤掉敏感信息` }]
      })
      const content = result.messages.at(-1)?.content;
      if(content) {
        const html = marked.parse(content as string);
        const [hour, minute, second] = user.timingTaskTime.split(':').map(Number);
        const targetTime = dayjs().startOf('day').set('hour', hour).set('minute', minute).set('second', second);
        let delay = targetTime.diff(dayjs());
        if(delay < 0) {
          delay = 0;
        }
        console.log('delay', delay);
        this.digestQueue.add(digestQueueName.task.emailDigest, {
          userId: user.id,
          email: user.email,
          text: html,
        }, {
          delay: delay,
        })
      }
    }
  }
}
