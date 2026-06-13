import { serverApi, type Response } from '../index'
import type { ResultLearn } from '@en/common/learn'
import type { Word } from '@en/common/word';

export const getWordList = (courseId: string) => serverApi.get(`/learn/word/${courseId}`) as Promise<Response<Word[]>>;

export const saveWordMasterApi = (wordIds: string[]) => serverApi.post(`/learn/word/master`, { wordIds }) as Promise<Response<ResultLearn>>;
