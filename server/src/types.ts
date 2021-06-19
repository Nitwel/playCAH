export type BlackCard = {
    text: string,
    pick: number
}

export type Deck = {
    name: string
    blackCards: BlackCard[],
    whiteCards: string[]
}