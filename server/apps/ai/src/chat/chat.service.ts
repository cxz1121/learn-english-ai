import { Injectable, OnModuleInit } from '@nestjs/common';
import { createDeepSeek, createCheckpoint, createBoChaSearch } from '../llm/llm.config';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import type { ChatRoleType, ChatDto } from '@en/common/chat'
import type { AIMessageChunk, ReactAgent } from 'langchain';
import { createAgent } from 'langchain';
import { chatMode } from '../prompt/prompt.mode';
import { ResponseService } from '@libs/shared';
@Injectable()
export class ChatService implements OnModuleInit {
  private checkpointer: PostgresSaver;
  // private agents: Map<ChatRoleType, ReactAgent> = new Map();
  constructor(private readonly responseService: ResponseService) { }
  async onModuleInit() {
    //1 初始化检查点
    this.checkpointer = await createCheckpoint(); // 幂等性 若数据库中没有表 会在数据库中创建表
    //2 创建多个agent
    // for (const mode of chatMode) {
    //   const agent = createAgent({
    //     model: createDeepSeek(), // 模型
    //     systemPrompt: mode.prompt, // 系统提示
    //     checkpointer: this.checkpointer, // 检查点
    //   });
    //   this.agents.set(mode.role, agent); // 存储agent
    // }
  }

  async streamCompletion(createChatDto: ChatDto) {
    const promptObj = chatMode.find(item => item.role === createChatDto.role)
    if (!promptObj) {
      throw new Error(`模型 ${createChatDto.role} 不存在`);
    }
    let prompt = promptObj.prompt // 拿到提示词
    // 如果开启联网搜索
    if (createChatDto.webSearch) {
      const webSearchPrompt = await createBoChaSearch(createChatDto.content)
      prompt += `请根据以下搜索结果回答问题：${webSearchPrompt}(并且返回你参考的网站名称)，用户问题：${createChatDto.content}`
    }
    // 模型 createDeepSeek() 深度思考 或 普通对话模型
    const model = createChatDto.deepThink ? createDeepSeek(true) : createDeepSeek()
    // 创建agent
    const agent = createAgent({
      model: model, // 模型
      systemPrompt: prompt, // 系统提示
      checkpointer: this.checkpointer, // 检查点
    });
    // 组装消息格式
    const id = `${createChatDto.userId}-${createChatDto.role}`
    const stream = agent.stream({
      messages: [{ role: 'human', content: createChatDto.content }],
    }, {
      configurable: { thread_id: id }, // 线程id 会话隔离 + 历史记录存储
      streamMode: 'messages' // 流式输出消息
    })
    return stream; // 返回一个可迭代对象 迭代器
  }

  async findAll(userId: string, role: ChatRoleType) {
    // 从检查点获取历史记录
    const messages = await this.checkpointer.get({
      configurable: { thread_id: `${userId}-${role}` },
    })
    const list = messages?.channel_values?.messages as AIMessageChunk[]
    if (!list) {
      return this.responseService.success([]) // 没有历史记录
    }
    return this.responseService.success(list.map(item => ({
      content: item.content,
      role: item.type,
      reasoning: item.additional_kwargs?.reasoning_content, // 深度思考的内容
    })))
  }
}
