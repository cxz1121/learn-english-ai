import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Token, UserUpdate, WebResultUser } from '@en/common/user'
export const useUserStore = defineStore('user', () => {
  const user = ref<WebResultUser | null>(null)
  const setUser = (u: WebResultUser) => {
    user.value = u
  }
  // 访问令牌
  const getAccessToken = computed(() => user.value?.token.accessToken)
  // 刷新令牌
  const getRefreshToken = computed(() => user.value?.token.refreshToken)
  // 更新token
  const updateToken = (newToken: Token) => {
    user.value!.token = newToken
  }
  // 更新用户已学单词数量
  const updateWordNumber = (count: number) => {
    user.value!.wordNumber = count
  }
  // 在设置界面点击保存之后，更新用户信息
  const updateUser = (params: UserUpdate) => {
    user.value!.name = params.name
    user.value!.email = params.email
    user.value!.address = params.address
    user.value!.avatar = params.avatar
    user.value!.bio = params.bio
    user.value!.isTimingTask = params.isTimingTask
    user.value!.timingTaskTime = params.timingTaskTime
  }
  // 在设置界面默认获取的用户信息，用于填充表单数据
  const getUserUpdateInfo = computed<UserUpdate>(() => {
    return {
      name: user.value!.name,
      email: user.value!.email,
      address: user.value!.address,
      avatar: user.value!.avatar,
      bio: user.value!.bio,
      isTimingTask: user.value!.isTimingTask,
      timingTaskTime: user.value!.timingTaskTime,
    }
  })
  const userInfo = computed(() => user.value)
  const logout = () => {
    user.value = null
  }
  return { user, setUser, userInfo, logout, getAccessToken, getRefreshToken, updateToken, updateUser, getUserUpdateInfo, updateWordNumber }
}, {
  persist: true, // 持久化存储
})
