import { PropsWithChildren, useMemo } from "react"
import { io } from "socket.io-client"
import { SocketContext } from "@/context/useSocket"

const socket_host = import.meta.env.VITE_SOCKET_HOST
const socket_port = import.meta.env.VITE_SOCKET_PORT
// const socket_uri = `ws://${socket_host}:${socket_port}`
const socket_uri = `${socket_host}:${socket_port}`

export default function SocketProvider({ children }: PropsWithChildren) {
    const value = useMemo(() => io(socket_uri), [])

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    )
}
