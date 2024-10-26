import {
    PropsWithChildren,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react"
import { PeerContext } from "@/context/usePeer"

export default function PeerProvider({ children }: PropsWithChildren) {
    const [remoteStream, setRemoteStream] = useState<MediaStream>()
    const peer = useMemo(
        () =>
            new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478",
                        ],
                    },
                ],
            }),
        []
    )

    async function createOffer() {
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        return offer
    }

    async function createAnswer(offer: RTCSessionDescriptionInit) {
        await peer.setRemoteDescription(offer)
        const answer = await peer.createAnswer(offer)
        await peer.setLocalDescription(answer)
        return answer
    }

    async function setRemoteAnswer(answer: RTCSessionDescriptionInit) {
        await peer.setRemoteDescription(answer)
    }

    async function sendStream(stream: MediaStream) {
        const tracks = stream.getTracks()
        for (const track of tracks) {
            peer.addTrack(track, stream)
        }
    }

    const handlePeerTrackEvent = useCallback((ev: RTCTrackEvent) => {
        const streams = ev.streams
        setRemoteStream(streams[0])
    }, [])

    useEffect(() => {
        peer.addEventListener("track", handlePeerTrackEvent)

        return () => {
            peer.removeEventListener("track", handlePeerTrackEvent)
        }
    }, [peer, handlePeerTrackEvent])
    return (
        <PeerContext.Provider
            value={{
                peer,
                createOffer,
                createAnswer,
                setRemoteAnswer,
                sendStream,
                remoteStream,
            }}
        >
            {children}
        </PeerContext.Provider>
    )
}
