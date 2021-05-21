export class Player {

    sid: string
    name: string
    hand: string[] = []
    points = 0
    deletedCard = false
    revealPos: number | undefined = undefined

    constructor(sid: string, name: string) {
        this.sid = sid
        this.name = name
    }
}