import { RoomForm } from "@/components/room-form"
import { useSocket } from "@/context/useSocket"
import { SocketEventEnum } from "@/utils/SocketEventEnum"
import { FormEvent, useCallback, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export default function Home() {
    const socket = useSocket()
    const location = useLocation()
    const navigate = useNavigate()

    type HandleJoinRoomParams = {
        room_code: string
    }
    const handleJoinRoom = useCallback(
        ({ room_code }: HandleJoinRoomParams) => {
            if (location.state?.redirect) {
                navigate(location.state?.redirect, {
                    state: {
                        joined: true,
                    },
                })
            }
            navigate(`/room/${room_code}`, {
                state: {
                    joined: true,
                },
            })
        },
        [location.state?.redirect, navigate]
    )
    useEffect(() => {
        socket.on(SocketEventEnum.JOINED_ROOM, handleJoinRoom)
        return () => {
            socket.off(SocketEventEnum.JOINED_ROOM, handleJoinRoom)
        }
    }, [handleJoinRoom, socket])

    function handleFormSubmit(ev: FormEvent<HTMLFormElement>) {
        ev.preventDefault()
        const formData = new FormData(ev.currentTarget)

        socket.emit(SocketEventEnum.JOIN_ROOM, {
            email: formData.get("email"),
            room_code: formData.get("room_code"),
        })
    }

    return (
        <div className="h-screen flex justify-center items-center">
            <RoomForm onSubmit={handleFormSubmit} />
        </div>
    )
}
