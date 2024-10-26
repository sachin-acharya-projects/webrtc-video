import { RoomForm } from "@/components/room-form"
import { useSocket } from "@/context/useSocket"
import { SocketEventEnum } from "@/utils/SocketEventEnum"
import { FormEvent, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Home() {
    const socket = useSocket()
    const navigate = useNavigate()

    type HandleJoinRoomParams = {
        room: string
        email: string
    }
    const handleJoinRoom = useCallback(
        ({ room }: HandleJoinRoomParams) => {
            navigate(`/room/${room}`, {
                state: {
                    joined: true,
                },
            })
        },
        [navigate]
    )
    useEffect(() => {
        socket.on(SocketEventEnum.ROOM_JOIN, handleJoinRoom)
        return () => {
            socket.off(SocketEventEnum.ROOM_JOIN, handleJoinRoom)
        }
    }, [handleJoinRoom, socket])

    function handleFormSubmit(ev: FormEvent<HTMLFormElement>) {
        ev.preventDefault()
        const formData = new FormData(ev.currentTarget)

        socket.emit(SocketEventEnum.ROOM_JOIN, {
            email: formData.get("email"),
            room: formData.get("room"),
        })
    }

    return (
        <div className="h-screen flex justify-center items-center">
            <RoomForm onSubmit={handleFormSubmit} />
        </div>
    )
}
