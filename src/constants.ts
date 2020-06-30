export enum SocketEvent {
    CONNECTED = 'connection',
    DISCONNECTED = 'disconnection',
    PUSH_SCORE = 'push_score'
}

export enum EventStatus {
    SUCCESS,
    ERROR,
    WARNING,
    INFO
}