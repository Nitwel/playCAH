import {Player} from './player'
import {readFileSync} from 'fs'
import {shuffle, remove} from 'lodash'
 
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
    disconnected: Player[] = []
    host?: string = undefined
    cardDecks = ["Base"]
    placedCards: Record<string, string[]> = {}
    revealedPlayers: string[] = []
    blackCard?: BlackCard = undefined
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
        this.disconnected = []
        this.gameState = "Game"
        this.getCardDecks()
        this.startRound()
    }

    startRound(){
        this.drawBlack()
        this.nextZar()
        this.revealedPlayers = []
        this.placedCards = {}

        this.players.forEach(player => {
            player.revealPos = undefined
            player.deletedCard = false
            player.hand.concat(this.drawWhite(this.handSize - player.hand.length))
        })
    }
        
            
    addPoint(sid: string) {
        this.players.forEach(player => {
            if(player.sid == sid)
                player.points += 1
        })
    }
    endGame() {
        this.gameState = "Lobby"
        this.placedCards = {}
        this.revealedPlayers = []
        this.blackCard = undefined
        this.zar = 0
        this.disconnected = []
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
        return this.disconnected.find(player => player.name === name)
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
                this.disconnected.push(player)
        }
        return player
    }

    addPlayer(player: Player) {
        if(this.disconnected.includes(player))
            this.disconnected= remove(this.disconnected, player)

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

    playerPlacedCards(sid: string, cards: string[]) {
        this.placedCards[sid] = cards
        const player = this.getPlayer(sid)
        if(player === undefined) return

        for (const card of cards) {
            if(card in player.hand)
                player.hand = remove(player.hand, card)
        }
    }

    allPlayersPlaced() {
        return Object.keys(this.placedCards).length === this.players.length -1
    }

    allCardsRevealed() {
        return this.revealedPlayers.length === this.players.length - 1
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
    
    playerRevealed(sid: string) {
        this.revealedPlayers.push(sid)
    }
    
    isPlayerRevealed(sid: string) {
        return sid in this.revealedPlayers
    }

    updateSid(oldSid: string, newSid: string) {
        if (oldSid in this.placedCards) {
            this.placedCards[newSid] = this.placedCards[oldSid]
            delete this.placedCards[oldSid]

        }
        if (oldSid in this.revealedPlayers) {
            this.revealedPlayers = remove(this.revealedPlayers, oldSid)
            this.revealedPlayers.push(newSid)
        }
    }
}