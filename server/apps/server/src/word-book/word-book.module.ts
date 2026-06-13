import { Module } from '@nestjs/common';
import { WordBookService } from './word-book.service';
import { WorkBookController } from './word-book.controller';

@Module({
  controllers: [WorkBookController],
  providers: [WordBookService],
})
export class WordBookModule {}
