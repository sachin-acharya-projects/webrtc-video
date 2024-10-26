import express from "express"
import http from "http"
import * as socket from "socket.io"
import cors from "cors"

import { SocketEventEnum_ as SocketEventEnum } from "./utils/SocketEventEnum"

const app = express()
const server = http.createServer()
const io = new socket.Server(server, {
    cors: {
        origin: "*",
    },
})

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(
    cors({
        origin: "*",
    })
)

type TypeMap = Map<string, string>
const emailToSocketMapping: TypeMap = new Map()
const socketToEmailMapping: TypeMap = new Map()
// Socket Handling
io.on("connection", (socket) => {
    console.log("New Connection Established")

    type HandleJoinRoomType = {
        email: string
        room_code: string
    }

    // Handling Event when User want to join the room
    socket.on(
        SocketEventEnum.JOIN_ROOM,
        ({ email, room_code }: HandleJoinRoomType) => {
            console.log(`User '${email}' connected room '${room_code}'`)
            emailToSocketMapping.set(email, socket.id)
            socketToEmailMapping.set(socket.id, email)

            socket.join(room_code)
            socket.emit(SocketEventEnum.JOINED_ROOM, {
                room_code,
            })
            socket.broadcast
                .to(room_code)
                .emit(SocketEventEnum.USER_JOINED, { email })
        }
    )
    
    // Handle Event when User initiates Call
    type HandleCallUserType = {
        offer: RTCSessionDescriptionInit
        email: string
    }
    socket.on(
        SocketEventEnum.CALL_USER,
        ({ email, offer }: HandleCallUserType) => {
            const socket_id = emailToSocketMapping.get(email)
            const from = socketToEmailMapping.get(socket.id)
            if (!socket_id || !from) {
                return
            }
            console.log(`Requesting call from ${from} to ${email}`)
            console.log(
                emailToSocketMapping,
                socketToEmailMapping,
                socket_id,
                from,
                email
            )

            // socket.to(socket_id).emit(SocketEventEnum.FLUSH)
            socket
                .to(socket_id)
                .emit(SocketEventEnum.INCOMMING_CALL, { from, offer })
        }
    )
    
    // Handle Event when User Accept Call
    type HandleCallAcceptType = {
        email: string
        answer: RTCSessionDescriptionInit
    }
    socket.on(
        SocketEventEnum.CALL_ACCEPT,
        ({ answer, email }: HandleCallAcceptType) => {
            console.log("Call has been accepted.")
            const socket_id = emailToSocketMapping.get(email)
            if (!socket_id) return
            // socket.to(socket_id).emit(SocketEventEnum.FLUSH)
            socket.to(socket_id).emit(SocketEventEnum.CALL_ACCEPTED, { answer })
        }
    )
})

const IP = process.env.IP || "localhost"
const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.group("Server is Listening on")
    console.log()
    console.log(`   http://${IP}:${PORT}`)
    console.log(`   ws://${IP}:${PORT}`)
    console.log()
    console.groupEnd()
})
