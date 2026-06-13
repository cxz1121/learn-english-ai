import { ChatDeepSeek } from "@langchain/deepseek";
import { ConfigService } from "@nestjs/config";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
// 初始化deepseek
export const createDeepSeek = (reasoning: boolean = false) => {
  const configService = new ConfigService()
  return new ChatDeepSeek({
    apiKey: configService.get<string>('DEEPSEEK_API_KEY'),
    model: configService.get<string>('DEEPSEEK_API_MODEL'),
    temperature: 1.3, // 温度
    maxTokens: reasoning ? 18000 : 4396, // 最大token数
    streaming: true, // 是否开启流式输出
    modelKwargs: {
      thinking: {
        type: reasoning ? 'enabled' : 'disabled',
      }
    }
  })
}

// 初始化checkpoint
export const createCheckpoint = async () => {
  const configService = new ConfigService()
  const databaseUrl = configService.get<string>('AI_DATABASE_URL')!
  const checkpointer = PostgresSaver.fromConnString(databaseUrl);
  await checkpointer.setup();
  return checkpointer;
}

// 初始化博查api
export const createBoChaSearch = async (query: string, count: number = 10) => {
  const configService = new ConfigService()
  const result = await fetch(`${configService.get<string>('BOCHA_SEARCH_URL')}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${configService.get<string>('BOCHA_API_KEY')}`,
    },
    body: JSON.stringify({
      query, // 查询内容
      count, // 返回结果数量
      summary: true, // 是否返回摘要
    }),
  })
  const { data } =  await result.json()
  const values = data.webPages.value;
  const prompt:string = values.map(item => `
    标题：${item.name}
    链接：${item.url}
    摘要：${item.summary?.replace(/\n/g, '') ?? ''}
    网站名称：${item.siteName}
    发布时间：${item.dateLastCrawled}
  `).join('\n')
  return prompt
}
