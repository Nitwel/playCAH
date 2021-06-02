import {Server, Socket} from "socket.io"
import {createServer} from 'http'
import { House } from "./house"
import { Player } from "./player"
import { random, remove } from "lodash"

const server = createServer()
const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

server.listen(3001, () => {
    console.log("listening on *:3001")
})

const house = new House()

io.on('connection', (socket: Socket) => {
    console.log("connected ", socket.id)
    
    socket.on('join', (name, lobby, callback) => {
        console.log("joining")
    
        const game = house.getGame(lobby)
        const disconnectedPlayer = game.getDisconnectedPlayer(socket.id)

        

        if (disconnectedPlayer !== undefined) {
            socket.join(lobby)
            game.addPlayer(disconnectedPlayer)
            disconnectedPlayer.sid = socket.id
            socket.to(lobby).emit('player_join', {name: disconnectedPlayer.name})
            const host = game.getHost()

            const players = []
            const revealed: Record<string, any> = {}

            for (const player of game.getAllPlayers()) {
                const playerData: Record<string, any> = {
                    name: player.name,
                    points: player.points
                }
                playerData.placed = player.hasCardsRevealed() || player.hasCardsPlaced()
                playerData.connected = game.players.includes(player)

                players.push(playerData)

                if(player.hasCardsRevealed() && player.revealPos) {
                    revealed[player.revealPos] = player.getPlacedCards()
                }
            }

            callback({
                players,
                revealed,
                host: game.host,
                points_to_win: game.pointsToWin,
                hand_size: game.handSize,
                card_decks: game.cardDecks,
                hand: disconnectedPlayer.getCardsInHand(),
                black: game.blackCard,
                zar: game.getZar().name
            })
        }

        if (game.gameState !== 'Lobby') {
            return callback({error: "Game already running."})
        }

        const player = new Player(socket.id, name)

        if(game.addPlayer(player) === false)
            return callback({ error: "Player name already taken."})

        socket.join(lobby)

        socket.to(lobby).emit('player_join', {name: player.name})
        
        callback({
            players: game.getAllPlayers().map(player => ({
                name: player.name,
                points: 0,
                connected: game.isPlayerConnected(player)
            })),
            host: game.getHost()?.name,
            points_to_win: game.pointsToWin,
            hand_size: game.handSize,
            card_decks: game.cardDecks,
            language: game.language
        })
    })

    socket.on('start_game', (callback) => {
        const game = house.getGameOfPlayer(socket.id)
        
        if( game === undefined) return callback({error: "You are not in a lobby."})

        if( game.getHost()?.sid !== socket.id ) return callback({error: "You are not the host."})

        if( game.players.length < 3) return callback({error: "You need at least 3 players in the lobby."})

        game.startGame()

        for(const player of game.players) {
            io.to(player.sid).emit('game_start', {
                hand: player.getCardsInHand(),
                black: game.blackCard,
                zar: game.getZar().name
            })
        }
        
    })

    socket.on('place_cards', (cards, callback) => {
        const game = house.getGameOfPlayer(socket.id)

        if( game === undefined ) return callback({ error: "You are currently not in a game."})

        const player = game.getPlayer(socket.id)

        if( player === undefined) return

        player.placeCards(cards)

        io.to(game.name).emit('cards_placed', player.name)
    })

    socket.on('reveal', (position, callback) => {
        const game = house.getGameOfPlayer(socket.id)

        if ( game === undefined ) return callback({ error: "You are currently not in a game."})

        const zar = game.getZar()

        if(zar.sid !== socket.id) return callback({ error: "You are currently not the zar."})

        const unrevealedPlayers = game.players.filter(player => player.sid !== socket.id && player.hasCardsRevealed() === false)

        if (unrevealedPlayers.length === 0) return callback({error: "All players are revealed."})

        const player = unrevealedPlayers[Math.floor(unrevealedPlayers.length * Math.random())]

        player.setRevealedCards(true)

        player.revealPos = position

        io.to(game.name).emit("cards_revealed", {pos: position, cards: player.getPlacedCards()})
    })

    socket.on('winner_selected', (position, callback) => {
        const game = house.getGameOfPlayer(socket.id)

        if ( game === undefined ) return callback({ error: "You are currently not in a game."})

        if( game.getZar().sid !== socket.id) return callback({error: "You are not the zar."})

        if( game.allCardsRevealed() === false) return callback({ error: "Not all cards are revealed yet."})

        const winningPlayer = game.getPlayerWithPos(position)

        if (winningPlayer === undefined) return callback({ error: "player could not be found."})

        winningPlayer.points += 1

        if ( winningPlayer.points >= game.pointsToWin) {
            game.endGame()
            
            const points: Record<string, number> = {}
            game.players.forEach(player => points[player.name] = player.points)

            io.to(game.name).emit('game_end', points)
        } else {
            const playerPositions: Record<number, string> = {}

            game.players.forEach(player => {
                if(player.revealPos) playerPositions[player.revealPos] = player.name
            })

            game.startRound()

            game.players.forEach(player => {
                io.to(player.sid).emit('next_round', {
                    hand: player.getCardsInHand(),
                    black: game.blackCard,
                    zar: game.getZar().name,
                    winner: winningPlayer.name,
                    pos: playerPositions
                })
            })
        }
    })

    socket.on('change_settings', (settings: Record<string, any>, callback) => {
        const game = house.getGameOfPlayer(socket.id)

        if ( game === undefined ) return callback({ error: "You are currently not in a game."})

        if( game.getHost()?.sid !== socket.id) return callback({error: "You are not the host."})

        if( game.gameState !== 'Lobby') return callback({ error: "Settings can only be changed in the lobby."})

        if('cards_decks' in settings && Array.isArray(settings.card_decks)) game.cardDecks = settings.card_decks

        if('points_to_win' in settings && typeof settings.points_to_win === 'number') game.pointsToWin = settings.points_to_win

        if('hand_size' in settings && typeof settings.hand_size === 'number') game.handSize = settings.hand_size

        if('language' in settings && typeof settings.hand_size === 'string') game.language = settings.language

        io.to(game.name).emit('settings_changed', settings)

        return callback({ info: "Settings habe been changed."})
    })

    socket.on('delete_card', (card, callback) => {

        const game = house.getGameOfPlayer(socket.id)

        if ( game === undefined ) return callback({ error: "You are currently not in a game."})

        const player = game.getPlayer(socket.id)

        if(player === undefined) return

        if(player.deletedCard) return callback({ error: "You already deleted a card."})

        if ( player.removeCardInHand(card) === false) return callback({error: "The card doesn't exist in your hand."})

        player.deletedCard = true
    })

    socket.on('games', (password, callback) => {
        if(password !== "Umpa Lumpas") return callback({ error: "Wrong password."})

        return callback(house.games)
    })

    socket.on('leave', disconnectPlayer)
    socket.on('disconnect', disconnectPlayer)

    function disconnectPlayer() {
        console.log("Disconnecting", socket.id)
        const game = house.getGameOfPlayer(socket.id)
    
        if( game === undefined) return

        socket.leave(game.name)
    
        if ( game.players.length === 1) {
            house.games = house.games.filter(g => g.name !== game.name)
            return
        }
    
        const zar = game.getZar()
        const player = game.removePlayer(socket.id)
    
        if(player === undefined) return
    
        io.to(game.name).emit('host', game.getHost()?.name)
        io.to(game.name).emit('player_leave', player.name)
    
        if(game.gameState === 'Lobby') return
    
        if (game.players.length < 3) {
            game.endGame()
            const points: Record<string, number> = {}
    
            game.players.forEach(player => points[player.name] = player.points)
    
            io.to(game.name).emit('game_end', points)
        } else if(player === zar) {
            game.startRound()
    
            game.players.forEach(player => io.to(player.sid).emit('next_round', {
                hand: player.getCardsInHand(),
                black: game.blackCard,
                zar: game.getZar().name,
                winner: ''
            }))
        }
    }

    
})