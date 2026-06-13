import { aiApi, type Response } from '../index';
import type { ChatModeList, ChatRoleType, ChatMessageList } from '@en/common/chat';

// 获取聊天模式列表
export const getChatMode = () => aiApi.get('/prompt/list') as Promise<Response<ChatModeList>>;

// 获取聊天历史记录
export const getChatHistory = (userId: string, role: ChatRoleType) => aiApi.get(`/chat/history?userId=${userId}&role=${role}`) as Promise<Response<ChatMessageList>>;