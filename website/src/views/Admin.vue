<template>
    <div class="admin">
        <input
            v-model="password"
            type="text"
        >
        <button @click="onClick">
            Send
        </button>
        <h1 class="games-sum">
            {{ games.length }} Games are running.
        </h1>
        <div class="games">
            <span
                v-for="game in games"
                :key="game.name"
            >{{ game.name }} with {{ game.players.length }} players.</span>
        </div>
        <h1 class="players-sum">
            {{ players.length }} Players total
        </h1>
        <div class="players">
            <span
                v-for="player in players"
                :key="player.name"
            >{{ player.name }} </span>
        </div>
    </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import { socket } from '../setup'
export default {
    name: 'Admin',
    setup(props) {
        const password = ref('')
        const games = ref([])
        const players = ref([])

        return {onClick, password, games, players}

        function onClick () {
            socket.emit('games', password.value, (response: any) => {
                if (response.error) return console.error(response.error)
                console.log(response)

                games.value = response
            })
            socket.emit('players', password.value, (response: any) => {
                if (response.error) return console.error(response.error)
                console.log(response)
                players.value = response
            })
        }
    }
}
</script>
<style scoped lang="scss">
.admin {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
