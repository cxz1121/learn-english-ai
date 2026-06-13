<template>
  <div v-if="isShow" class="fixed inset-0 w-full h-full z-40 bg-black opacity-30  blur-sm" />
  <Transition name="fade">
    <div v-if="isShow" class="fixed inset-0  shadow-lg z-50 p-30 pt-20">
      <div :class="wordList.length > 0 ? 'rounded-tr-[10px] rounded-tl-[10px]' : 'rounded-[10px]'"
        class="flex items-center gap-2 shadow-lg w-1/2 mx-auto p-3  bg-white ">
        <el-icon size="20">
          <Search />
        </el-icon>
        <input v-focus placeholder="搜索" type="text" v-model="search"
          class="w-full h-full text-sm border-none  rounded-lg p-2 focus:outline-none" />
      </div>
      <div v-if="wordList.length > 0" class="w-1/2 mx-auto max-h-[500px] border-t border-gray-200 overflow-y-auto">
        <div @click="copyWord(item.word)" v-for="item in wordList" :key="item.id"
          class="bg-white hover:bg-blue-50   text-gray-800 p-4 cursor-pointer shadow-sm hover:shadow-md ">
          <div class="text-sm font-semibold text-blue-600 mb-1">{{ item.word }}</div>
          <div v-html="item.translation" class="text-sm text-gray-700 mb-1 overflow-hidden line-clamp-2" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, customRef } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { Word } from '@en/common/word'
import { getWordBookList } from '@/apis/word-book'
import { ElMessage } from 'element-plus'
const wordList = ref<Word[]>([]) //搜索结果
const isShow = ref(false) //用来展示弹框的显示和隐藏的
let timer: ReturnType<typeof setTimeout> | null = null
const search = customRef((track, trigger) => {
  let value = '' //默认值
  return {
    get() {
      track() //告诉vue追踪value的值
      return value
    },
    set(newValue: string) {
      value = newValue
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        if(value) {
          getList()
        }
        trigger() //告诉vue触发value的值，从而触发依赖
      }, 500)
    }
  }
}) //搜索的一个值
const getList = async () => {
  const res = await getWordBookList({ word: search.value, page: 1, pageSize: 20 })
  if (res.success) {
    wordList.value = res.data.list
  }
}
const copyWord = (word: string) => {
  try {
    navigator.clipboard.writeText(word) //localhost  / https
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const previousScrollY = ref(0)
const previousBodyStyles: Record<string, string> = {
  position: '',
  top: '',
  left: '',
  right: '',
  width: '',
  paddingRight: '',
  overflow: ''
}
const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth

const openModal = () => {
  previousScrollY.value = window.scrollY || document.documentElement.scrollTop || 0
  // 保存原有内联样式
  previousBodyStyles.position = document.body.style.position || 'static'
  previousBodyStyles.top = document.body.style.top || ''
  previousBodyStyles.left = document.body.style.left || ''
  previousBodyStyles.right = document.body.style.right || ''
  previousBodyStyles.width = document.body.style.width || ''
  previousBodyStyles.paddingRight = document.body.style.paddingRight || ''
  previousBodyStyles.overflow = document.body.style.overflow || 'auto'

  const sbw = getScrollbarWidth()
  // 固定 body 并补偿滚动条宽度，防止页面水平位移/抖动
  document.body.style.position = 'fixed'
  document.body.style.top = `-${previousScrollY.value}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
  if (sbw > 0) document.body.style.paddingRight = `${sbw}px`
  document.body.style.overflow = 'hidden'

  isShow.value = true
}

const closeModal = () => {
  isShow.value = false
  search.value = ''
  wordList.value.length = 0
  // 恢复 body 原有样式并滚回原位置
  document.body.style.position = previousBodyStyles.position
  document.body.style.top = previousBodyStyles.top
  document.body.style.left = previousBodyStyles.left
  document.body.style.right = previousBodyStyles.right
  document.body.style.width = previousBodyStyles.width
  document.body.style.paddingRight = previousBodyStyles.paddingRight
  document.body.style.overflow = previousBodyStyles.overflow
  window.scrollTo(0, previousScrollY.value)
}

window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'f' && e.ctrlKey) {
    e.preventDefault()
    if (isShow.value) return
    openModal()
  }
  if (e.key === 'Escape') {
    if (!isShow.value) return
    closeModal()
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>