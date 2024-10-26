import { usePeer } from "@/context/usePeer"
import { useSocket } from "@/context/useSocket"
import { SocketEventEnum } from "@/utils/SocketEventEnum"
import { useCallback, useEffect, useRef, useState } from "react"
import ReactPlayer from "react-player"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

// const Landscape_1 =
// "https://www.pexels.com/download/video/1583096/?fps=23.979999542236328&h=720&w=1366"
// const Landscape_2 =
//     "https://www.pexels.com/download/video/3210473/?fps=25.0&h=720&w=1280"

export default function Room() {
    const [remoteEmail, setRemoteEmail] = useState<string>()
    const [mediaStream, setMediaStream] = useState<MediaStream>()
    const buttonRef = useRef<HTMLButtonElement>(null)

    const socket = useSocket()
    const location = useLocation()
    const navigate = useNavigate()

    const { id: room_code } = useParams()
    const {
        peer,
        createAnswer,
        createOffer,
        sendStream,
        setRemoteAnswer,
        remoteStream,
    } = usePeer()

    useEffect(() => {
        if (!location.state?.joined) {
            toast.error("Please JOIN the room first.")
            navigate("/", {
                replace: true,
                state: {
                    redirect: location.pathname,
                },
            })
        }
    }, [location.pathname, location.state?.joined, navigate])

    // Accessing User Media Stream
    const getUserMediaStream = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })
        setMediaStream(stream)
    }, [])

    useEffect(() => {
        getUserMediaStream()
    }, [getUserMediaStream])

    // Handle User joined room
    type HandleUserJoinedRoom = {
        email: string
    }
    const handleUserJoinedRoom = useCallback(
        async ({ email }: HandleUserJoinedRoom) => {
            console.log(`New User '${email}' Joined the Room`)
            const offer = await createOffer()
            socket.emit(SocketEventEnum.CALL_USER, { offer, email })
            setRemoteEmail(email)
        },
        [createOffer, socket]
    )

    // Handle incomming call
    type HandleIncommingCall = {
        from: string
        offer: Awaited<ReturnType<typeof createOffer>>
    }
    const handleIncommingCall = useCallback(
        async ({ from, offer }: HandleIncommingCall) => {
            console.log(`Incomming call from ${from} with offer`, offer)
            const answer = await createAnswer(offer)
            socket.emit(SocketEventEnum.CALL_ACCEPT, {
                answer,
                email: from,
            })
            setRemoteEmail(from)
        },
        [createAnswer, socket]
    )
    // Handle Call Accepted Event
    type HandleCallAccepted = {
        answer: Awaited<ReturnType<typeof createAnswer>>
    }
    const handleCallAccepted = useCallback(
        async ({ answer }: HandleCallAccepted) => {
            console.log("Call has been accepted")
            await setRemoteAnswer(answer)
        },
        [setRemoteAnswer]
    )
    useEffect(() => {
        socket.on("user-joined", handleUserJoinedRoom)
        socket.on("incomming-call", handleIncommingCall)
        socket.on("call-accepted", handleCallAccepted)
        return () => {
            socket.removeListener("user-joined", handleUserJoinedRoom)
            socket.removeListener("incomming-call", handleIncommingCall)
            socket.removeListener("call-accepted", handleCallAccepted)
        }
    }, [handleCallAccepted, handleIncommingCall, handleUserJoinedRoom, socket])

    // Handle Negoriation Need
    const handlePeerNegotiation = useCallback(async () => {
        console.log(`Negotiating with ${remoteEmail}`)
        const localOffer = peer.localDescription

        socket.emit(SocketEventEnum.CALL_USER, {
            email: remoteEmail,
            offer: localOffer,
        })
    }, [peer.localDescription, remoteEmail, socket])
    useEffect(() => {
        peer.addEventListener("negotiationneeded", handlePeerNegotiation)

        return () => {
            peer.removeEventListener("negotiationneeded", handlePeerNegotiation)
        }
    }, [handlePeerNegotiation, peer])

    function handleSendVideo() {
        if (mediaStream) {
            sendStream(mediaStream)
            if (buttonRef.current) buttonRef.current.style.display = "none"
        }
    }

    return (
        <div className="h-screen relative">
            <div className="h-full relative">
                <div className="absolute w-full bg-black/60 p-4 blurry-back flex justify-center font-bold">
                    <h4>Room {room_code} | acharyaraj71@gmail.com</h4>
                </div>
                <ReactPlayer
                    width={"100%"}
                    height={"100%"}
                    url={remoteStream}
                    playing
                    muted
                    loop
                />
            </div>
            <div className="absolute right-4 bottom-4 max-w-[200px] max-h-[200px]">
                <ReactPlayer
                    height={"100%"}
                    width={"100%"}
                    url={mediaStream}
                    playing
                    muted
                    loop
                />
            </div>
            <button
                ref={buttonRef}
                onClick={handleSendVideo}
                className="absolute top-4 left-[50%] translate-x-[-50%] bg-slate-900 p-2 rounded-md active:scale-90 outline-none border-none"
            >
                Send Video
            </button>
        </div>
    )
}
