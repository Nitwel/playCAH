import {socket, emitter} from './setup'
import router from './router'
import { store } from './store';

import {ActionTree} from "vuex"

socket.on('answer', ( data) => {
    console.log('Got Answer!')
})

socket.on('connect', () => {
    store.state.connected = true
    console.log('Connected')
})

socket.on('reconnect', () => {
    store.state.connected = true
    console.log('Reconnected')
})

socket.on('disconnect', ( data) => {
    store.state.connected = false
    store.state.gameState = 'Home'
    store.commit('resetLobby')

    if (['Lobby', 'Game'].includes(store.state.gameState)) {
        router.push('/lobby/' + store.state.lobby)
    } else {
        router.push('/')
    }

    emitter.emit('error', 'Disconnected from server')
    console.error('Disconnected')
})
socket.on('player_join', ( player) => {
    const index = store.state.users.findIndex(u => u.name === player.name)

    if (index === -1) {
        store.state.users.push({ name: player.name, placed: false, points: 0, connected: true })
        console.log(`Player ${player.name} has joined`)
        emitter.emit('player_join', player)
    } else {
        store.state.users[index].connected = true
        emitter.emit('player_connect', player)
    }
})
socket.on('player_leave', ( player) => {
    const index = store.state.users.findIndex(u => u.name === player)

    if (store.state.gameState === 'Game') {
        store.state.users[index].connected = false
        emitter.emit('player_disconnect', player)
    } else {
        store.state.users = store.state.users.filter(p => p.name !== player)
        console.log(`Player ${player} has left`)
        emitter.emit('player_leave', player)
    }
})
socket.on('game_start', ( { hand, black, zar }) => {
    store.state.gameState = 'Game'
    emitter.emit('game_start', { hand, black, zar })

    store.state.users.forEach((user, index) => {
        store.state.users[index].points = 0
    })

    store.state.hands = hand
    store.state.blackCard = formatBlackCard(black)
    store.state.zar = zar
    router.push('/game/' + store.state.lobby)
})
socket.on('next_round', async ( { hand, black, zar, winner, pos }) => {
    emitter.emit('next_round', { hand, black, zar, winner, pos })

    store.state.posNames = pos
    store.state.winner = winner
    store.state.timer = 10

    store.state.users.forEach((user, index) => {
        if (user.name === winner) store.state.users[index].points += 1
    })

    while (store.state.timer > 0) {
        await timeout(1000)
        store.state.timer -= 1
    }

    store.state.hands = hand
    store.state.blackCard = formatBlackCard(black)
    store.state.zar = zar
    store.state.revealed = {}
    store.state.posNames = {}
    store.state.winner = ''

    store.state.users.forEach((user, index) => {
        store.state.users[index].placed = false
    })
})
socket.on('game_end', ( points) => {
    router.push(`/lobby/${store.state.lobby}`)
    emitter.emit('game_end', points)
    store.state.hands = []
    store.state.blackCard = undefined
    store.state.zar = undefined
    store.state.revealed = {}
    store.state.posNames = {}
    store.state.winner = ''

    store.state.users = store.state.users.filter(u => u.connected)

    store.state.users.forEach((user, index) => {
        store.state.users[index].placed = false
        store.state.users[index].points = points[user.name]
    })

    store.state.endLobby = true
    store.state.gameState = 'Lobby'
})
socket.on('cards_placed', ( name) => {
    emitter.emit('cards_placed', name)
    store.state.users.forEach((user, index) => {
        if (user.name === name) store.state.users[index].placed = true
    })
})
socket.on('cards_revealed', ( { pos, cards }) => {
    emitter.emit('cards_revealed', { pos, cards })
    const audio = new Audio('/sounds/reveal.mp3')
    audio.play()
    emitter.emit('rotate_' + pos)
    store.state.revealed[pos] = cards
})
socket.on('settings_changed', ( settings) => {
    emitter.emit('settings_changed', settings)
    store.state.pointsToWin = settings.points_to_win
    store.state.handSize = settings.hand_size
    store.state.cardDecks = settings.card_decks
    store.state.language = settings.language
})
socket.on('host', ( host) => {
    emitter.emit('host', host)
    store.state.host = host
})

socket.on('update_custom_decks', (decks) => {
    store.state.customDecks = decks
})

export function formatBlackCard (card: {text: string, pick: number}) {
    card.text = card.text.replace(/_/g, '____')
    return card
}

function timeout (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
