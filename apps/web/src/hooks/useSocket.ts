import { io, type Socket } from 'socket.io-client'
import { socketUrl } from '@/apis'
import { useUserStore } from '@/stores/user'
let socket: Socket | null = null
export const useSocket = () => {
  const userStore = useUserStore()
  // 连接 socket 服务器
  const connect = () => {
    const userId = userStore.user?.id
    if(!userId) return // 没有用户id 不连接
    if(socket) return // 已连接 不重复连接
    socket = io(socketUrl, {
      transports: ['websocket'], // 只使用 websocket 传输
      autoConnect: true, // 自动连接
      reconnection: true, // 自动重连
      reconnectionAttempts: 5, // 重连次数
      reconnectionDelay: 1000, // 重连时间 1秒
      reconnectionDelayMax: 5000, // 最大重连时间 5秒
      timeout: 20000, // 超时时间 20秒
      query: { userId },
    })
    //为了threeShaking
    // 热更新时 保持 socket 实例不被销毁
    if(import.meta.hot) {
      import.meta.hot.data.socket = socket
    }
  }
  // 断开连接
  const disconnect = () => {
    if(socket) {
      socket.disconnect() // 断开连接
      socket.removeAllListeners() // 移除所有事件监听器
      socket = null // 重置 socket 实例
      if(import.meta.hot){
        import.meta.hot.data.socket = null;
      }
    }
  }
  // 获取 socket 实例
  const getSocket = (): Socket | null => {
    if(socket) {
      return socket
    }
    if(import.meta.hot){
      return import.meta.hot.data.socket
    }
    return null
  }
  return { connect, disconnect, getSocket }
}
