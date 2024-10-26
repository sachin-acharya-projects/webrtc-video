//? This is used in index.old.ts
export const enum SocketEventEnum_ {
    JOIN_ROOM = "join-room",
    JOINED_ROOM = "joined-room",

    CALL_USER = "call-user",
    INCOMMING_CALL = "incomming-call",

    CALL_ACCEPT = "call-accept",
    CALL_ACCEPTED = "call-accepted",

    USER_JOINED = "user-joined",

    FLUSH = "flush"
}

export const enum SocketEventEnum {
    ROOM_JOINED = "ROOM:JOINED",
    USER_JOINED = "USER:JOINED",

    ROOM_JOIN = "ROOM:JOIN",
    USER_JOIN = "USER:JOIN",

    USER_CALL = "USER:CALL",
    INCOMMING_CALL = "INCOMMING:CALL",

    CALL_ACCEPTED = "CALL:ACCEPTED",

    PEER_NEGOTIATION_NEEDED = "PEER:NEGOTIATION:NEEDED",
    PEER_NEGOTIATION_DONE = "PEER:NEGOTIATION:DONE",
    PEER_NEGOTIATION_FINAL = "PEER:NEGOTIATION:FINAL",
}
