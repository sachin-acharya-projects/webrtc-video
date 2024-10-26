import { createContext, useContext } from "react"
import { Socket } from "socket.io-client"

export const SocketContext = createContext<Socket | null>(null)

export function useSocket() {
    const context = useContext(SocketContext)
    if (context === null)
        throw new Error(
            "`SocketContext` can only be used inside `SocketProvider`"
        )

    return context
}
