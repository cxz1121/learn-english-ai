import axios from 'axios'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import { refreshTokenApi } from './auth'
import { ElMessage } from 'element-plus'
export const uploadUrl = import.meta.env.DEV ? 'http://192.168.1.3:9000' : '线上地址待定'
export const socketUrl = import.meta.env.DEV ? 'http://localhost:3000' : '线上地址待定'
export const timeout = 50000
export const serverApi = axios.create({
  baseURL: '/api/v1',
  timeout,
})

let isRefreshing = false // 是否正在刷新 token
let requestQueue: ((newAccessToken: string) => void)[] = [] // 失败的请求队列

// 请求拦截器
serverApi.interceptors.request.use(config => {
  const userStore = useUserStore()
  if (userStore.getAccessToken) {
    config.headers.Authorization = `Bearer ${userStore.getAccessToken}`
  }
  return config
})

// 响应拦截器
serverApi.interceptors.response.use(res => {
  return res.data
} , async err => {
  if (err.code === 'ERR_NETWORK') {
    ElMessage.error('网络连接失败,请重试')
    return Promise.reject(err)
  }
  // 不是 401 错误，直接返回错误
  if (err.response.status !== 401) {
    ElMessage.error('服务器异常,请稍后再试')
    return Promise.reject(err)
  }

  // 处理 401 错误，刷新令牌
  const userStore = useUserStore()
  const accessToken = userStore.getAccessToken
  const refreshToken = userStore.getRefreshToken
  const originalRequest = err.config
  if(!accessToken || !refreshToken) {
    userStore.logout() // 清除用户信息
    router.push('/') // 跳转到首页
    ElMessage.error('登录已过期,请重新登录')
    return Promise.reject(err) // 返回错误
  }
  // 如果正在刷新 token，将请求加入队列，等待刷新完成
  if(isRefreshing) {
    return new Promise((resolve) => {
      requestQueue.push((newAccessToken: string) => {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        resolve(serverApi(originalRequest))
      })
    })
  }
  // 刷新 token 
  isRefreshing = true
  try {
    const newToken = await refreshTokenApi({ refreshToken })
    if(newToken.success) {
      // 刷新成功，更新 token
      userStore.updateToken(newToken.data)
    } else {
      userStore.logout() // 清除用户信息
      router.push('/') // 跳转到首页
      ElMessage.error('登录已过期,请重新登录')
      return Promise.reject(err) // 返回错误
    }
    // 刷新成功，更新 token 并重试失败的请求
    const newAccessToken = newToken.data.accessToken
    requestQueue.forEach(callback => callback(newAccessToken)) // 重试失败的请求
    return serverApi(originalRequest)
  } catch (error) {
    return Promise.reject(error)
  } finally {
    requestQueue = [] // 清空队列
    isRefreshing = false // 刷新完成
  }
})

export const aiApi = axios.create({
  baseURL: '/ai/v1',
  timeout,
})

aiApi.interceptors.response.use(res => {
  return res.data
})

export interface Response<T = any> {
  timestamp: string,
  path: string,
  message: string,
  code: number,
  success: boolean,
  data: T
}