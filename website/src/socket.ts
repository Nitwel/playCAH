import {socket, emitter} from './setup'
import router from './router'
import { State } from './store';

import {ActionTree} from "vuex"

export const actions: ActionTree<State, State> = {
    SOCKET_answer ({state}, data) {
        console.log('Got Answer!')
    },
    SOCKET_connect ({state}, data) {
        state.connected = true
      
        console.log('Connected')
    },
    SOCKET_disconnect ({state}, data) {
        state.connected = false
        state.gameState = 'Home'
        this.commit('resetLobby')

        if (['Lobby', 'Game'].includes(state.gameState)) {
            router.push('/lobby/' + state.lobby)
        } else {
            router.push('/')
        }

        emitter.emit('error', 'Disconnected from server')
        console.error('Disconnected')
    },
    SOCKET_player_join ({state}, player) {
        const index = state.users.findIndex(u => u.name === player.name)

        if (index === -1) {
            state.users.push({ name: player.name, placed: false, points: 0, connected: true })
            console.log(`Player ${player.name} has joined`)
            emitter.emit('player_join', player)
        } else {
            state.users[index].connected = true
            emitter.emit('player_connect', player)
        }
    },
    SOCKET_player_leave ({state}, player) {
        const index = state.users.findIndex(u => u.name === player)

        if (state.gameState === 'Game') {
            state.users[index].connected = true
            emitter.emit('player_disconnect', player)
        } else {
            state.users = state.users.filter(p => p.name !== player)
            console.log(`Player ${player} has left`)
            emitter.emit('player_leave', player)
        }
    },
    SOCKET_game_start ({state}, { hand, black, zar }) {
        state.gameState = 'Game'
        emitter.emit('game_start', { hand, black, zar })

        state.users.forEach((user, index) => {
            state.users[index].points = 0
        })

        state.hands = hand
        state.blackCard = formatBlackCard(black)
        state.zar = zar
        router.push('/game/' + state.lobby)
    },
    async SOCKET_next_round ({state}, { hand, black, zar, winner, pos }) {
        emitter.emit('next_round', { hand, black, zar, winner, pos })

        state.posNames = pos
        state.winner = winner
        state.timer = 10

        state.users.forEach((user, index) => {
            if (user.name === winner) state.users[index].points += 1
        })

        while (state.timer > 0) {
            await timeout(1000)
            state.timer -= 1
        }

        state.hands = hand
        state.blackCard = formatBlackCard(black)
        state.zar = zar
        state.revealed = {}
        state.posNames = {}
        state.winner = ''

        state.users.forEach((user, index) => {
            state.users[index].placed = false
        })
    },
    SOCKET_game_end ({state}, points) {
        emitter.emit('game_end', points)
        state.hands = []
        state.blackCard = undefined
        state.zar = undefined
        state.revealed = {}
        state.posNames = {}
        state.winner = ''

        state.users = state.users.filter(u => u.connected)

        state.users.forEach((user, index) => {
            state.users[index].placed = false
            state.users[index].points = points[user.name]
        })

        state.endLobby = true
        state.gameState = 'Lobby'
        router.push(`/lobby/${state.lobby}`)
    },
    SOCKET_cards_placed ({state}, name) {
        emitter.emit('cards_placed', name)
        state.users.forEach((user, index) => {
            if (user.name === name) state.users[index].placed = true
        })
    },
    SOCKET_cards_revealed ({state}, { pos, cards }) {
        emitter.emit('cards_revealed', { pos, cards })
        const audio = new Audio('/sounds/reveal.mp3')
        audio.play()
        emitter.emit('rotate_' + pos)
        state.revealed[pos] = cards
    },
    SOCKET_settings_changed ({state}, settings) {
        emitter.emit('settings_changed', settings)
        state.pointsToWin = settings.points_to_win
        state.handSize = settings.hand_size
        state.cardDecks = settings.card_decks
        state.language = settings.language
    },
    SOCKET_host ({state}, host) {
        emitter.emit('host', host)
        state.host = host
    }
}
export function formatBlackCard (card: {text: string, count: number}) {
    card.text = card.text.replace(/_/g, '____')
    return card
}

function timeout (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
