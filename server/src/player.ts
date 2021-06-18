import {difference, remove} from 'lodash'

export class Player {

    sid: string
    name: string
    private hand: string[] = []
    points = 0
    deletedCard = false
    revealPos?: number
    private placedCardsRevealed: boolean = false
    private placedCards: string[] = []

    constructor(sid: string, name: string) {
        this.sid = sid
        this.name = name
    }

    hasCardsPlaced() {
        return this.placedCards.length > 0
    }

    clearPlacedCards() {
        this.placedCards = []
    }

    clearCardsInHand() {
        this.hand = []
    }

    getCardsInHand() {
        return this.hand
    }

    setCardsInHand(cards: string[]) {
        this.hand = cards
    }

    removeCardInHand(card: string) {
        if(this.hand.includes(card) === false) return false
        this.hand = remove(this.hand, card)
        return true
    }

    addCardsInHand(cards: string[]) {
        this.hand = this.hand.concat(cards)
    }

    placeCards(cards: string[]) {
        if(difference(cards, this.hand).length > 0) return false

        this.hand = this.hand.filter(card => cards.includes(card) === false)
        this.placedCards = cards

        return true
    }

    hasCardsRevealed() {
        return this.placedCardsRevealed
    }

    setRevealedCards(revealed: boolean) {
        this.placedCardsRevealed = revealed
    }

    getPlacedCards() {
        return this.placedCards
    }
}