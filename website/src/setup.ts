import io from 'socket.io-client'
import mitt from 'mitt'

export const socket = io("http://localhost:3001")
export const emitter = mitt()