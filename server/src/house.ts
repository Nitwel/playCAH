import {Game} from './game'

export class House {

    games: Game[] = []

    constructor() {
        
    }
    
    getGame(gameName: string) {
        let game = this.games.find(game => game.name === gameName)

        if(game === undefined) {
            game = new Game(gameName)
        }
        return game
    }
    
    gameExists(gameName: string) {
        return this.games.find(game => game.name === gameName) !== undefined
    }
    
    getGameOfPlayer(sid: string) {
        return this.games.find(game => game.getPlayer(sid) !== undefined)
    }
}


