import { ref } from 'vue'
export interface VoiceToTextOptions {
  lang?: string // 语音识别语言
  continuous?: boolean // 是否连续识别 （默认 false）没有连续识别功能，只能识别一次语音 true 连续识别
  interimResults?: boolean // 是否返回中间结果 类似 sse 默认 false
  maxAlternatives?: number // 最大返回结果数 1 最大返回一个结果
}

let instance: SpeechRecognition | null = null

export const getInstance = (options: VoiceToTextOptions) => {
  const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!speechRecognition) {
    throw new Error('SpeechRecognition is not supported') // 浏览器不支持语音识别
  }
  if (!instance) {
    const { lang = 'zh-CN', continuous = false, interimResults = false, maxAlternatives = 1 } = options
    instance = new speechRecognition()
    instance.lang = lang
    instance.continuous = continuous
    instance.interimResults = interimResults
    instance.maxAlternatives = maxAlternatives
  }
  return instance
}

export const useVoiceToText = (options: VoiceToTextOptions) => {
  const recognition = getInstance(options)
  const isRecording = ref(false)
  recognition.onend = () => {
    isRecording.value = false
  }
  // 开启 语音识别
  const start = (callback?: (result: string) => void) => {
    isRecording.value = true
    recognition.start()
    recognition.onerror = (event) => {
      console.error('语音识别错误:', event)
    }
    recognition.onresult = (event) => {
      let fullText = ''
      for (let i = 0; i < event.results.length; i++) {
        fullText += event.results[i][0].transcript
      }
      console.log('语音识别结果:', fullText)
      callback?.(fullText)
    }
  }
  // 关闭 语音识别
  const stop = () => {
    isRecording.value = false
    recognition.stop()
  }
  return {
    isRecording,
    start,
    stop,
  }
}
