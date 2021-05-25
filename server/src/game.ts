import {Player} from './player'
import {readFileSync} from 'fs'
import {shuffle, remove, includes} from 'lodash'
 
function loadDecks(decks: string[], lang: string){
    const blackCards: BlackCard[] = []
    const whiteCards: string[] = []

    decks.forEach(deck => {
        const file = readFileSync(`./decks/${lang}/${deck}.json`, 'utf-8')

        const data = JSON.parse(file)
        blackCards.concat(data['blackCards']) 
        whiteCards.concat(data['whiteCards'] )
    })

    return {blackCards, whiteCards}
}

type BlackCard = {
    text: string,
    pick: number
}

export class Game {

    gameState: 'Lobby' | 'Game' = 'Lobby'
    players: Player[] = []
    disconnectedPlayers: Player[] = []
    host?: string
    cardDecks = ["Base"]
    blackCard?: BlackCard
    zar = 0
    name: string
    handSize = 7
    pointsToWin = 5
    language = 'en'
    blackCards: BlackCard[] = []
    whiteCards: string[] = []

    constructor(name: string) {
        this.name = name
    }

    getCardDecks() {
        const decks = loadDecks(this.cardDecks, this.language)

        this.blackCards = decks.blackCards
        this.whiteCards = decks.whiteCards

        this.blackCards = shuffle(this.blackCards)
        this.whiteCards = shuffle(this.whiteCards)
    }

    drawBlack(){
        this.blackCard = this.blackCards.shift()
        if (this.blackCard)
            this.blackCards.push(this.blackCard)
    }

    drawWhite(amount = 1){
        const choosenCards = this.whiteCards.splice(0, amount)
        this.whiteCards.concat(choosenCards)
        return choosenCards
    }
    
    startGame(){
        this.disconnectedPlayers = []
        this.gameState = "Game"
        this.getCardDecks()
        this.clearPlayers()
        this.startRound()
    }

    startRound(){
        this.drawBlack()
        this.nextZar()
        this.clearPlacedCards()

        this.players.forEach(player => {
            player.revealPos = undefined
            player.deletedCard = false
            player.addCardsInHand(this.drawWhite(this.handSize - player.getCardsInHand().length))
        })
    }

    clearPlacedCards() {
        for(const player of this.getAllPlayers()) {
            player.clearPlacedCards()
            player.setRevealedCards(false)
        }
    }

    clearPlayerHands() {
        for(const player of this.getAllPlayers()) {
            player.clearCardsInHand()
        }
    }

    clearPlayers() {
        for(const player of this.getAllPlayers()) {
            player.clearCardsInHand()
            player.clearPlacedCards()
            player.setRevealedCards(false)
            player.points = 0
        }
    }

    getAllPlayers() {
        return [...this.players, ...this.disconnectedPlayers]
    }
        
            
    addPoint(sid: string) {
        this.players.forEach(player => {
            if(player.sid == sid)
                player.points += 1
        })
    }
    endGame() {
        this.gameState = "Lobby"
        this.clearPlacedCards()
        this.blackCard = undefined
        this.zar = 0
        this.disconnectedPlayers = []
    }

    getPlayer(sid: string) {
        return this.players.find(player => player.sid === sid)
    }

    getPlayerWithName(name: string) {
        return this.players.find(player => player.name === name)
    }

    getPlayerWithPos(pos: number) {
        return this.players.find(player => player.revealPos === pos)
    }

    getDisconnectedPlayer(name: string){
        return this.disconnectedPlayers.find(player => player.name === name)
    }
    
    removePlayer(sid: string){
        const player = this.getPlayer(sid)
        if (player) {
            if (this.players.indexOf(player) <= this.zar)
                this.zar = (this.zar - 1) % (this.players.length - 1)

            this.players = remove(this.players, player)

            if (this.host == player.sid && this.players.length > 0)
                this.host = this.players[0].sid
            if (this.gameState == "Game")
                this.disconnectedPlayers.push(player)
        }
        return player
    }

    addPlayer(player: Player) {
        if(this.disconnectedPlayers.includes(player))
            this.disconnectedPlayers = remove(this.disconnectedPlayers, player)

        if (this.getPlayerWithName(player.name) !== undefined)
            return false
        if (this.players.length == 0)
            this.host = player.sid

        if (this.getPlayer(player.sid) === undefined)
            this.players.push(player)
        return true
    }

    nextZar() {
        this.zar = (this.zar + 1) % this.players.length
        return this.zar
    }

    allPlayersPlaced() {
        return this.players.find(player => player.hasCardsPlaced() === false) === undefined
    }

    allCardsRevealed() {
        return this.players.find(player => player.hasCardsRevealed() === false) === undefined
    }

    playerWonGame() {
        for (const player of this.players) {
            if (player.points >= this.pointsToWin)
                return player
        }
        return undefined
    }

    getZar() {
        return this.players[this.zar]
    }

    getHost() {
        return this.host ? this.getPlayer(this.host) : undefined
    }

    isPlayerConnected(player: Player | string) {
        if(typeof player === 'string') {
            return this.getPlayer(player) !== undefined
        } else {
            return this.players.includes(player)
        }
    }
}