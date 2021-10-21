import io from 'socket.io-client'
import mitt from 'mitt'
import { ElNotification } from 'element-plus'

export const socket = io(import.meta.env.PROD ? "playcah.de:5000" : "localhost:5000")
export const emitter = mitt()

export function notify(title: string, message: string, type: 'info' | 'error' | 'success' | 'warning' = "info") {
    ElNotification({
        title,
        message,
        type,
        position: 'bottom-right'
    })
}