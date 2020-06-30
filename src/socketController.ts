import { SocketEvent } from "./constants";
import { Player } from "./components/player";
import { jsonFileController } from "./components/jsonFileController";


export class SocketController {
    private _socketHandler: SocketIO.Server;
    private _players: Array<Player>;
    private _fileController: jsonFileController;

    constructor(handler: SocketIO.Server) {
        this._socketHandler = handler;
        this._players = new Array<Player>();
        
        this._players = jsonFileController.readRankingFile();
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
                jsonFileController.savePlayerListInFile(this._players);
            })

            socket.on(SocketEvent.REQUEST_SCORES, (data: number) => {
                let requestedPlayers = this.getScores(data);
                socket.emit(SocketEvent.SEND_SCORES, requestedPlayers);
            });

            socket.on(SocketEvent.REQUEST_PLAYER_SCORE, (data: string) => {
                let requestedPlayer = this.getPlayerScore(data);
                socket.emit(SocketEvent.SEND_PLAYER_SCORE, requestedPlayer);
            });

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

    /**
     * @param data number of wanted players to send
     * @return the specified number of players, or the whole players array if number is out of bound
     */
    private getScores(nPlayers: number): Array<Player> {
        console.log('Scores requested');
        if (isNaN(nPlayers)) {
            return;
        }
        
        if (nPlayers <= 0 || nPlayers >= this._players.length) {
            return this._players;
        }

        let subArray = this._players.slice(0, nPlayers);
        return subArray;
    }

    /**
     * Check for all players in database to see if the player exists
     * if he does, returns him
     * @param playerName 
     * @return the requested player
     */
    private getPlayerScore(playerName: string): Player {
        let p: Player = undefined;
        for (let index = 0; index < this._players.length; index++) {
            const player: Player = this._players[index];
            if (player.name == playerName)
            {
                p = player;
                break;
            }
        }

        return p;
    }
}