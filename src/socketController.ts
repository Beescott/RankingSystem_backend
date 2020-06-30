import { SocketEvent } from "./constants";

export class SocketController {
    private _socketHandler: SocketIO.Server;

    constructor(handler: SocketIO.Server) {
        this._socketHandler = handler;
        this.listen();
    }

    /**
     * Testing all socket events on https://socketserve.io/
     */
    private listen(): void {
        this._socketHandler.on(SocketEvent.CONNECTED, (socket: any) => {
            console.log('A player has connected');

            socket.on(SocketEvent.DISCONNECTED, (data: any) => {
                console.log('A player has disconnected');
            });
        });
    }
}