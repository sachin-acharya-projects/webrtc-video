class PeerService {
    peer: RTCPeerConnection | undefined = undefined
    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478",
                        ],
                    },
                ],
            })
        }
    }

    async getAnswer(offer: RTCSessionDescriptionInit) {
        if (this.peer) {
            await this.peer.setRemoteDescription(offer)
            const answer = await this.peer.createAnswer()
            await this.peer.setLocalDescription(new RTCSessionDescription(answer))
            return answer
        }
    }

    async setLocalDescription(answer: RTCSessionDescriptionInit) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(answer))
        }
    }

    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer()
            await this.peer.setLocalDescription(
                new RTCSessionDescription(offer)
            )
            return offer
        }
    }
}


export default new PeerService()