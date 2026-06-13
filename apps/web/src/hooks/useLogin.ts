import { IS_SHOW_LOGIN } from '@/components/Login/type'
import { inject, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import router from '@/router'
export const useLogin = () => {
  const isShowLogin = inject(IS_SHOW_LOGIN, ref(false))
  const userStore = useUserStore()
  const showLogin = () => {
    // if(userStore.userInfo) {
    //   return
    // }
    // isShowLogin.value = true
    return new Promise((resolve, reject) => {
      if(userStore.userInfo) {
        resolve(true)
      } else {
        isShowLogin.value = true
        reject(false)
      }
    })
  }
  const hideLogin = () => {
    isShowLogin.value = false
  }
  const logout = () => {
    userStore.logout()
    router.push('/')
  }
  return {
    showLogin,
    hideLogin,
    logout
  }
}
