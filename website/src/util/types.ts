export type BlackCard = {
    text: string,
    pick: number
}

export type Deck = {
    blackCards: BlackCard[],
    whiteCards: string[]
}