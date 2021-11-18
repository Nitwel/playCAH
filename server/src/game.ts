import {Player} from './player'
import {readFileSync, existsSync} from 'fs'
import {shuffle, remove, includes} from 'lodash'
import {join} from 'path'
import { BlackCard, Deck } from './types'

function loadDecks(decks: string[], lang: string){
    let blackCards: BlackCard[] = []
    let whiteCards: string[] = []

    for(let deck of decks) {
        try{
            const file = readFileSync(join(__dirname, './decks', lang, deck + '.json'), 'utf-8')

            const data = JSON.parse(file)
            blackCards = blackCards.concat(data.blackCards)
            whiteCards = whiteCards.concat(data.whiteCards)
        } catch(error) {
            console.error(`Could not load deck ${lang}/${deck}\nError ${error}`)
        }
    }

    return {blackCards, whiteCards}
}

export class Game {

    gameState: 'Lobby' | 'Game' = 'Lobby'
    players: Player[] = []
    disconnectedPlayers: Player[] = []
    host?: string
    cardDecks = ["Base"]
    customDecks: Record<string, Deck> = {}
    blackCard?: BlackCard
    zar = 0
    name: string
    handSize = 7
    pointsToWin = 7
    language = 'en'
    blackCards: BlackCard[] = []
    whiteCards: string[] = []

    constructor(name: string) {
        this.name = name
    }

    getCardDecks() {
        let {whiteCards, blackCards} = loadDecks(this.cardDecks.filter(deck => deck in this.customDecks === false), this.language)

        for(let [name, deck] of Object.entries(this.customDecks)) {
            if(this.cardDecks.includes(name)) {
                whiteCards = whiteCards.concat(deck.whiteCards)
                blackCards = blackCards.concat(deck.blackCards)
            }

        }

        this.blackCards = shuffle(blackCards)
        this.whiteCards = shuffle(whiteCards)
    }

    drawBlack(){
        this.blackCard = this.blackCards.shift()
        if (this.blackCard)
            this.blackCards.push(this.blackCard)
    }

    drawWhite(amount = 1){
        const choosenCards = this.whiteCards.splice(0, amount)
        this.whiteCards = this.whiteCards.concat(choosenCards)
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

    addCustomDeck(sid: string, deck: Deck) {
        this.customDecks[deck.name] = deck
        this.getPlayer(sid)?.uploadedDecks.push(deck.name)
    }

    removeDecksOfPlayer(sid: string) {
        const decks = this.getPlayer(sid)?.uploadedDecks || []
        for(let deck of decks) {
            this.removeCustomDeck(deck)
        }
    }

    removeCustomDeck(name: string) {
        delete this.customDecks[name]
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
        if (player !== undefined) {
            if (this.players.indexOf(player) <= this.zar)
                this.zar = (this.zar + 1) % (this.players.length - 1)

            this.players = this.players.filter(p => p.sid !== player.sid)

            if (this.host == player.sid && this.players.length > 0)
                this.host = this.players[0].sid
            if (this.gameState == "Game")
                this.disconnectedPlayers.push(player)
        }
        return player
    }

    addPlayer(player: Player) {
        this.disconnectedPlayers = this.disconnectedPlayers.filter(p => p.name !== player.name)

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
        const zar = this.getZar();
        return this.players.find(player => player.hasCardsPlaced() === false && player !== zar) === undefined
    }

    allCardsRevealed() {
        const zar = this.getZar();
        return this.players.find(player => player.hasCardsRevealed() === false && player !== zar) === undefined
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

    getCustomDecks() {
        return Object.keys(this.customDecks)
    }
}