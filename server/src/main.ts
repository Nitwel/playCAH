import {Server} from "socket.io"
import {createServer} from 'http'

const server = createServer()
const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

io.on('connection', (socket) => {
    console.log("connected")
})

server.listen(3001, () => {
    console.log("listening on *:3001")
})