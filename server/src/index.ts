import cors from "cors"
import express from "express"
import http from "http"
import { Server } from "socket.io"

import { SocketEventEnum } from "./utils/SocketEventEnum"

const app = express()
const server = http.createServer()
const io = new Server(server, {
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

    // Handling when User joins the room
    socket.on(SocketEventEnum.ROOM_JOIN, ({ email, room }) => {
        console.log(`User '${email}' connected room '${room}'`)
        emailToSocketMapping.set(email, socket.id)
        socketToEmailMapping.set(socket.id, email)

        io.to(room).emit(SocketEventEnum.USER_JOINED, {
            email,
            id: socket.id,
        })
        socket.join(room)
        io.to(socket.id).emit(SocketEventEnum.ROOM_JOIN, {
            email,
            room,
        })
    })

    // Handle when User initiates call
    socket.on(SocketEventEnum.USER_CALL, ({ to, offer }) => {
        console.log(`Calling ${to}`)
        io.to(to).emit(SocketEventEnum.INCOMMING_CALL, {
            from: socket.id,
            offer,
        })
    })

    // Handle when companion accepts the call
    socket.on(SocketEventEnum.CALL_ACCEPTED, ({ to, answer }) => {
        console.log("Call has been accepted")
        io.to(to).emit(SocketEventEnum.CALL_ACCEPTED, {
            from: socket.id,
            answer,
        })
    })

    // Handle when RTC Negotiation requires
    socket.on(SocketEventEnum.PEER_NEGOTIATION_NEEDED, ({ to, offer }) => {
        console.log("Negotiation is Required")
        io.to(to).emit(SocketEventEnum.PEER_NEGOTIATION_NEEDED, {
            from: socket.id,
            offer,
        })
    })

    // Handle when RTC Negotiation is done
    socket.on(SocketEventEnum.PEER_NEGOTIATION_DONE, ({ to, answer }) => {
        console.log("Negotiation is Complete")
        io.to(to).emit(SocketEventEnum.PEER_NEGOTIATION_FINAL, {
            from: socket.id,
            answer,
        })
    })
})

const IP = process.env.IP || "localhost"
const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log("Server is Listening on")
    console.log()
    console.log(`   http://${IP}:${PORT}`)
    console.log(`   ws://${IP}:${PORT}`)
    console.log()
})
