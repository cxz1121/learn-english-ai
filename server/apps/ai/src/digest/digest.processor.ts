import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { digestQueueName } from './digest.queue';
import { DigestService } from './digest.service';
import { EmailService } from '@libs/shared';

@Processor(digestQueueName.name)
export class DigestProcessor extends WorkerHost {
  constructor(private readonly digestService: DigestService, private readonly emailService: EmailService) {
    super();
  }
  async process(job: Job) {
    if(job.name === digestQueueName.task.emailDigest) {
      // 处理邮件任务
      const { email, text } = job.data;
      await this.emailService.sendEmail(email, '每日单词记忆报告', text);
      console.log('邮件发送成功', email);
    }
    if(job.name === digestQueueName.task.everydayDigest) {
      // 处理每日摘要任务
      await this.digestService.handleEmailDigest();
      console.log('每日摘要任务处理完成');
    }
  }
}