import {Server, Socket} from "socket.io"
import {createServer} from 'http'
// import { House } from "./house"

const server = createServer()
const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

server.listen(3001, () => {
    console.log("listening on *:3001")
})

// const house = new House()

// io.on('connection', (socket: Socket) => {
//     console.log("connected ", socket.id)
    
//     socket.on('join', (name, lobby) => {
    
//         const game = house.getGame(lobby)
//         const disconnectedPlayer = game.getDisconnectedPlayer(socket.id)
//     })
// })