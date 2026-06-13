import { uploadUrl } from '@/apis/index' // 上传文件地址
import defaultAvatar from '@/assets/images/avatar/default-avatar.png'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

export const useAvatar = () => {
  const userStore = useUserStore()
  const avatar = computed(() => {
    if(userStore.user?.avatar) { 
      return uploadUrl + userStore.user.avatar
    } else {
      return defaultAvatar
    }
  })
  const customAvatar = (avatar: string) => {
    if(avatar) { 
      return uploadUrl + avatar
    } else {
      return defaultAvatar
    }
  }
  return {
    avatar,
    customAvatar
  }
}