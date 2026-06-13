import { serverApi, type Response } from '../index'
import type { AvatarResult, UserLogin, UserRegister, UserUpdate, WebResultUser } from '@en/common/user'

export const login = async (data: UserLogin) => {
  return serverApi.post('/user/login', data) as Promise<Response<WebResultUser>>
}

export const register = async (data: UserRegister) => {
  return serverApi.post('/user/register', data) as Promise<Response<WebResultUser>>
}

export const uploadAvatar = async (file: FormData) => {
  return serverApi.post('/user/upload-avatar', file) as Promise<Response<AvatarResult>>
}

export const updateUser = async (data: UserUpdate) => {
  return serverApi.post('/user/update-user', data) as Promise<Response<UserUpdate>>
}