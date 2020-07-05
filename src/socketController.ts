import { SocketEvent, EventStatus } from './constants';
import { Player } from './components/player';
import { jsonFileController } from './components/jsonFileController';
import { EventStatusController } from './components/eventStatusController';
import { reverse } from 'dns';

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
            socket.emit(SocketEvent.EVENT_STATUS, { status: EventStatus.SUCCESS, message: 'Successfully connected to the server' });

            socket.on(SocketEvent.PING, (data: any) => {
                console.log('Pinged server');
                socket.emit(SocketEvent.PONG);
                socket.emit(SocketEvent.EVENT_STATUS, { status: EventStatus.SUCCESS, message: 'Success!!' });
            });

            socket.on(SocketEvent.PUSH_SCORE, (data: any) => {
                console.log('Score push requested');
                let pushResult = this.pushNewScore(data);

                socket.emit(SocketEvent.EVENT_STATUS, pushResult);

                // only save the file if the push was successfull
                if (pushResult.status == EventStatus.SUCCESS) {
                    this.sortPlayersArray();
                    jsonFileController.savePlayerListInFile(this._players);
                }
            })

            socket.on(SocketEvent.REQUEST_SCORES, (data: any) => {
                console.log('Scores requested');
                let requestScoreResult = this.getScores(data);

                socket.emit(SocketEvent.EVENT_STATUS, requestScoreResult.status);

                if (requestScoreResult.status.status == EventStatus.SUCCESS)
                    socket.emit(SocketEvent.SEND_SCORES, { players: requestScoreResult.players });

            });

            socket.on(SocketEvent.REQUEST_PLAYER_SCORE, (data: any) => {
                console.log('Player score requested');
                let requestPlayerResult = this.getPlayerScore(data);

                socket.emit(SocketEvent.EVENT_STATUS, requestPlayerResult.status);

                socket.emit(SocketEvent.SEND_PLAYER_SCORE, { player: requestPlayerResult.player });
            });

            socket.on(SocketEvent.REMOVE_PLAYER, (data: string) => {
                console.log('Remove player requested');
                let removePlayerResult = this.removePlayerScore(data);

                socket.emit(SocketEvent.EVENT_STATUS, removePlayerResult);

                if (removePlayerResult.status == EventStatus.SUCCESS) {
                    jsonFileController.savePlayerListInFile(this._players);
                    socket.emit(SocketEvent.PLAYER_REMOVED);
                }
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
    private pushNewScore(data: any): EventStatusController {
        // stringify the JSON in order to parse it afterward
        let stringifyData = JSON.stringify(data);
        let receivedPlayer = JSON.parse(stringifyData);

        // Checking to see if the send format is correct
        if (!("name" in receivedPlayer)) {
            return { status: EventStatus.ERROR, message: 'A field "name" is lacking in the received player' };
        }

        if (!("score" in receivedPlayer)) {
            return { status: EventStatus.ERROR, message: 'A field "score" is lacking in the received player' };
        }

        if (typeof receivedPlayer.name == 'undefined' || !receivedPlayer.name) {
            return { status: EventStatus.ERROR, message: 'The field name can not be empty' };
        }

        // if the received object has more than two 
        let keyNumberInJSON = Object.keys(receivedPlayer).length;
        if (keyNumberInJSON != 2) {
            return { status: EventStatus.ERROR, message: 'There is more than 2 fields in the received player' };
        }

        // Cast received score into number to check score format
        let receivedPlayerScore = Number(receivedPlayer.score);
        if (isNaN(receivedPlayerScore))
            return { status: EventStatus.ERROR, message: 'The "score" field is not a number' };

        if (receivedPlayerScore > 1e+10)
            return { status: EventStatus.ERROR, message: 'The score is too big' };

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

        console.log('pushed player : ' + JSON.stringify(newPlayer));
        return { status: EventStatus.SUCCESS, message: 'Successfully pushed score' };
    }

    /**
     * @param data number of wanted players to send
     * @return the specified number of players, or the whole players array if number is out of bound
     */
    private getScores(data: any): { status: EventStatusController, players?: Array<Player> } {
        let nPlayers = Number(data.numberPlayers);
        if (isNaN(nPlayers)) {
            let status = { status: EventStatus.ERROR, message: 'Get_score : the argument is not a number' };
            return { status };
        }

        if (nPlayers <= 0 || nPlayers >= this._players.length) {
            return { status: { status: EventStatus.SUCCESS, message: 'Successfully retrieved scores' }, players: this._players };
        }

        let subArray = this._players.slice(0, nPlayers);
        return { status: { status: EventStatus.SUCCESS, message: 'Successfully retrieved scores' }, players: subArray };
    }

    /**
     * Check for all players in database to see if the player exists
     * if he does, returns him
     * @param playerName 
     * @return the requested player
     */
    private getPlayerScore(data: any): { status: EventStatusController, player: Player } {
        let playerName: string = data.playerName;
        let p: Player = this.getPlayerInArray(playerName);

        let eventStatus: EventStatus = p == undefined ? EventStatus.ERROR : EventStatus.SUCCESS;
        let messageStatus: string = p == undefined ? 'Get player score: player is not in database' : 'successfully got player';

        let eventStatusController: EventStatusController = { status: eventStatus, message: messageStatus };
        return { status: eventStatusController, player: p };
    }

    /**
     * Remove a player from the server players' list
     * @param playerName 
     */
    private removePlayerScore(data: any): EventStatusController {
        let playerName: string = data.playerName;
        let p: Player = this.getPlayerInArray(playerName);

        let eventStatus: EventStatus = p == undefined ? EventStatus.ERROR : EventStatus.SUCCESS;
        let messageStatus: string = p == undefined ? 'Remove player score: player is not in database' : 'successfully removed player score';

        if (p != undefined) {
            const index = this._players.indexOf(p, 0);
            this._players.splice(index, 1);
        }

        let eventStatusController: EventStatusController = { status: eventStatus, message: messageStatus };
        return eventStatusController;
    }

    /**
     * return a player if the specified name is in the players' list
     * @param playerName 
     * @return Player
     */
    private getPlayerInArray(playerName: string): Player {
        let p: Player = undefined;
        for (let index = 0; index < this._players.length; index++) {
            const player: Player = this._players[index];
            if (player.name == playerName) {
                p = player;
                break;
            }
        }

        return p;
    }

    /**
     * Sort the players' array
     * TODO : do not use this function, as it is planned to insert in an ordered list
     * TODO : instead of sorting the array every time
     */
    private sortPlayersArray(): void {
        this._players.sort((a: Player, b: Player) => b.score - a.score);
    }
}