import io from 'socket.io-client'
import mitt from 'mitt'
import { ElNotification } from 'element-plus'
export const socket = io()
export const emitter = mitt()

export function notify(title: string, message: string, type: 'info' | 'error' | 'success' | 'warning' = "info") {
    ElNotification({
        title,
        message,
        type,
        position: 'bottom-right'
    })
}
