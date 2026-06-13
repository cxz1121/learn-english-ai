import { serverApi, type Response } from '../index'
import type { CourseList } from '@en/common/course'

export const getCourseList = () => serverApi.get('/course/list') as Promise<Response<CourseList>>;

export const getMyCourseList = () => serverApi.get(`/course/my`) as Promise<Response<CourseList>>;
