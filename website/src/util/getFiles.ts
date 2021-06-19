import { Deck } from "./types"

export async function getFiles(...files: File[]) {
    const promises = files.map((file, index) => {
        const reader = new FileReader()
        return new Promise((resolve, reject) => {
            reader.onload = (e) => {
                const contents = e.target?.result
                if(typeof contents !== 'string') return
                const deck = JSON.parse(contents);
                resolve(deck)
            }
            reader.onerror = (e) => {
                reject(e)
            }
            reader.readAsText(file)
        })
        
    })

    return await Promise.all(promises) as Deck[]
}