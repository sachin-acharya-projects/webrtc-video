export const enum NewSocketEventEnum {
    ROOM_JOINED = "room:joined",
    USER_JOINED = "user:joined",

    ROOM_JOIN = "room:join",
    USER_JOIN = "user:join",

    USER_CALL = "user:call",
    INCOMMING_CALL = "incomming:call",

    CALL_ACCEPTED = "call:accepted",

    PEER_NEGO_NEEDED = "peer:nego:needed",
    PEER_NEGO_DONE = "peer:nego:done",
    PEER_NEGO_FINAL = "peer:nego:final",
}
