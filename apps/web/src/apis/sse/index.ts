import { fetchEventSource } from '@microsoft/fetch-event-source'
import type { Method } from 'axios'
export const CHAT_URL = '/ai/v1/chat'

export const sse = <T, V = any>(url: string, method: Method = 'POST', body: V, callback?: (data: T) => void, onError?: (error: Error) => void) => {
  return fetchEventSource(url, {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    onmessage: (event) => {
      callback?.(JSON.parse(event.data) as T)
    },
    onerror: (error) => {
      onError?.(error)
    },
  })
}
