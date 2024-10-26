import { useCallback, useEffect, useState } from "react"
import ReactPlayer from "react-player"
import { PhoneCall, PhoneOff, Send, Share2 } from "lucide-react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { SocketEventEnum } from "@/utils/SocketEventEnum"
import { useSocket } from "@/context/useSocket"
import peer from "@/service/peer"

export default function Room() {
    const [remoteSocketID, setRemoteSocketID] = useState<string | null>(null)
    const [localStream, setLocalStream] = useState<MediaStream>()
    const [remoteStream, setRemoteStream] = useState<MediaStream>()

    const socket = useSocket()

    const { id: roomID } = useParams()

    // Handle Call User
    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })
        const offer = await peer.getOffer()
        socket.emit(SocketEventEnum.USER_CALL, { to: remoteSocketID, offer })
        setLocalStream(stream)
    }, [remoteSocketID, socket])

    // Handle User joined room
    type HandleUserJoinedRoom = {
        email: string
        id: string
    }
    const handleUserJoined = useCallback(
        ({ email, id }: HandleUserJoinedRoom) => {
            console.log(`New User '${email}' Joined the Room`)
            setRemoteSocketID(id)
        },
        []
    )

    // Handle incomming call
    type HandleIncommingCall = {
        from: string
        offer: RTCSessionDescriptionInit
    }
    const handleIncommingCall = useCallback(
        async ({ from, offer }: HandleIncommingCall) => {
            console.log(`Incomming call from ${from} with offer`, offer)
            setRemoteSocketID(from)

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            })
            setLocalStream(stream)

            const answer = await peer.getAnswer(offer)
            socket.emit(SocketEventEnum.CALL_ACCEPTED, {
                to: from,
                answer,
            })
        },
        [socket]
    )

    // Sending Local Stream
    const sendStreams = useCallback(() => {
        if (localStream && peer.peer) {
            for (const track of localStream.getTracks()) {
                const senderExists = peer.peer
                    .getSenders()
                    .some((sender) => sender.track === track)
                if (!senderExists) peer.peer.addTrack(track, localStream)
                //? else: Sender already exsists for this track
            }
        }
    }, [localStream])

    // Handle Call Accepted Event
    type HandleCallAccepted = {
        answer: RTCSessionDescriptionInit
    }
    const handleCallAccepted = useCallback(
        ({ answer }: HandleCallAccepted) => {
            console.log("Call has been accepted")
            peer.setLocalDescription(answer)
            sendStreams()
        },
        [sendStreams]
    )

    // Handle Negotiation Needed for Incomming Call
    type HandleNegotiationIncomming = {
        from: string
        offer: RTCSessionDescriptionInit
    }
    const handleNegotiationNeedIncomming = useCallback(
        async ({ from, offer }: HandleNegotiationIncomming) => {
            const answer = await peer.getAnswer(offer)
            socket.emit(SocketEventEnum.PEER_NEGOTIATION_DONE, {
                to: from,
                answer,
            })
        },
        [socket]
    )

    // Negotiation Finilization
    type HandleNegotiationFinal = {
        answer: RTCSessionDescriptionInit
    }
    const handleNegotiationNeedFinal = useCallback(
        async ({ answer }: HandleNegotiationFinal) => {
            await peer.setLocalDescription(answer)
        },
        []
    )

    useEffect(() => {
        socket.on(SocketEventEnum.USER_JOINED, handleUserJoined)
        socket.on(SocketEventEnum.INCOMMING_CALL, handleIncommingCall)
        socket.on(SocketEventEnum.CALL_ACCEPTED, handleCallAccepted)
        socket.on(
            SocketEventEnum.PEER_NEGOTIATION_NEEDED,
            handleNegotiationNeedIncomming
        )
        socket.on(
            SocketEventEnum.PEER_NEGOTIATION_FINAL,
            handleNegotiationNeedFinal
        )

        return () => {
            socket.off(SocketEventEnum.USER_JOINED, handleUserJoined)
            socket.off(SocketEventEnum.INCOMMING_CALL, handleIncommingCall)
            socket.off(SocketEventEnum.CALL_ACCEPTED, handleCallAccepted)
            socket.off(
                SocketEventEnum.PEER_NEGOTIATION_NEEDED,
                handleNegotiationNeedIncomming
            )
            socket.off(
                SocketEventEnum.PEER_NEGOTIATION_FINAL,
                handleNegotiationNeedFinal
            )
        }
    }, [
        handleCallAccepted,
        handleIncommingCall,
        handleNegotiationNeedFinal,
        handleNegotiationNeedIncomming,
        handleUserJoined,
        socket,
    ])

    // Handle Negotiation Needed
    const handleNegotiationNeeded = useCallback(async () => {
        const offer = await peer.getOffer()
        socket.emit(SocketEventEnum.PEER_NEGOTIATION_NEEDED, {
            offer,
            to: remoteSocketID,
        })
    }, [remoteSocketID, socket])

    useEffect(() => {
        if (peer.peer)
            peer.peer.addEventListener(
                "negotiationneeded",
                handleNegotiationNeeded
            )
        return () => {
            if (peer.peer)
                peer.peer.removeEventListener(
                    "negotiationneeded",
                    handleNegotiationNeeded
                )
        }
    }, [handleNegotiationNeeded])

    useEffect(() => {
        if (peer.peer)
            peer.peer.addEventListener("track", async (ev) => {
                const remoteStream = ev.streams
                console.log("New Track Retrived")
                setRemoteStream(remoteStream[0])
            })
    }, [])

    // const handleGetUserMedia = useCallback(async () => {
    //     const stream = await navigator.mediaDevices.getUserMedia({
    //         audio: true,
    //         video: true,
    //     })
    //     setLocalStream(stream)
    // }, [])

    // useEffect(() => {
    //     handleGetUserMedia()
    // }, [handleGetUserMedia])

    // return (
    //     <div className="h-screen relative">
    //         <h3>{remoteSocketID ? "Connected" : "No one in room"}</h3>
    //         <div className="h-full relative">
    //             <div
    //                 className="absolute w-full bg-black/60 p-4 blurry-back flex justify-center font-bold"
    //                 hidden={!remoteStream}
    //             >
    //                 <h4>Room {roomID} | acharyaraj71@gmail.com</h4>
    //             </div>
    //             <ReactPlayer
    //                 width={"100%"}
    //                 height={"100%"}
    //                 url={remoteStream}
    //                 playing
    //                 muted
    //                 loop
    //             />
    //         </div>
    //         <div
    //             className="absolute right-4 bottom-4 max-w-[200px] max-h-[200px]"
    //             hidden={!localStream}
    //         >
    //             <ReactPlayer
    //                 height={"100%"}
    //                 width={"100%"}
    //                 url={localStream}
    //                 playing
    //                 muted
    //                 loop
    //             />
    //         </div>
    //         <div className="flex gap-2 absolute bottom-4 left-[50%] bg-white/10 blurry-back rounded-md p-2">
    //             <button
    //                 ref={sendVideoButtonRef}
    //                 onClick={sendStreams}
    //                 className="bg-slate-900 p-2 rounded-md active:scale-90 outline-none border-none"
    //                 // hidden={!localStream}
    //             >
    //                 <Send />
    //             </button>

    //             <button
    //                 ref={callButtonRef}
    //                 onClick={handleCallUser}
    //                 className="bg-slate-900 p-2 rounded-md active:scale-90 outline-none border-none"
    //                 // hidden={!remoteSocketID}
    //             >
    //                 <PhoneCall />
    //             </button>

    //             <button
    //                 ref={callButtonRef}
    //                 onClick={handleCallUser}
    //                 className="bg-red-900 p-2 rounded-md active:scale-90 outline-none border-none"
    //                 // hidden={!remoteSocketID}
    //             >
    //                 <PhoneOff />
    //             </button>
    //         </div>
    //     </div>
    // )
    function handleCopyToClip() {
        if (roomID) {
            navigator.clipboard.writeText(roomID.toString())
            toast.success("ROOM ID has been Copied")
        }
    }
    return (
        <div className={`h-screen relative`}>
            <div
                className={`flex justify-center items-center flex-col ${
                    remoteSocketID
                        ? "absolute z-[1000] max-w-[230px] bottom-4 right-4"
                        : "h-full w-full"
                }`}
            >
                <div
                    className={`w-full overflow-hidden rounded-[40px] ${
                        !remoteSocketID && "max-w-[530px] -mt-[150px]"
                    }`}
                >
                    <ReactPlayer
                        url={localStream}
                        playing
                        muted
                        loop
                        width={"100%"}
                        height={"100%"}
                    />
                </div>

                <div
                    className={`flex justify-center items-center flex-col ${
                        remoteSocketID ? "hidden" : "flex"
                    }`}
                >
                    <h1 className="text-5xl font-black">No One in the Room</h1>

                    <p className="mt-4 flex gap-2 items-center">
                        <span>Did you send to the correct room ID?</span>
                        <button
                            onClick={handleCopyToClip}
                            className="flex items-center gap-3 border bg-slate-900 p-1.5 rounded-lg text-[13px]"
                        >
                            <Share2 className="w-[17px]" />
                            Share Link
                        </button>
                    </p>
                </div>
            </div>
            <div
                className={`h-full w-full justify-center items-center flex-col relative ${
                    !remoteSocketID ? "hidden" : "flex"
                }`}
            >
                <div className="h-full w-full flex justify-center items-center">
                    <ReactPlayer
                        height={"100%"}
                        width={"100%"}
                        url={remoteStream}
                        playing
                        muted
                        loop
                    />
                </div>
            </div>

            <div className="absolute z-40 bottom-4 left-[50%] translate-x-[-50%] flex gap-5 rounded-xl p-2 bg-white/10 blurry-back">
                <button
                    onClick={sendStreams}
                    className="bg-slate-900/50 blurry-back p-2 rounded-md active:scale-90 outline-none border-none"
                    hidden={!localStream}
                    title="Send Stream"
                >
                    <Send />
                </button>

                <button
                    onClick={handleCallUser}
                    className="bg-slate-900/50 blurry-back p-2 rounded-md active:scale-90 outline-none border-none"
                    hidden={!remoteSocketID}
                    title="Start Call"
                >
                    <PhoneCall />
                </button>

                <button
                    onClick={handleCallUser}
                    className="bg-red-900 p-2 rounded-md active:scale-90 outline-none border-none"
                    hidden
                >
                    <PhoneOff />
                </button>
            </div>
        </div>
    )
}
