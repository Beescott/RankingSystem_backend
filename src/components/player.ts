export class Player {
    private _name: string;
    private _score: number;

    constructor(name: string, score: number) {
        this._name  = name;
        this._score = score;
    }

    //#region getters and setters
    get name(): string {
        return this._name;
    }

    get score(): number {
        return this._score;
    }

    set score(s: number) {
        // only update score if specified number is higher than actual score
        this._score = Math.max(this.score, s);
        // this._score = s;
    }
    //#endregion
}