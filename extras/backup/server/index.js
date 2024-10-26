/**
 * @author Sachin Acharya
 */
import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"

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

/**
 * @typedef TypeMap
 * @type {Map<string, string>}
 */
/**
 * @type {TypeMap}
 */
const emailToSocketMapping = new Map()
/**
 * @type {TypeMap}
 */
const socketToEmailMapping = new Map()

io.on("connection", (socket) => {
    console.log("New Connection Established.")
    socket.on("join-room", (data) => {
        const { room_code, email } = data
        console.log(`User ${email} joined room ${room_code}.`)
        emailToSocketMapping.set(email, socket.id)
        socketToEmailMapping.set(socket.id, email)

        socket.join(room_code)
        socket.emit("joined-room", {
            room_code,
        })
        socket.broadcast.to(room_code).emit("user-joined", { email })
    })

    socket.on("call-user", ({ offer, email }) => {
        console.log(`Requesting Calling User ${email}`)
        const socket_id = emailToSocketMapping.get(email)
        const from = socketToEmailMapping.get(socket.id)
        console.log(emailToSocketMapping, socketToEmailMapping, socket_id, from)

        socket.to(socket_id).emit("flush")
        socket.to(socket_id).emit("incomming-call", { from, offer })
    })

    socket.on("call-accept", ({ email, answer }) => {
        console.log("Call Accepted with Answer")
        const socket_id = emailToSocketMapping.get(email)

        socket.to(socket_id).emit("flush")
        socket.to(socket_id).emit("call-accepted", {
            answer,
        })
    })
})

const IP = process.env.IP || "localhost"
const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log(`Server is listening at http://${IP}:${PORT}`)
})
