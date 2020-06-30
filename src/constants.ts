export enum SocketEvent {
    CONNECTED = 'connection',
    DISCONNECTED = 'disconnection',
    PUSH_SCORE = 'push_score',
    REQUEST_SCORES = 'request_scores',
    SEND_SCORES = 'send_scores',
    REQUEST_PLAYER_SCORE = 'request_player_score',
    SEND_PLAYER_SCORE = 'send_player_score'
}

export enum EventStatus {
    SUCCESS,
    ERROR,
    WARNING,
    INFO
}