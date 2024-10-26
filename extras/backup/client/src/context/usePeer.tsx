import {
    createContext,
    useContext,
} from "react"

type PeerContextType = {
    peer: RTCPeerConnection
    createOffer: () => Promise<RTCSessionDescriptionInit>
    createAnswer: (
        offer: RTCSessionDescriptionInit
    ) => Promise<RTCSessionDescriptionInit>
    setRemoteAnswer: (offer: RTCSessionDescriptionInit) => Promise<void>
    sendStream: (stream: MediaStream) => Promise<void>
    remoteStream?: MediaStream
}
export const PeerContext = createContext<PeerContextType | null>(null)

export function usePeer() {
    const context = useContext(PeerContext)
    if (context === null) {
        throw new Error("`usePeer` can only be used inside `PeerProvider`")
    }
    return context
}
