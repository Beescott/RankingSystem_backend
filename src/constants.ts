export enum SocketEvent {
    CONNECTED = 'connection',
    DISCONNECTED = 'disconnection',
    PING = 'ping',
    PONG = 'pong',
    PUSH_SCORE = 'push_score',
    REQUEST_SCORES = 'request_scores',
    SEND_SCORES = 'send_scores',
    REQUEST_PLAYER_SCORE = 'request_player_score',
    SEND_PLAYER_SCORE = 'send_player_score',
    EVENT_STATUS = 'event_status',
    REMOVE_PLAYER = 'remove_player',
    PLAYER_REMOVED = 'player_removed'
}

export enum EventStatus {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
}