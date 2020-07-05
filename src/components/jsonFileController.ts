import { Player } from './player';

const path = require('path');
const fs = require('fs');

// Path of the json file
const urlToRankingsFile: string = path.resolve(__dirname + '/../../res/', 'rankings.json');

export class jsonFileController {
    /**
     * Read JSON file and save content into an array of players
     */
    public static readRankingFile(): Array<Player> {
        let allPlayers: Array<Player> = new Array<Player>();
        // ReadFileSync to block all activities until the file is read
        let rawData = fs.readFileSync(urlToRankingsFile);
        let dataJSON = JSON.parse(rawData);

        dataJSON.forEach(data => {
            let newPlayer = new Player(data._name, Number(data._score));
            allPlayers.push(newPlayer);
        });

        console.log('rankings.json file read successfully');

        return allPlayers;
    }

    /**
     * Save players into the ranking file
     * TODO : only add the new player into the file, don't need to rewrite everything everytime
     * ? Might have a concurrency problem when writing in the file
     */
    public static savePlayerListInFile(allPlayers: Array<Player>): void {
        let playersJSON = JSON.stringify(allPlayers);
        fs.writeFileSync(urlToRankingsFile, playersJSON);
    }
}