import { SocketEvent } from "./constants";
import { Player } from "./components/player";

export class SocketController {
    private _socketHandler: SocketIO.Server;
    private _players: Array<Player>;

    constructor(handler: SocketIO.Server) {
        this._socketHandler = handler;
        this._players = new Array<Player>();

        this.listen();
    }

    /**
     * Testing all socket events on https://socketserve.io/
     */
    private listen(): void {
        this._socketHandler.on(SocketEvent.CONNECTED, (socket: any) => {
            console.log('A player has connected');

            socket.on(SocketEvent.PUSH_SCORE, (data: any) => {
                console.log('Requesting a score push');
                this.pushNewScore(data);
            })

            socket.on(SocketEvent.DISCONNECTED, (data: any) => {
                console.log('A player has disconnected');
            });
        });
    }

    /**
     * Takes a JSON as input, if the format is correct, then push the player into the array
     * @param data 
     */
    private pushNewScore(data: any): void {
        // stringify the JSON in order to parse it afterward
        let stringifyData = JSON.stringify(data);
        let receivedPlayer = JSON.parse(stringifyData);

        // Checking to see if the send format is correct
        if (!("name" in receivedPlayer)) {
            return;
        }

        if (!("score" in receivedPlayer)) {
            return;
        }

        // if the received object has more than two 
        let keyNumberInJSON = Object.keys(receivedPlayer).length;
        if (keyNumberInJSON != 2) {
            return;
        }

        // Cast received score into number to check score format
        let receivedPlayerScore = Number(receivedPlayer.score);
        if (isNaN(receivedPlayerScore))
            return;
        
        // TODO : check name format to avoid special character or injection
        let newPlayer: Player = new Player(receivedPlayer.name, receivedPlayerScore);        

        // if the player doesn't exist then push it into the database
        // otherwise update his score
        let existingPlayer = this._players.find(p => p.name == newPlayer.name);
        if (existingPlayer == undefined) {
            // TODO : pushed in order list instead of pushing at the end and just sorting it
            this._players.push(newPlayer);
        }
        else {
            existingPlayer.score = newPlayer.score;
        }

        console.log(this._players);
    }
}