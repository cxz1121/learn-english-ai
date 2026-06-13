import '@/assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus' // 引入 Element Plus
import 'element-plus/dist/index.css' // 引入 Element Plus 样式
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' // 引入 Pinia 插件
import zhCn from 'element-plus/es/locale/lang/zh-cn' // 引入 Element Plus 中文语言包
import focusPlugin from '@/directives/focus' // 引入自定义指令

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // 注册 Pinia 插件

app.use(focusPlugin) // 注册自定义指令
app.use(pinia) // 注册 Pinia
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(router)

app.mount('#app')
